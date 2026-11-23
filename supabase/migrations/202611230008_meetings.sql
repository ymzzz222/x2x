create table x2x_private.meetings (
  document_id uuid primary key references x2x_private.documents(id) on delete cascade,
  room uuid not null default gen_random_uuid(),
  presenter uuid not null references auth.users(id),
  instance uuid not null,
  position jsonb not null,
  touched_at timestamptz not null
);
create table x2x_private.meeting_annotations (
  id uuid primary key default gen_random_uuid(),
  room uuid not null,
  actor uuid not null references auth.users(id),
  position jsonb not null,
  body text not null check (length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
alter table x2x_private.meetings enable row level security;
alter table x2x_private.meeting_annotations enable row level security;

create function public.x2x_meeting(p_actor uuid, p_document uuid, p_action text, p_instance uuid, p_position jsonb, p_body text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  m x2x_private.meetings;
  v_role text;
begin
  if p_action = 'read' then select * into d from x2x_private.documents where id = p_document for share;
  else select * into d from x2x_private.documents where id = p_document for update; end if;
  v_role := x2x_private.role_for(p_document, p_actor);
  if v_role is null then raise sqlstate 'PT403' using message = 'ACCESS_DENIED'; end if;
  select * into m from x2x_private.meetings where document_id = p_document
    and touched_at > now() - interval '22 seconds'
    and x2x_private.role_for(p_document, presenter) in ('edit','manage');

  case p_action
    when 'read' then null;
    when 'start' then
      if v_role not in ('edit','manage') then raise sqlstate 'PT403' using message = 'WRITE_DENIED'; end if;
      if m.room is not null and m.instance is distinct from p_instance then raise sqlstate 'PT409' using message = 'PRESENTATION_ACTIVE'; end if;
      delete from x2x_private.meeting_annotations where room in (select room from x2x_private.meetings where document_id = p_document);
      insert into x2x_private.meetings(document_id, presenter, instance, position, touched_at)
      values(p_document, p_actor, p_instance, p_position, now())
      on conflict (document_id) do update set room = excluded.room, presenter = excluded.presenter,
        instance = excluded.instance, position = excluded.position, touched_at = excluded.touched_at
      returning * into m;
    when 'move', 'stop' then
      if m.presenter is distinct from p_actor or m.instance is distinct from p_instance then raise sqlstate 'PT403' using message = 'PRESENTER_REQUIRED'; end if;
      if p_action = 'move' then
        update x2x_private.meetings set position = p_position, touched_at = now() where document_id = p_document returning * into m;
      else
        delete from x2x_private.meeting_annotations where room = m.room;
        delete from x2x_private.meetings where document_id = p_document;
        return null;
      end if;
    when 'annotate' then
      if m.room is null then raise sqlstate 'PT409' using message = 'PRESENTATION_ENDED'; end if;
      if not x2x_private.action_allowed(p_document, p_actor, 'comment') then raise sqlstate 'PT403' using message = 'COMMENT_DENIED'; end if;
      insert into x2x_private.meeting_annotations(room, actor, position, body) values(m.room, p_actor, p_position, p_body);
    else raise sqlstate 'PT400' using message = 'UNKNOWN_ACTION';
  end case;
  if m.room is null then return null; end if;
  return jsonb_build_object('room', m.room, 'position', m.position,
    'presenter', (select split_part(email, '@', 1) from auth.users where id = m.presenter),
    'ownInstance', m.presenter = p_actor and m.instance = p_instance,
    'annotations', (select coalesce(jsonb_agg(to_jsonb(rec) order by rec."createdAt" desc), '[]'::jsonb) from (
      select a.id, a.body, a.position, a.created_at as "createdAt", split_part(u.email, '@', 1) as author
      from x2x_private.meeting_annotations a join auth.users u on u.id = a.actor where a.room = m.room
      order by a.created_at desc limit 50
    ) rec)
  );
end;
$$;

revoke execute on function public.x2x_meeting(uuid,uuid,text,uuid,jsonb,text) from public, anon, authenticated;
grant execute on function public.x2x_meeting(uuid,uuid,text,uuid,jsonb,text) to service_role;
