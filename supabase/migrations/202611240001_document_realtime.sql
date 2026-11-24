create policy "x2x authorized document presence" on realtime.messages
for select to authenticated using (
  extension = 'presence' and x2x_private.can_join_topic((select realtime.topic()))
);
create policy "x2x track document presence" on realtime.messages
for insert to authenticated with check (
  extension = 'presence' and x2x_private.can_join_topic((select realtime.topic()))
);

create function x2x_private.invalidate_document_channel()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'DELETE' or new.access_version is distinct from old.access_version then
    perform realtime.send('{}'::jsonb, 'access', x2x_private.topic_for(old.id, old.access_version), true);
  end if;
  return null;
end;
$$;
create trigger x2x_document_channel_changed after update of access_version or delete on x2x_private.documents
for each row execute function x2x_private.invalidate_document_channel();
revoke execute on function x2x_private.invalidate_document_channel() from public, anon, authenticated;

alter table x2x_private.presence add column cursor_access_version integer;

create function public.x2x_document_presence_roster(
  p_actor uuid, p_document uuid, p_access_version integer, p_sessions jsonb
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
begin
  select * into d from x2x_private.documents where id = p_document for share;
  if x2x_private.role_for(p_document, x2x_private.document_actor_for(p_actor)) is null then
    raise sqlstate 'PT403' using message = 'ACCESS_DENIED';
  end if;
  if p_access_version is distinct from d.access_version then
    raise sqlstate 'PT409' using message = 'DOCUMENT_ACCESS_CHANGED';
  end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', u.id, 'session', s.session,
      'name', case when u.is_anonymous then 'admin' else split_part(u.email, '@', 1) end,
      'cursor', case when rights.role in ('edit', 'manage') then p.cursor end,
      'revision', extract(epoch from p.cursor_at) * 1000000
    ) order by u.id, s.session), '[]'::jsonb)
    from jsonb_to_recordset(p_sessions) as s(actor uuid, session uuid)
    join auth.users u on u.id = s.actor
    cross join lateral (select x2x_private.role_for(p_document, x2x_private.document_actor_for(u.id)) as role) rights
    left join x2x_private.presence p on p.document_id = d.id and p.actor = u.id
      and p.cursor_session = s.session and p.cursor_access_version = d.access_version
      and (p.cursor is null or p.cursor->>'generation' = d.generation::text)
    where rights.role is not null
  );
end;
$$;

create function public.x2x_publish_document_cursor(
  p_actor uuid, p_document uuid, p_access_version integer, p_session uuid, p_cursor jsonb
)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  v_role text;
  v_revision timestamptz;
begin
  select * into d from x2x_private.documents where id = p_document for share;
  v_role := x2x_private.role_for(p_document, x2x_private.document_actor_for(p_actor));
  if v_role is null then raise sqlstate 'PT403' using message = 'ACCESS_DENIED'; end if;
  if p_access_version is distinct from d.access_version then
    raise sqlstate 'PT409' using message = 'DOCUMENT_ACCESS_CHANGED';
  end if;
  if v_role not in ('edit', 'manage') then raise sqlstate 'PT403' using message = 'WRITE_DENIED'; end if;
  if p_cursor is not null and p_cursor->>'generation' is distinct from d.generation::text then
    raise sqlstate 'PT409' using message = 'DOCUMENT_VERSION_CHANGED';
  end if;

  if p_cursor is null then
    update x2x_private.presence set cursor = null, cursor_at = clock_timestamp()
    where document_id = d.id and actor = p_actor and cursor_session = p_session
      and cursor_access_version = d.access_version and cursor is not null
    returning cursor_at into v_revision;
  else
    insert into x2x_private.presence as prior
      (document_id, actor, seen_at, cursor_session, cursor, cursor_at, cursor_access_version)
    values (d.id, p_actor, now(), p_session, p_cursor, clock_timestamp(), d.access_version)
    on conflict (document_id, actor) do update set
      seen_at = excluded.seen_at, cursor = excluded.cursor, cursor_session = excluded.cursor_session,
      cursor_at = clock_timestamp(), cursor_access_version = excluded.cursor_access_version
    where (prior.cursor_session, prior.cursor, prior.cursor_access_version)
      is distinct from (excluded.cursor_session, excluded.cursor, excluded.cursor_access_version)
    returning cursor_at into v_revision;
  end if;

  if v_revision is not null then
    perform realtime.send(jsonb_build_object('id', p_actor, 'session', p_session,
      'cursor', p_cursor, 'revision', extract(epoch from v_revision) * 1000000), 'cursor', x2x_private.topic_for(d.id, d.access_version), true);
  end if;
  return true;
end;
$$;

revoke execute on function public.x2x_document_presence_roster(uuid, uuid, integer, jsonb),
  public.x2x_publish_document_cursor(uuid, uuid, integer, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.x2x_document_presence_roster(uuid, uuid, integer, jsonb),
  public.x2x_publish_document_cursor(uuid, uuid, integer, uuid, jsonb) to service_role;

create or replace function public.x2x_open_document(p_actor uuid, p_document uuid, p_generation integer, p_after integer)
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
    'accessVersion', d.access_version, 'realtimeReady', true, 'updatedAt', d.updated_at,
    'cursor', v_from,
    'snapshot', case when v_with_snapshot then x2x_private.base64(d.snapshot) end,
    'updates', v_updates
  );
end;
$$;
