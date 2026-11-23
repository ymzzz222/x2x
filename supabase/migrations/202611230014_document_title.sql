create function public.x2x_rename_document(p_actor uuid, p_document uuid, p_title text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  d x2x_private.documents;
begin
  select * into d from x2x_private.documents where id = p_document for update;
  if coalesce(x2x_private.role_for(p_document, p_actor), '') not in ('edit', 'manage') then
    raise sqlstate 'PT403' using message = 'WRITE_DENIED';
  end if;
  p_title := btrim(p_title);
  if p_title is null or length(p_title) not between 1 and 120 then
    raise sqlstate 'PT400' using message = 'INVALID_TITLE';
  end if;

  if d.title is distinct from p_title then
    update x2x_private.documents set title = p_title, updated_at = clock_timestamp() where id = d.id;
    perform x2x_private.send_notice(d.id, d.access_version, d.head);
  end if;
  return jsonb_build_object('title', p_title);
end;
$$;

revoke execute on function public.x2x_rename_document(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.x2x_rename_document(uuid, uuid, text) to service_role;
