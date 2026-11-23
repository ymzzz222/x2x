create schema if not exists x2x_private;
create extension if not exists pgcrypto with schema extensions;

create table x2x_private.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  title text not null check (length(title) between 1 and 120),
  generation integer not null default 1 check (generation > 0),
  schema_version integer not null default 1 check (schema_version > 0),
  access_version integer not null default 1,
  head integer not null default 0,
  snapshot_cursor integer not null default 0,
  snapshot bytea not null check (octet_length(snapshot) between 2 and 2200000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table x2x_private.members (
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  email text not null,
  role text check (role in ('view', 'edit', 'manage')),
  primary key (document_id, email)
);

create table x2x_private.share_links (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  token_hash bytea not null unique,
  role text not null check (role in ('view', 'edit')),
  password_hash text,
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index x2x_one_active_document_link on x2x_private.share_links(document_id) where not disabled;

create table x2x_private.link_members (
  link_id uuid not null references x2x_private.share_links(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (link_id, user_id)
);

create table x2x_private.document_updates (
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  generation integer not null,
  seq integer not null,
  data bytea not null,
  primary key (document_id, generation, seq)
);

create table x2x_private.receipts (
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  generation integer not null,
  batch_id uuid not null,
  actor uuid not null references auth.users(id),
  digest bytea not null,
  seq integer not null,
  saved_at timestamptz not null default now(),
  primary key (document_id, generation, batch_id)
);

alter table x2x_private.documents enable row level security;
alter table x2x_private.members enable row level security;
alter table x2x_private.share_links enable row level security;
alter table x2x_private.link_members enable row level security;
alter table x2x_private.document_updates enable row level security;
alter table x2x_private.receipts enable row level security;
revoke all on schema x2x_private from public, anon, authenticated;
grant usage on schema x2x_private to authenticated;

create function x2x_private.role_for(p_document uuid, p_actor uuid)
returns text
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_owner uuid;
  v_role text;
begin
  select owner_id into v_owner from x2x_private.documents where id = p_document;
  if not found or p_actor is null then return null; end if;
  if v_owner = p_actor then return 'manage'; end if;

  select m.role into v_role
  from x2x_private.members m
  join auth.users u on lower(u.email) = m.email and u.email_confirmed_at is not null
  where m.document_id = p_document and u.id = p_actor;
  -- A membership record without a role prevents a revoked account from rejoining through a link.
  if found then return v_role; end if;

  select l.role into v_role
  from x2x_private.share_links l join x2x_private.link_members lm on lm.link_id = l.id
  where l.document_id = p_document and not l.disabled and lm.user_id = p_actor;
  return v_role;
end;
$$;

create function x2x_private.topic_for(p_document uuid, p_version integer)
returns text language sql immutable set search_path = ''
as $$ select 'x2x-doc:' || p_document::text || ':' || p_version::text $$;

create function x2x_private.can_join_topic(p_topic text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from x2x_private.documents d
    where d.id = case when p_topic ~ '^x2x-doc:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9]+$'
      then split_part(p_topic, ':', 2)::uuid end
      and p_topic = x2x_private.topic_for(d.id, d.access_version)
      and x2x_private.role_for(d.id, auth.uid()) is not null
  )
$$;

create policy "x2x authorized document notices" on realtime.messages
for select to authenticated using (
  extension = 'broadcast' and x2x_private.can_join_topic((select realtime.topic()))
);

create function x2x_private.base64(p_data bytea)
returns text language sql immutable set search_path = ''
as $$ select replace(encode(p_data, 'base64'), chr(10), '') $$;

create function x2x_private.send_notice(p_document uuid, p_version integer, p_seq integer)
returns void language plpgsql set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object('cursor', p_seq),
    'saved',
    x2x_private.topic_for(p_document, p_version),
    true
  );
exception when others then
  -- Durable updates remain available to authorized polling when Realtime is unavailable.
  raise log 'x2x realtime notification failed for %', p_document;
end;
$$;

create function public.x2x_open_document(p_actor uuid, p_document uuid, p_generation integer, p_after integer)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  v_role text;
  v_from integer;
  v_with_snapshot boolean;
  v_updates jsonb;
begin
  select * into d from x2x_private.documents where id = p_document for share;
  v_role := x2x_private.role_for(p_document, p_actor);
  if v_role is null then raise sqlstate 'PT403' using message = 'ACCESS_DENIED'; end if;
  v_from := case when p_generation = d.generation and p_after between d.snapshot_cursor and d.head
    then p_after else d.snapshot_cursor end;
  v_with_snapshot := p_generation is distinct from d.generation or p_after <> v_from;

  select coalesce(jsonb_agg(jsonb_build_object('seq', u.seq, 'data', x2x_private.base64(u.data)) order by u.seq), '[]'::jsonb)
    into v_updates
  from (
    select seq, data, sum(octet_length(data)) over (order by seq) as bytes
    from x2x_private.document_updates
    where document_id = d.id and generation = d.generation and seq > v_from
    order by seq limit 8
  ) u
  where u.bytes <= 2900000 - case when v_with_snapshot then octet_length(d.snapshot) else 0 end;

  return jsonb_build_object(
    'id', d.id, 'title', d.title, 'role', v_role, 'owner', d.owner_id = p_actor,
    'generation', d.generation, 'schema', d.schema_version, 'head', d.head,
    'accessVersion', d.access_version, 'updatedAt', d.updated_at,
    'cursor', v_from,
    'snapshot', case when v_with_snapshot then x2x_private.base64(d.snapshot) end,
    'updates', v_updates
  );
end;
$$;

create function public.x2x_create_document(p_actor uuid, p_title text, p_snapshot text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into x2x_private.documents(owner_id, title, snapshot)
  values (p_actor, p_title, decode(p_snapshot, 'base64')) returning id into v_id;
  return v_id;
end;
$$;

create function public.x2x_list_documents(p_actor uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(to_jsonb(item) order by item."updatedAt" desc), '[]'::jsonb)
  from (
    select d.id, d.title, d.updated_at as "updatedAt", rights.role
    from x2x_private.documents d
    cross join lateral (select x2x_private.role_for(d.id, p_actor) as role) rights
    where rights.role is not null
    order by d.updated_at desc limit 100
  ) item
$$;

create function public.x2x_append_update(p_actor uuid, p_document uuid, p_generation integer, p_schema integer, p_batch uuid, p_update text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  v_receipt x2x_private.receipts;
  v_update bytea;
  v_digest bytea;
  v_saved_at timestamptz := now();
begin
  select * into d from x2x_private.documents where id = p_document for update;
  if coalesce(x2x_private.role_for(p_document, p_actor), '') not in ('edit', 'manage') then
    raise sqlstate 'PT403' using message = 'WRITE_DENIED';
  end if;
  if d.generation <> p_generation or d.schema_version <> p_schema then
    raise sqlstate 'PT409' using message = 'DOCUMENT_VERSION_CHANGED';
  end if;
  v_update := decode(p_update, 'base64');
  if octet_length(v_update) not between 2 and 2200000 then raise sqlstate 'PT400' using message = 'INVALID_UPDATE_SIZE'; end if;
  v_digest := extensions.digest(v_update, 'sha256');

  select * into v_receipt from x2x_private.receipts
  where document_id = d.id and generation = d.generation and batch_id = p_batch;
  if found then
    if v_receipt.actor <> p_actor or v_receipt.digest <> v_digest then
      raise sqlstate 'PT409' using message = 'BATCH_ID_REUSED';
    end if;
    return jsonb_build_object('seq', v_receipt.seq, 'savedAt', v_receipt.saved_at);
  end if;

  d.head := d.head + 1;
  insert into x2x_private.document_updates values (d.id, d.generation, d.head, v_update);
  insert into x2x_private.receipts values (d.id, d.generation, p_batch, p_actor, v_digest, d.head, v_saved_at);
  update x2x_private.documents set head = d.head, updated_at = v_saved_at where id = d.id;
  perform x2x_private.send_notice(d.id, d.access_version, d.head);
  return jsonb_build_object('seq', d.head, 'savedAt', v_saved_at);
end;
$$;

create function public.x2x_compact_document(p_actor uuid, p_document uuid, p_generation integer, p_head integer, p_snapshot text)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
begin
  select * into d from x2x_private.documents where id = p_document for update;
  if coalesce(x2x_private.role_for(p_document, p_actor), '') not in ('edit', 'manage') then
    raise sqlstate 'PT403' using message = 'WRITE_DENIED';
  end if;
  if d.generation <> p_generation or d.head <> p_head or d.head - d.snapshot_cursor < 64 then return false; end if;
  update x2x_private.documents set snapshot = decode(p_snapshot, 'base64'), snapshot_cursor = d.head where id = d.id;
  delete from x2x_private.document_updates where document_id = d.id and generation = d.generation and seq <= d.head;
  return true;
end;
$$;

revoke execute on all functions in schema x2x_private from public, anon, authenticated;
grant execute on function x2x_private.can_join_topic(text) to authenticated;
revoke execute on function
  public.x2x_open_document(uuid,uuid,integer,integer),
  public.x2x_create_document(uuid,text,text), public.x2x_list_documents(uuid),
  public.x2x_append_update(uuid,uuid,integer,integer,uuid,text),
  public.x2x_compact_document(uuid,uuid,integer,integer,text)
from public, anon, authenticated;
grant execute on function
  public.x2x_open_document(uuid,uuid,integer,integer),
  public.x2x_create_document(uuid,text,text), public.x2x_list_documents(uuid),
  public.x2x_append_update(uuid,uuid,integer,integer,uuid,text),
  public.x2x_compact_document(uuid,uuid,integer,integer,text)
to service_role;
