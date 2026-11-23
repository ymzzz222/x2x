create table x2x_private.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name text not null check (length(name) between 1 and 120),
  default_role text check (default_role in ('view', 'edit'))
);
create table x2x_private.workspace_members (
  workspace_id uuid not null references x2x_private.workspaces(id) on delete cascade,
  email text not null,
  primary key (workspace_id, email)
);
create table x2x_private.workspace_groups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references x2x_private.workspaces(id) on delete cascade,
  parent_id uuid references x2x_private.workspace_groups(id),
  kind text not null check (kind in ('group', 'department')),
  name text not null check (length(name) between 1 and 120)
);
create table x2x_private.group_members (
  group_id uuid not null references x2x_private.workspace_groups(id) on delete cascade,
  email text not null,
  primary key (group_id, email)
);
create table x2x_private.group_rights (
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  group_id uuid not null references x2x_private.workspace_groups(id) on delete cascade,
  role text not null check (role in ('view', 'edit')),
  primary key (document_id, group_id)
);
create table x2x_private.access_requests (
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  actor uuid not null references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  primary key (document_id, actor)
);
alter table x2x_private.documents
  add column workspace_id uuid references x2x_private.workspaces(id),
  add column inherited_role text check (inherited_role in ('view', 'edit'));

alter table x2x_private.workspaces enable row level security;
alter table x2x_private.workspace_members enable row level security;
alter table x2x_private.workspace_groups enable row level security;
alter table x2x_private.group_members enable row level security;
alter table x2x_private.group_rights enable row level security;
alter table x2x_private.access_requests enable row level security;

create function x2x_private.in_workspace(p_workspace uuid, p_actor uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from x2x_private.workspaces w where w.id = p_workspace
    and (w.owner_id = p_actor or exists (
      select 1 from x2x_private.workspace_members m join auth.users u on lower(u.email) = m.email
      where m.workspace_id = w.id and u.id = p_actor and u.email_confirmed_at is not null
    ))
  )
$$;

create or replace function x2x_private.role_for(p_document uuid, p_actor uuid)
returns text language plpgsql stable security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  v_role text;
  v_inherited text;
begin
  select * into d from x2x_private.documents where id = p_document;
  if not found or p_actor is null then return null; end if;
  if d.owner_id = p_actor then return 'manage'; end if;
  select m.role into v_role
  from x2x_private.members m join auth.users u on lower(u.email) = m.email and u.email_confirmed_at is not null
  where m.document_id = p_document and u.id = p_actor;
  if found then return v_role; end if;

  if x2x_private.in_workspace(d.workspace_id, p_actor) then
    with recursive memberships(id, parent_id) as (
      select g.id, g.parent_id from x2x_private.workspace_groups g
      join x2x_private.group_members m on m.group_id = g.id
      join auth.users u on lower(u.email) = m.email and u.email_confirmed_at is not null
      where g.workspace_id = d.workspace_id and u.id = p_actor
      union
      select g.id, g.parent_id from x2x_private.workspace_groups g join memberships m on m.parent_id = g.id
      where g.workspace_id = d.workspace_id
    )
    select gr.role into v_inherited from x2x_private.group_rights gr join memberships m on m.id = gr.group_id
    where gr.document_id = d.id order by gr.role asc limit 1;
    if v_inherited = 'edit' or d.inherited_role = 'edit' then return 'edit'; end if;
    v_inherited := coalesce(v_inherited, d.inherited_role);
  end if;
  select l.role into v_role from x2x_private.share_links l
  join x2x_private.link_members lm on lm.link_id = l.id
  where l.document_id = p_document and not l.disabled and lm.user_id = p_actor;
  return coalesce(v_role, v_inherited);
end;
$$;

drop function public.x2x_create_document(uuid,text,text);
create function public.x2x_create_document(p_actor uuid, p_title text, p_snapshot text, p_workspace uuid)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_default text;
begin
  if p_workspace is not null then
    perform 1 from x2x_private.workspaces where id = p_workspace for share;
    if not x2x_private.in_workspace(p_workspace, p_actor) then raise sqlstate 'PT403' using message = 'WORKSPACE_DENIED'; end if;
    select default_role into v_default from x2x_private.workspaces where id = p_workspace;
  end if;
  insert into x2x_private.documents(owner_id, title, snapshot, workspace_id, inherited_role)
  values (p_actor, p_title, decode(p_snapshot, 'base64'), p_workspace, v_default) returning id into v_id;
  return v_id;
end;
$$;

create function public.x2x_workspaces(p_actor uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', w.id, 'name', w.name, 'owner', w.owner_id = p_actor, 'defaultRole', w.default_role,
    'members', case when w.owner_id = p_actor then (
      select coalesce(jsonb_agg(email order by email), '[]'::jsonb)
      from x2x_private.workspace_members where workspace_id = w.id) else '[]'::jsonb end,
    'groups', case when w.owner_id = p_actor then (
      select coalesce(jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name, 'kind', g.kind, 'parent', g.parent_id,
        'members', (select coalesce(jsonb_agg(email order by email), '[]'::jsonb) from x2x_private.group_members where group_id = g.id)
      ) order by g.name), '[]'::jsonb) from x2x_private.workspace_groups g where g.workspace_id = w.id
    ) else '[]'::jsonb end
  ) order by w.name), '[]'::jsonb) from x2x_private.workspaces w where x2x_private.in_workspace(w.id, p_actor)
$$;

create function public.x2x_change_workspace(p_actor uuid, p_action text, p_workspace uuid,
  p_name text, p_kind text, p_group uuid, p_parent uuid, p_email text, p_role text, p_enabled boolean)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_action = 'create' then
    insert into x2x_private.workspaces(owner_id, name) values (p_actor, p_name) returning id into v_id;
    return v_id;
  end if;
  perform 1 from x2x_private.workspaces where id = p_workspace and owner_id = p_actor for update;
  if not found then raise sqlstate 'PT403' using message = 'WORKSPACE_DENIED'; end if;
  perform 1 from x2x_private.documents where workspace_id = p_workspace order by id for update;
  case p_action
    when 'new-group' then
      if p_parent is not null and not exists (select 1 from x2x_private.workspace_groups where id = p_parent and workspace_id = p_workspace) then
        raise sqlstate 'PT400' using message = 'INVALID_GROUP';
      end if;
      insert into x2x_private.workspace_groups(workspace_id, parent_id, kind, name)
      values (p_workspace, p_parent, p_kind, p_name) returning id into v_id;
    when 'workspace-member' then
      if p_enabled then
        insert into x2x_private.workspace_members values (p_workspace, p_email) on conflict do nothing;
      else
        delete from x2x_private.group_members where email = p_email and group_id in (
          select id from x2x_private.workspace_groups where workspace_id = p_workspace
        );
        delete from x2x_private.workspace_members where workspace_id = p_workspace and email = p_email;
      end if;
    when 'group-member' then
      if not exists(select 1 from x2x_private.workspace_groups where id = p_group and workspace_id = p_workspace) then
        raise sqlstate 'PT400' using message = 'INVALID_GROUP';
      end if;
      if p_enabled then
        if not exists(select 1 from x2x_private.workspace_members where workspace_id = p_workspace and email = p_email) then
          raise sqlstate 'PT409' using message = 'WORKSPACE_MEMBER_REQUIRED';
        end if;
        insert into x2x_private.group_members values (p_group, p_email) on conflict do nothing;
      else
        delete from x2x_private.group_members where group_id = p_group and email = p_email;
      end if;
    when 'defaults' then
      update x2x_private.workspaces set default_role = p_role where id = p_workspace;
    else raise sqlstate 'PT400' using message = 'UNKNOWN_ACTION';
  end case;
  update x2x_private.documents set access_version = access_version + 1 where workspace_id = p_workspace;
  return coalesce(v_id, p_workspace);
end;
$$;

create function public.x2x_workspace_rights(p_actor uuid, p_document uuid, p_group uuid, p_role text, p_change boolean)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
begin
  select * into d from x2x_private.documents where id = p_document for update;
  if x2x_private.role_for(p_document, p_actor) is distinct from 'manage' then
    raise sqlstate 'PT403' using message = 'MANAGE_DENIED';
  end if;
  if p_change then
    if d.workspace_id is null then raise sqlstate 'PT400' using message = 'WORKSPACE_REQUIRED'; end if;
    if p_group is null then update x2x_private.documents set inherited_role = p_role where id = d.id;
    else
      if not exists (select 1 from x2x_private.workspace_groups where id = p_group and workspace_id = d.workspace_id) then
        raise sqlstate 'PT400' using message = 'INVALID_GROUP';
      end if;
      if p_role is null then delete from x2x_private.group_rights where document_id = d.id and group_id = p_group;
      else insert into x2x_private.group_rights values (d.id, p_group, p_role)
        on conflict (document_id, group_id) do update set role = excluded.role;
      end if;
    end if;
    update x2x_private.documents set access_version = access_version + 1 where id = d.id;
  end if;
  return jsonb_build_object(
    'workspace', (select name from x2x_private.workspaces where id = d.workspace_id),
    'inheritedRole', (select inherited_role from x2x_private.documents where id = d.id),
    'groups', (select coalesce(jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name, 'role', r.role) order by g.name), '[]'::jsonb)
      from x2x_private.workspace_groups g left join x2x_private.group_rights r on r.document_id = d.id and r.group_id = g.id
      where g.workspace_id = d.workspace_id),
    'requests', (select coalesce(jsonb_agg(jsonb_build_object('email', u.email) order by q.requested_at), '[]'::jsonb)
      from x2x_private.access_requests q join auth.users u on u.id = q.actor
      where q.document_id = d.id and x2x_private.role_for(d.id, q.actor) is null)
  );
end;
$$;

create function public.x2x_request_access(p_actor uuid, p_document uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  insert into x2x_private.access_requests(document_id, actor)
  select id, p_actor from x2x_private.documents where id = p_document and x2x_private.role_for(id, p_actor) is null
  on conflict do nothing;
end;
$$;

revoke execute on function x2x_private.in_workspace(uuid,uuid) from public, anon, authenticated;
revoke execute on function
  public.x2x_create_document(uuid,text,text,uuid), public.x2x_workspaces(uuid),
  public.x2x_change_workspace(uuid,text,uuid,text,text,uuid,uuid,text,text,boolean),
  public.x2x_workspace_rights(uuid,uuid,uuid,text,boolean), public.x2x_request_access(uuid,uuid)
from public, anon, authenticated;
grant execute on function
  public.x2x_create_document(uuid,text,text,uuid), public.x2x_workspaces(uuid),
  public.x2x_change_workspace(uuid,text,uuid,text,text,uuid,uuid,text,text,boolean),
  public.x2x_workspace_rights(uuid,uuid,uuid,text,boolean), public.x2x_request_access(uuid,uuid)
to service_role;
