alter table x2x_private.documents
  add column classification text not null default 'normal' check (classification in ('normal','internal','restricted')),
  add column watermark boolean not null default false,
  add column external_share boolean not null default true,
  add column action_rules jsonb not null default '{}'::jsonb;
create table x2x_private.protection_approvals (
  document_id uuid primary key references x2x_private.documents(id) on delete cascade,
  actor uuid not null references auth.users(id),
  requested text not null check (requested in ('normal','internal')),
  requested_at timestamptz not null default now()
);
create table x2x_private.audit (
  id bigint generated always as identity primary key,
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  actor uuid not null references auth.users(id),
  operation text not null,
  occurred_at timestamptz not null default now()
);
alter table x2x_private.protection_approvals enable row level security;
alter table x2x_private.audit enable row level security;

create function x2x_private.action_allowed(p_document uuid, p_actor uuid, p_action text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select coalesce((
    select case when r.role = 'manage' then true when r.role is null then false
      else coalesce((d.action_rules -> r.role ->> p_action)::boolean, true) end
    from x2x_private.documents d cross join lateral (select x2x_private.role_for(d.id, p_actor) as role) r
    where d.id = p_document
  ), false)
$$;

create function x2x_private.check_protected_link()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if not new.disabled and not exists (
    select 1 from x2x_private.documents where id = new.document_id and external_share and classification = 'normal'
  ) then raise sqlstate 'PT403' using message = 'EXTERNAL_SHARING_DISABLED'; end if;
  return new;
end;
$$;
create trigger x2x_protected_link before insert on x2x_private.share_links
for each row execute function x2x_private.check_protected_link();

create function x2x_private.check_comment_permission()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if not x2x_private.action_allowed(new.document_id, new.actor, 'comment') then
    raise sqlstate 'PT403' using message = 'COMMENT_DENIED';
  end if;
  return new;
end;
$$;
create trigger x2x_comment_permission before insert on x2x_private.comments
for each row execute function x2x_private.check_comment_permission();

create function public.x2x_read_policy(p_actor uuid, p_document uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  v_role text;
begin
  select * into d from x2x_private.documents where id = p_document for share;
  v_role := x2x_private.role_for(p_document, p_actor);
  if v_role is null then raise sqlstate 'PT403' using message = 'ACCESS_DENIED'; end if;
  return jsonb_build_object(
    'classification', d.classification, 'watermark', d.watermark, 'externalShare', d.external_share,
    'allowed', (select jsonb_object_agg(op, x2x_private.action_allowed(d.id, p_actor, op)) from
      unnest(array['comment','copy','print','download','duplicate']) op),
    'rules', case when v_role = 'manage' then d.action_rules else '{}'::jsonb end,
    'approval', case when v_role = 'manage' then
      (select requested from x2x_private.protection_approvals where document_id = d.id) end,
    'accessCount', case when v_role = 'manage' then
      (select count(*) from x2x_private.presence where document_id = d.id) end,
    'audit', case when v_role = 'manage' then (
      select coalesce(jsonb_agg(to_jsonb(item)), '[]'::jsonb) from (
        select a.id, a.operation, a.occurred_at as "at", split_part(u.email, '@', 1) as author
        from x2x_private.audit a join auth.users u on u.id = a.actor where a.document_id = d.id order by a.id desc limit 50
      ) item
    ) else '[]'::jsonb end
  );
end;
$$;

create function public.x2x_change_policy(p_actor uuid, p_document uuid, p_action text,
  p_classification text, p_watermark boolean, p_external boolean, p_rules jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  v_requested text;
  v_level integer;
  v_new_level integer;
begin
  select * into d from x2x_private.documents where id = p_document for update;
  if x2x_private.role_for(p_document, p_actor) is distinct from 'manage' then
    raise sqlstate 'PT403' using message = 'MANAGE_DENIED';
  end if;
  v_level := array_position(array['normal','internal','restricted'], d.classification);
  v_new_level := array_position(array['normal','internal','restricted'], p_classification);
  case p_action
    when 'settings' then
      if v_new_level < v_level then
        insert into x2x_private.protection_approvals(document_id, actor, requested)
        values(d.id, p_actor, p_classification)
        on conflict(document_id) do update set actor = excluded.actor, requested = excluded.requested, requested_at = now();
      elsif p_classification <> d.classification then
        update x2x_private.documents set classification = p_classification where id = d.id;
        delete from x2x_private.protection_approvals where document_id = d.id;
      end if;
      update x2x_private.documents set watermark = p_watermark, external_share = p_external, action_rules = p_rules where id = d.id;
    when 'approve', 'decline' then
      if d.owner_id <> p_actor then raise sqlstate 'PT403' using message = 'OWNER_REQUIRED'; end if;
      delete from x2x_private.protection_approvals where document_id = d.id returning requested into v_requested;
      if not found then raise sqlstate 'PT409' using message = 'NO_PENDING_APPROVAL'; end if;
      if p_action = 'approve' then update x2x_private.documents set classification = v_requested where id = d.id; end if;
    else raise sqlstate 'PT400' using message = 'UNKNOWN_ACTION';
  end case;
  if exists(select 1 from x2x_private.documents where id = d.id and (not external_share or classification <> 'normal')) then
    update x2x_private.share_links set disabled = true where document_id = d.id and not disabled;
  end if;
  update x2x_private.documents set access_version = access_version + 1 where id = d.id;
  insert into x2x_private.audit(document_id, actor, operation) values(d.id, p_actor, p_action);
end;
$$;

create function public.x2x_screen_rights(p_actor uuid, p_workspace uuid, p_email text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_subject uuid;
begin
  if not exists(select 1 from x2x_private.workspaces where id = p_workspace and owner_id = p_actor) then
    raise sqlstate 'PT403' using message = 'WORKSPACE_DENIED';
  end if;
  select id into v_subject from auth.users where lower(email) = p_email and email_confirmed_at is not null;
  return (select coalesce(jsonb_agg(jsonb_build_object(
    'id', d.id, 'title', d.title, 'role', x2x_private.role_for(d.id, v_subject)
  ) order by d.title), '[]'::jsonb) from x2x_private.documents d
  where d.workspace_id = p_workspace and x2x_private.role_for(d.id, p_actor) = 'manage');
end;
$$;

revoke execute on function x2x_private.action_allowed(uuid,uuid,text), x2x_private.check_protected_link(),
  x2x_private.check_comment_permission() from public, anon, authenticated;
revoke execute on function public.x2x_read_policy(uuid,uuid),
  public.x2x_change_policy(uuid,uuid,text,text,boolean,boolean,jsonb), public.x2x_screen_rights(uuid,uuid,text)
from public, anon, authenticated;
grant execute on function public.x2x_read_policy(uuid,uuid),
  public.x2x_change_policy(uuid,uuid,text,text,boolean,boolean,jsonb), public.x2x_screen_rights(uuid,uuid,text)
to service_role;
