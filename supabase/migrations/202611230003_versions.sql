create table x2x_private.versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references x2x_private.documents(id) on delete cascade,
  actor uuid not null references auth.users(id),
  generation integer not null,
  seq integer not null,
  name text not null check (length(name) between 1 and 120),
  snapshot bytea not null check (octet_length(snapshot) between 2 and 2200000),
  created_at timestamptz not null default now()
);

alter table x2x_private.versions enable row level security;

create function public.x2x_history(p_actor uuid, p_document uuid, p_version uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  v x2x_private.versions;
begin
  select * into d from x2x_private.documents where id = p_document for share;
  if x2x_private.role_for(p_document, p_actor) is null then
    raise sqlstate 'PT403' using message = 'ACCESS_DENIED';
  end if;
  if p_version is not null then
    select * into v from x2x_private.versions where id = p_version and document_id = d.id;
    if not found then raise sqlstate 'PT404' using message = 'VERSION_NOT_FOUND'; end if;
    return jsonb_build_object('name', v.name, 'title', d.title, 'snapshot', x2x_private.base64(v.snapshot));
  end if;
  return jsonb_build_object(
    'versions', (select coalesce(jsonb_agg(to_jsonb(rec) order by rec."createdAt" desc), '[]'::jsonb)
      from (select item.id, item.name, item.generation, item.seq, item.created_at as "createdAt", split_part(u.email, '@', 1) as author
        from x2x_private.versions item join auth.users u on u.id = item.actor
        where item.document_id = d.id order by item.created_at desc limit 100) rec),
    'activity', (select coalesce(jsonb_agg(to_jsonb(rec) order by rec."savedAt" desc), '[]'::jsonb)
      from (select r.batch_id as id, r.generation, r.seq, r.saved_at as "savedAt", split_part(u.email, '@', 1) as author
        from x2x_private.receipts r join auth.users u on u.id = r.actor
        where r.document_id = d.id order by r.saved_at desc limit 50) rec)
  );
end;
$$;

create function public.x2x_store_version(p_actor uuid, p_document uuid, p_generation integer, p_head integer,
  p_name text, p_snapshot text, p_restore uuid)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
  v_target bytea;
  v_saved uuid;
begin
  select * into d from x2x_private.documents where id = p_document for update;
  if coalesce(x2x_private.role_for(p_document, p_actor), '') not in ('edit', 'manage') then
    raise sqlstate 'PT403' using message = 'WRITE_DENIED';
  end if;
  if d.generation <> p_generation or d.head <> p_head then
    raise sqlstate 'PT409' using message = 'DOCUMENT_BUSY';
  end if;
  if p_restore is not null then
    select snapshot into v_target from x2x_private.versions where id = p_restore and document_id = d.id;
    if not found then raise sqlstate 'PT404' using message = 'VERSION_NOT_FOUND'; end if;
  end if;
  insert into x2x_private.versions(document_id, actor, generation, seq, name, snapshot)
  values(d.id, p_actor, d.generation, d.head, p_name, decode(p_snapshot, 'base64')) returning id into v_saved;
  if v_target is not null then
    update x2x_private.documents
    set snapshot = v_target, head = 0, snapshot_cursor = 0, generation = d.generation + 1,
      access_version = d.access_version + 1, updated_at = now()
    where id = d.id;
    perform x2x_private.send_notice(d.id, d.access_version + 1, 0);
  end if;
  return v_saved;
end;
$$;

revoke execute on function
  public.x2x_history(uuid,uuid,uuid), public.x2x_store_version(uuid,uuid,integer,integer,text,text,uuid)
from public, anon, authenticated;
grant execute on function
  public.x2x_history(uuid,uuid,uuid), public.x2x_store_version(uuid,uuid,integer,integer,text,text,uuid)
to service_role;
