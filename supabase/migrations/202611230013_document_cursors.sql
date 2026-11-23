alter table x2x_private.presence
  add column cursor_session uuid,
  add column cursor jsonb,
  add column cursor_at timestamptz;

-- Keep the two-argument heartbeat available to clients from earlier deployments.
create function public.x2x_heartbeat(p_actor uuid, p_document uuid, p_cursor_session uuid, p_cursor jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  v_role text;
  v_cursor jsonb;
  v_peers jsonb;
begin
  select * into d from x2x_private.documents where id = p_document for share;
  v_role := x2x_private.role_for(p_document, x2x_private.document_actor_for(p_actor));
  if v_role is null then
    raise sqlstate 'PT403' using message = 'ACCESS_DENIED';
  end if;
  if v_role in ('edit', 'manage') and p_cursor->>'generation' = d.generation::text then
    v_cursor := p_cursor;
  end if;

  insert into x2x_private.presence as prior (document_id, actor, seen_at, cursor_session, cursor, cursor_at)
  values (p_document, p_actor, now(), p_cursor_session, v_cursor, case when v_cursor is not null then now() end)
  on conflict (document_id, actor) do update set
    seen_at = excluded.seen_at,
    cursor_session = case when excluded.cursor is not null then excluded.cursor_session else prior.cursor_session end,
    cursor = case when excluded.cursor is not null or prior.cursor_session = excluded.cursor_session
      then excluded.cursor else prior.cursor end,
    cursor_at = case when excluded.cursor is not null or prior.cursor_session = excluded.cursor_session
      then excluded.cursor_at else prior.cursor_at end;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', u.id,
    'name', case when u.is_anonymous then 'admin' else split_part(u.email, '@', 1) end,
    'cursor', case when p.cursor_at > now() - interval '10 seconds' and p.cursor->>'generation' = d.generation::text
      and peer.role in ('edit', 'manage') then p.cursor end
  ) order by u.email, u.id), '[]'::jsonb)
  into v_peers from x2x_private.presence p
  join auth.users u on u.id = p.actor
  cross join lateral (select x2x_private.role_for(p_document, x2x_private.document_actor_for(p.actor)) as role) peer
  where p.document_id = p_document and p.seen_at > now() - interval '45 seconds' and peer.role is not null;

  return v_peers;
end;
$$;

revoke execute on function public.x2x_heartbeat(uuid, uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.x2x_heartbeat(uuid, uuid, uuid, jsonb) to service_role;
