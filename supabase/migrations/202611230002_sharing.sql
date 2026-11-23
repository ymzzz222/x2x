create table x2x_private.presence (
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  actor uuid not null references auth.users(id) on delete cascade,
  seen_at timestamptz not null,
  primary key (document_id, actor)
);
alter table x2x_private.presence enable row level security;

create function public.x2x_heartbeat(p_actor uuid, p_document uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_peers jsonb;
begin
  perform 1 from x2x_private.documents where id = p_document for share;
  if x2x_private.role_for(p_document, p_actor) is null then
    raise sqlstate 'PT403' using message = 'ACCESS_DENIED';
  end if;
  insert into x2x_private.presence values (p_document, p_actor, now())
  on conflict (document_id, actor) do update set seen_at = excluded.seen_at;

  select coalesce(jsonb_agg(jsonb_build_object('id', u.id, 'name', split_part(u.email, '@', 1)) order by u.email), '[]'::jsonb)
  into v_peers from x2x_private.presence p join auth.users u on u.id = p.actor
  where p.document_id = p_document and p.seen_at > now() - interval '45 seconds'
    and x2x_private.role_for(p_document, p.actor) is not null;
  return v_peers;
end;
$$;

create function public.x2x_share_settings(p_actor uuid, p_document uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  perform 1 from x2x_private.documents where id = p_document for share;
  if x2x_private.role_for(p_document, p_actor) is distinct from 'manage' then
    raise sqlstate 'PT403' using message = 'MANAGE_DENIED';
  end if;
  return jsonb_build_object(
    'members', (select coalesce(jsonb_agg(jsonb_build_object('email', email, 'role', role) order by email), '[]'::jsonb)
      from x2x_private.members where document_id = p_document and role is not null),
    'link', (select jsonb_build_object('role', role, 'protected', password_hash is not null)
      from x2x_private.share_links where document_id = p_document and not disabled)
  );
end;
$$;

create function public.x2x_set_member(p_actor uuid, p_document uuid, p_email text, p_role text)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
begin
  select * into d from x2x_private.documents where id = p_document for update;
  if x2x_private.role_for(p_document, p_actor) is distinct from 'manage' then
    raise sqlstate 'PT403' using message = 'MANAGE_DENIED';
  end if;
  if exists(select 1 from auth.users where id = d.owner_id and lower(email) = lower(p_email)) then
    raise sqlstate 'PT409' using message = 'OWNER_MEMBERSHIP';
  end if;
  if p_role = 'manage' and d.owner_id <> p_actor then
    raise sqlstate 'PT403' using message = 'OWNER_REQUIRED';
  end if;
  if d.owner_id <> p_actor and exists (
    select 1 from x2x_private.members where document_id = d.id and email = lower(p_email) and role = 'manage'
  ) then
    raise sqlstate 'PT403' using message = 'OWNER_REQUIRED';
  end if;
  insert into x2x_private.members values (d.id, lower(p_email), p_role)
  on conflict (document_id, email) do update set role = excluded.role;
  update x2x_private.documents set access_version = access_version + 1 where id = d.id;
end;
$$;

create function public.x2x_set_share_link(p_actor uuid, p_document uuid, p_token text, p_role text, p_password text)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
begin
  select * into d from x2x_private.documents where id = p_document for update;
  if x2x_private.role_for(p_document, p_actor) is distinct from 'manage' then
    raise sqlstate 'PT403' using message = 'MANAGE_DENIED';
  end if;
  update x2x_private.share_links set disabled = true where document_id = d.id and not disabled;
  if p_token is not null then
    insert into x2x_private.share_links(document_id, token_hash, role, password_hash)
    values (d.id, extensions.digest(p_token, 'sha256'), p_role,
      case when p_password is not null then extensions.crypt(p_password, extensions.gen_salt('bf', 10)) end);
  end if;
  update x2x_private.documents set access_version = access_version + 1 where id = d.id;
end;
$$;

create function public.x2x_redeem_link(p_actor uuid, p_document uuid, p_token text, p_password text)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  l x2x_private.share_links;
begin
  perform 1 from x2x_private.documents where id = p_document for update;
  select * into l from x2x_private.share_links
  where document_id = p_document and not disabled and token_hash = extensions.digest(p_token, 'sha256');
  if not found then raise sqlstate 'PT403' using message = 'LINK_DISABLED'; end if;
  if exists (
    select 1 from x2x_private.members m join auth.users u on lower(u.email) = m.email
    where m.document_id = p_document and m.role is null and u.id = p_actor
  ) then
    raise sqlstate 'PT403' using message = 'ACCESS_DENIED';
  end if;
  if l.password_hash is not null and (
    p_password is null or extensions.crypt(p_password, l.password_hash) <> l.password_hash
  ) then
    raise sqlstate 'PT403' using message = 'LINK_PASSWORD_REQUIRED';
  end if;
  insert into x2x_private.link_members values (l.id, p_actor) on conflict do nothing;
end;
$$;

create function public.x2x_transfer_document(p_actor uuid, p_document uuid, p_email text)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  v_owner uuid;
  v_previous_email text;
begin
  select * into d from x2x_private.documents where id = p_document for update;
  if not found or d.owner_id <> p_actor then raise sqlstate 'PT403' using message = 'OWNER_REQUIRED'; end if;
  select id into v_owner from auth.users where lower(email) = lower(p_email) and email_confirmed_at is not null;
  if v_owner is null or x2x_private.role_for(d.id, v_owner) is null then
    raise sqlstate 'PT409' using message = 'TRANSFER_REQUIRES_MEMBER';
  end if;
  if v_owner = d.owner_id then return; end if;
  select lower(email) into v_previous_email from auth.users where id = d.owner_id;
  update x2x_private.documents set owner_id = v_owner, access_version = access_version + 1 where id = d.id;
  insert into x2x_private.members values (d.id, v_previous_email, 'manage')
  on conflict (document_id, email) do update set role = excluded.role;
  delete from x2x_private.members where document_id = d.id and email = lower(p_email);
end;
$$;

revoke execute on function
  public.x2x_heartbeat(uuid,uuid), public.x2x_share_settings(uuid,uuid),
  public.x2x_set_member(uuid,uuid,text,text), public.x2x_set_share_link(uuid,uuid,text,text,text),
  public.x2x_redeem_link(uuid,uuid,text,text), public.x2x_transfer_document(uuid,uuid,text)
from public, anon, authenticated;
grant execute on function
  public.x2x_heartbeat(uuid,uuid), public.x2x_share_settings(uuid,uuid),
  public.x2x_set_member(uuid,uuid,text,text), public.x2x_set_share_link(uuid,uuid,text,text,text),
  public.x2x_redeem_link(uuid,uuid,text,text), public.x2x_transfer_document(uuid,uuid,text)
to service_role;
