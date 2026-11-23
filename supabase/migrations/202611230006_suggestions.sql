create table x2x_private.suggestions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  actor uuid not null references auth.users(id),
  generation integer not null,
  anchor jsonb not null,
  before_text text not null check (length(before_text) between 1 and 8000),
  after_text text not null check (length(after_text) <= 8000),
  state text not null default 'pending' check (state in ('pending','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now()
);
create table x2x_private.suggestion_replies (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references x2x_private.suggestions(id) on delete cascade,
  actor uuid not null references auth.users(id),
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
alter table x2x_private.suggestions enable row level security;
alter table x2x_private.suggestion_replies enable row level security;

create function public.x2x_suggestions(p_actor uuid, p_document uuid, p_selection uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  perform 1 from x2x_private.documents where id = p_document for share;
  if x2x_private.role_for(p_document, p_actor) is null then raise sqlstate 'PT403' using message = 'ACCESS_DENIED'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object(
    'id', item.id, 'mine', item.actor = p_actor, 'author', split_part(u.email, '@', 1),
    'generation', item.generation, 'anchor', item.anchor, 'before', item.before_text, 'after', item.after_text,
    'state', item.state, 'createdAt', item.created_at,
    'replies', (select coalesce(jsonb_agg(jsonb_build_object('id', r.id, 'body', r.body, 'author', split_part(usr.email, '@', 1))
      order by r.created_at), '[]'::jsonb) from x2x_private.suggestion_replies r join auth.users usr on usr.id = r.actor
      where r.suggestion_id = item.id)
  ) order by item.created_at desc), '[]'::jsonb)
  from (select * from x2x_private.suggestions where document_id = p_document and (p_selection is null or id = p_selection)
    order by created_at desc limit 100) item join auth.users u on u.id = item.actor);
end;
$$;

create function public.x2x_change_suggestion(p_actor uuid, p_document uuid, p_kind text, p_id uuid, p_anchor jsonb,
  p_before text, p_text text, p_generation integer, p_head integer, p_update text, p_revision text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  s x2x_private.suggestions;
  v_role text;
  v_id uuid;
begin
  select * into d from x2x_private.documents where id = p_document for update;
  v_role := x2x_private.role_for(p_document, p_actor);
  if v_role is null then raise sqlstate 'PT403' using message = 'ACCESS_DENIED'; end if;
  if p_kind = 'create' then
    if p_generation <> d.generation then raise sqlstate 'PT409' using message = 'DOCUMENT_VERSION_CHANGED'; end if;
    insert into x2x_private.suggestions(document_id, actor, generation, anchor, before_text, after_text)
    values(d.id, p_actor, d.generation, p_anchor, p_before, p_text) returning id into v_id;
    return v_id;
  end if;
  select * into s from x2x_private.suggestions where id = p_id and document_id = d.id;
  if not found then raise sqlstate 'PT404' using message = 'SUGGESTION_NOT_FOUND'; end if;
  if s.state <> 'pending' then raise sqlstate 'PT409' using message = 'SUGGESTION_CLOSED'; end if;

  if p_kind in ('revise','withdraw') and s.actor <> p_actor then raise sqlstate 'PT403' using message = 'WRITE_DENIED'; end if;
  if p_kind in ('accept','reject') and v_role not in ('edit','manage') then
    raise sqlstate 'PT403' using message = 'WRITE_DENIED';
  end if;

  case p_kind
    when 'revise' then update x2x_private.suggestions set after_text = p_text where id = s.id;
    when 'withdraw' then update x2x_private.suggestions set state = 'withdrawn' where id = s.id;
    when 'reject' then update x2x_private.suggestions set state = 'rejected' where id = s.id;
    when 'reply' then insert into x2x_private.suggestion_replies(suggestion_id, actor, body) values(s.id, p_actor, p_text);
    when 'accept' then
      if d.generation <> s.generation or d.head <> p_head or s.after_text is distinct from p_revision then
        raise sqlstate 'PT409' using message = 'SUGGESTION_OUTDATED';
      end if;
      perform public.x2x_append_update(p_actor, d.id, d.generation, d.schema_version, s.id, p_update);
      update x2x_private.suggestions set state = 'accepted' where id = s.id;
    else raise sqlstate 'PT400' using message = 'UNKNOWN_ACTION';
  end case;
  if p_actor <> s.actor and p_kind in ('accept','reject','reply') then
    insert into x2x_private.notifications(document_id, actor, recipient, kind)
    values(d.id, p_actor, s.actor, 'reviewed');
  end if;
  return s.id;
end;
$$;

revoke execute on function public.x2x_suggestions(uuid,uuid,uuid),
  public.x2x_change_suggestion(uuid,uuid,text,uuid,jsonb,text,text,integer,integer,text,text) from public, anon, authenticated;
grant execute on function public.x2x_suggestions(uuid,uuid,uuid),
  public.x2x_change_suggestion(uuid,uuid,text,uuid,jsonb,text,text,integer,integer,text,text) to service_role;
