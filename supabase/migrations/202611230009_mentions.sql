alter table x2x_private.notifications add column block_anchor text;
create unique index x2x_unread_block_mention on x2x_private.notifications(recipient, document_id, actor, block_anchor)
where kind = 'block-mention' and read_at is null;

create function public.x2x_mention(p_actor uuid, p_document uuid, p_recipient text, p_block text, p_generation integer, p_head integer)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  v_recipient uuid;
begin
  select * into d from x2x_private.documents where id = p_document for share;
  if coalesce(x2x_private.role_for(p_document, p_actor), '') not in ('edit','manage') then
    raise sqlstate 'PT403' using message = 'WRITE_DENIED';
  end if;
  if d.generation <> p_generation or d.head <> p_head then raise sqlstate 'PT409' using message = 'DOCUMENT_BUSY'; end if;
  select u.id into v_recipient from auth.users u where lower(u.email) = p_recipient and u.email_confirmed_at is not null
    and x2x_private.role_for(p_document, u.id) is not null;
  if v_recipient is null then raise sqlstate 'PT403' using message = 'MENTION_REQUIRES_ACCESS'; end if;
  if v_recipient = p_actor then return; end if;
  insert into x2x_private.notifications(document_id, actor, recipient, kind, block_anchor)
  values(d.id, p_actor, v_recipient, 'block-mention', p_block)
  on conflict (recipient, document_id, actor, block_anchor) where kind = 'block-mention' and read_at is null
  do update set created_at = now();
end;
$$;

create function x2x_private.notify_membership_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and old.role is not distinct from new.role then return new; end if;
  insert into x2x_private.notifications(document_id, actor, recipient, kind)
  select new.document_id, d.owner_id, u.id, 'access'
  from x2x_private.documents d join auth.users u on lower(u.email) = new.email
  where d.id = new.document_id and d.owner_id <> u.id and u.email_confirmed_at is not null;
  return new;
end;
$$;
create trigger x2x_notify_membership after insert or update on x2x_private.members
for each row execute function x2x_private.notify_membership_change();

create or replace function public.x2x_notifications(p_actor uuid, p_read uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  if p_read is not null then
    update x2x_private.notifications set read_at = now() where recipient = p_actor and id = p_read;
  end if;
  return (select coalesce(jsonb_agg(to_jsonb(item) order by item."createdAt" desc), '[]'::jsonb) from (
    select n.id, n.document_id as "documentId",
      case when x2x_private.role_for(d.id, p_actor) is not null then d.title else '一篇共享文档' end as title,
      n.kind, n.anchor, n.block_anchor as "blockAnchor", n.created_at as "createdAt", n.read_at is not null as read
    from x2x_private.notifications n join x2x_private.documents d on d.id = n.document_id
    where n.recipient = p_actor and (n.kind = 'access' or x2x_private.role_for(d.id, p_actor) is not null)
      and (n.anchor is null or x2x_private.comment_visible(n.anchor, p_actor))
    order by n.created_at desc limit 100
  ) item);
end;
$$;

revoke execute on function x2x_private.notify_membership_change() from public, anon, authenticated;
revoke execute on function public.x2x_mention(uuid,uuid,text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.x2x_mention(uuid,uuid,text,text,integer,integer) to service_role;
