create table x2x_private.public_document_settings (
  enabled boolean primary key default true check (enabled),
  admin_user_id uuid not null references auth.users(id) on delete cascade
);

alter table x2x_private.public_document_settings enable row level security;
revoke all on x2x_private.public_document_settings from public, anon, authenticated;

create function x2x_private.document_actor_for(p_visitor uuid)
returns uuid language sql stable security definer set search_path = ''
as $$
  select case when visitor.is_anonymous then (
    select admin.id
    from x2x_private.public_document_settings config
    join auth.users admin on admin.id = config.admin_user_id
    where config.enabled and not admin.is_anonymous and admin.email_confirmed_at is not null
  ) when visitor.email_confirmed_at is not null then visitor.id end
  from auth.users visitor where visitor.id = p_visitor
$$;

create function public.x2x_resolve_document_actor(p_actor uuid)
returns uuid language sql stable security definer set search_path = ''
as $$ select x2x_private.document_actor_for(p_actor) $$;

create or replace function x2x_private.can_join_topic(p_topic text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from x2x_private.documents d
    where d.id = case when p_topic ~ '^x2x-doc:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9]+$'
      then split_part(p_topic, ':', 2)::uuid end
      and p_topic = x2x_private.topic_for(d.id, d.access_version)
      and x2x_private.role_for(d.id, x2x_private.document_actor_for(auth.uid())) is not null
  )
$$;

create or replace function public.x2x_heartbeat(p_actor uuid, p_document uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_peers jsonb;
begin
  perform 1 from x2x_private.documents where id = p_document for share;
  if x2x_private.role_for(p_document, x2x_private.document_actor_for(p_actor)) is null then
    raise sqlstate 'PT403' using message = 'ACCESS_DENIED';
  end if;
  insert into x2x_private.presence values (p_document, p_actor, now())
  on conflict (document_id, actor) do update set seen_at = excluded.seen_at;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', u.id, 'name', case when u.is_anonymous then 'admin' else split_part(u.email, '@', 1) end
  ) order by u.email, u.id), '[]'::jsonb)
  into v_peers from x2x_private.presence p join auth.users u on u.id = p.actor
  where p.document_id = p_document and p.seen_at > now() - interval '45 seconds'
    and x2x_private.role_for(p_document, x2x_private.document_actor_for(p.actor)) is not null;
  return v_peers;
end;
$$;

revoke execute on function x2x_private.document_actor_for(uuid), public.x2x_resolve_document_actor(uuid)
  from public, anon, authenticated;
grant execute on function public.x2x_resolve_document_actor(uuid) to service_role;
