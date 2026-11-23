create table x2x_private.comments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  actor uuid not null references auth.users(id),
  parent uuid references x2x_private.comments(id) on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  anchor jsonb,
  private boolean not null default false,
  recipient uuid references auth.users(id),
  resolved boolean not null default false,
  sent_at timestamptz not null default now()
);
create table x2x_private.reactions (
  comment_id uuid not null references x2x_private.comments(id) on delete cascade,
  actor uuid not null references auth.users(id),
  emoji text not null check (emoji in ('👍','❤️','🎉','👀')),
  primary key (comment_id, actor, emoji)
);
create table x2x_private.document_likes (
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  actor uuid not null references auth.users(id),
  primary key (document_id, actor)
);
create table x2x_private.follows (
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  actor uuid not null references auth.users(id),
  primary key (document_id, actor)
);
create table x2x_private.notifications (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  actor uuid not null references auth.users(id),
  recipient uuid not null references auth.users(id),
  kind text not null,
  anchor uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index x2x_unread_document_updates on x2x_private.notifications(recipient, document_id)
where kind = 'updated' and read_at is null;

alter table x2x_private.comments enable row level security;
alter table x2x_private.reactions enable row level security;
alter table x2x_private.document_likes enable row level security;
alter table x2x_private.follows enable row level security;
alter table x2x_private.notifications enable row level security;

create function x2x_private.comment_visible(p_id uuid, p_actor uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(select 1 from x2x_private.comments c
    join x2x_private.comments root on root.id = coalesce(c.parent, c.id)
    where c.id = p_id and (not root.private or root.actor = p_actor or root.recipient = p_actor)
      and x2x_private.role_for(c.document_id, p_actor) is not null)
$$;

create function x2x_private.notify_followers()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into x2x_private.notifications(document_id, actor, recipient, kind)
  select new.document_id, new.actor, f.actor, 'updated' from x2x_private.follows f
  where f.document_id = new.document_id and f.actor <> new.actor
    and x2x_private.role_for(f.document_id, f.actor) is not null
  on conflict (recipient, document_id) where kind = 'updated' and read_at is null
  do update set actor = excluded.actor, created_at = excluded.created_at;
  return new;
end;
$$;
create trigger x2x_followers_after_save after insert on x2x_private.receipts
for each row execute function x2x_private.notify_followers();

create function public.x2x_discussion(p_actor uuid, p_document uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
begin
  select * into d from x2x_private.documents where id = p_document for share;
  if x2x_private.role_for(p_document, p_actor) is null then raise sqlstate 'PT403' using message = 'ACCESS_DENIED'; end if;
  return jsonb_build_object(
    'comments', (select coalesce(jsonb_agg(jsonb_build_object(
      'id', c.id, 'parent', c.parent, 'author', split_part(u.email, '@', 1), 'body', c.body, 'anchor', c.anchor,
      'resolved', c.resolved, 'private', c.private, 'createdAt', c.sent_at,
      'reactions', (select coalesce(jsonb_agg(to_jsonb(aggregate)), '[]'::jsonb)
        from (select r.emoji, count(*) as count, bool_or(r.actor = p_actor) as mine
          from x2x_private.reactions r where r.comment_id = c.id group by r.emoji) aggregate)
      ) order by c.sent_at), '[]'::jsonb) from (
        select * from x2x_private.comments item where item.document_id = d.id and x2x_private.comment_visible(item.id, p_actor)
        order by item.sent_at desc limit 300
      ) c join auth.users u on u.id = c.actor),
    'liked', exists (select 1 from x2x_private.document_likes where document_id = d.id and actor = p_actor),
    'likes', (select count(*) from x2x_private.document_likes where document_id = d.id),
    'following', exists (select 1 from x2x_private.follows where document_id = d.id and actor = p_actor),
    'owner', (select split_part(email, '@', 1) from auth.users where id = d.owner_id),
    'createdAt', d.created_at, 'updatedAt', d.updated_at
  );
end;
$$;

create function public.x2x_change_discussion(p_actor uuid, p_document uuid, p_action text, p_body text, p_parent uuid,
  p_anchor jsonb, p_private boolean, p_recipient text, p_reaction text, p_enabled boolean, p_mentions text[])
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_role text;
  v_parent x2x_private.comments;
  v_comment uuid;
  v_recipient uuid;
begin
  perform 1 from x2x_private.documents where id = p_document for update;
  v_role := x2x_private.role_for(p_document, p_actor);
  if v_role is null then raise sqlstate 'PT403' using message = 'ACCESS_DENIED'; end if;
  if p_parent is not null then
    select * into v_parent from x2x_private.comments where id = p_parent and document_id = p_document;
    if not found or not x2x_private.comment_visible(p_parent, p_actor) then raise sqlstate 'PT404' using message = 'COMMENT_NOT_FOUND'; end if;
  end if;

  case p_action
    when 'comment' then
      if p_parent is not null then v_recipient := v_parent.recipient;
      elsif p_private and p_recipient is not null then
        select id into v_recipient from auth.users
        where lower(email) = p_recipient and email_confirmed_at is not null and x2x_private.role_for(p_document, id) is not null;
        if v_recipient is null then raise sqlstate 'PT400' using message = 'INVALID_COMMENT_RECIPIENT'; end if;
      end if;
      insert into x2x_private.comments(document_id, actor, parent, body, anchor, private, recipient)
      values(p_document, p_actor, coalesce(v_parent.parent, v_parent.id), p_body,
        case when p_parent is null then p_anchor end, coalesce(v_parent.private, p_private), v_recipient)
      returning id into v_comment;
      insert into x2x_private.notifications(document_id, actor, recipient, kind, anchor)
      select p_document, p_actor, u.id,
        case when lower(u.email) = any(p_mentions) then 'mentioned' else 'replied' end,
        coalesce(v_parent.parent, v_parent.id, v_comment)
      from auth.users u where u.id <> p_actor and u.email_confirmed_at is not null
        and (lower(u.email) = any(p_mentions) or u.id in (v_parent.actor, v_recipient))
        and x2x_private.comment_visible(v_comment, u.id);
    when 'resolve' then
      if v_parent.parent is not null or (v_parent.actor <> p_actor and v_role not in ('edit','manage')) then
        raise sqlstate 'PT403' using message = 'COMMENT_RESOLVE_DENIED';
      end if;
      update x2x_private.comments set resolved = p_enabled where id = p_parent;
    when 'reaction' then
      if p_enabled then
        insert into x2x_private.reactions values(p_parent, p_actor, p_reaction) on conflict do nothing;
      else delete from x2x_private.reactions where comment_id = p_parent and actor = p_actor and emoji = p_reaction;
      end if;
    when 'like' then
      if p_enabled then insert into x2x_private.document_likes values(p_document, p_actor) on conflict do nothing;
      else delete from x2x_private.document_likes where document_id = p_document and actor = p_actor;
      end if;
    when 'follow' then
      if p_enabled then insert into x2x_private.follows values(p_document, p_actor) on conflict do nothing;
      else delete from x2x_private.follows where document_id = p_document and actor = p_actor;
      end if;
    else raise sqlstate 'PT400' using message = 'UNKNOWN_ACTION';
  end case;
  return v_comment;
end;
$$;

create function public.x2x_notifications(p_actor uuid, p_read uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  if p_read is not null then
    update x2x_private.notifications set read_at = now() where recipient = p_actor and id = p_read;
  end if;
  return (select coalesce(jsonb_agg(to_jsonb(item) order by item."createdAt" desc), '[]'::jsonb) from (
    select n.id, n.document_id as "documentId", d.title, n.kind, n.anchor, n.created_at as "createdAt", n.read_at is not null as read
    from x2x_private.notifications n join x2x_private.documents d on d.id = n.document_id
    where n.recipient = p_actor and x2x_private.role_for(d.id, p_actor) is not null
      and (n.anchor is null or x2x_private.comment_visible(n.anchor, p_actor))
    order by n.created_at desc limit 100
  ) item);
end;
$$;

revoke execute on function x2x_private.comment_visible(uuid,uuid), x2x_private.notify_followers() from public, anon, authenticated;
revoke execute on function public.x2x_discussion(uuid,uuid),
  public.x2x_change_discussion(uuid,uuid,text,text,uuid,jsonb,boolean,text,text,boolean,text[]),
  public.x2x_notifications(uuid,uuid) from public, anon, authenticated;
grant execute on function public.x2x_discussion(uuid,uuid),
  public.x2x_change_discussion(uuid,uuid,text,text,uuid,jsonb,boolean,text,text,boolean,text[]),
  public.x2x_notifications(uuid,uuid) to service_role;
