create index x2x_document_owner_list on x2x_private.documents(owner_id, updated_at desc, id desc);
create index x2x_document_workspace_list on x2x_private.documents(workspace_id, updated_at desc, id desc)
  where workspace_id is not null;
create index x2x_document_member_email on x2x_private.members(email, document_id);
create index x2x_workspace_member_email on x2x_private.workspace_members(email, workspace_id);
create index x2x_document_link_member_user on x2x_private.link_members(user_id, link_id);

create function public.x2x_list_document_page(p_actor uuid, p_limit integer, p_before timestamptz, p_before_id uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  with actor_email as (
    select lower(email) as email from auth.users where id = p_actor and email_confirmed_at is not null
  ), actor_workspaces as (
    select id from x2x_private.workspaces where owner_id = p_actor
    union
    select m.workspace_id from x2x_private.workspace_members m join actor_email a on a.email = m.email
  ), candidates as (
    select id from x2x_private.documents where owner_id = p_actor
    union
    select m.document_id from x2x_private.members m join actor_email a on a.email = m.email
    union
    select d.id from x2x_private.documents d join actor_workspaces w on w.id = d.workspace_id
    union
    select l.document_id from x2x_private.link_members m join x2x_private.share_links l on l.id = m.link_id
    where m.user_id = p_actor and not l.disabled
  ), page as (
    select d.id, d.title, d.updated_at, rights.role
    from candidates c join x2x_private.documents d on d.id = c.id
    cross join lateral (select x2x_private.role_for(d.id, p_actor) as role offset 0) rights
    where (p_before is null or (d.updated_at, d.id) < (p_before, p_before_id)) and rights.role is not null
    order by d.updated_at desc, d.id desc
    limit least(greatest(p_limit, 1), 100) + 1
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'title', title, 'role', role,
    'updatedAt', to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
  ) order by updated_at desc, id desc), '[]'::jsonb) from page
$$;

create table x2x_private.document_creations (
  actor_id uuid not null references auth.users(id) on delete cascade,
  request_key uuid not null,
  fingerprint text not null check (length(fingerprint) = 64),
  document_id uuid references x2x_private.documents(id) on delete set null,
  primary key (actor_id, request_key)
);

alter table x2x_private.document_creations enable row level security;
revoke all on x2x_private.document_creations from public, anon, authenticated;

create function public.x2x_create_document_once(p_actor uuid, p_title text, p_snapshot text, p_workspace uuid,
  p_key uuid, p_fingerprint text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_document uuid;
  v_fingerprint text;
begin
  insert into x2x_private.document_creations(actor_id, request_key, fingerprint)
  values (p_actor, p_key, p_fingerprint)
  on conflict (actor_id, request_key) do nothing;

  if not found then
    select fingerprint, document_id into v_fingerprint, v_document
    from x2x_private.document_creations where actor_id = p_actor and request_key = p_key;
    if v_fingerprint is distinct from p_fingerprint then
      raise sqlstate 'PT409' using message = 'CREATE_KEY_REUSED';
    end if;
    if v_document is null then raise sqlstate 'PT410' using message = 'CREATED_DOCUMENT_GONE'; end if;
    return v_document;
  end if;

  v_document := public.x2x_create_document(p_actor, p_title, p_snapshot, p_workspace);
  update x2x_private.document_creations set document_id = v_document
  where actor_id = p_actor and request_key = p_key;
  return v_document;
end;
$$;

revoke execute on function public.x2x_list_document_page(uuid,integer,timestamptz,uuid),
  public.x2x_create_document_once(uuid,text,text,uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.x2x_list_document_page(uuid,integer,timestamptz,uuid),
  public.x2x_create_document_once(uuid,text,text,uuid,uuid,text) to service_role;
