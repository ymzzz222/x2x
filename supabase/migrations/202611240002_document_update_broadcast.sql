create function x2x_private.send_update(
  p_document uuid, p_version integer, p_seq integer, p_generation integer, p_schema integer, p_data text
)
returns void language plpgsql set search_path = ''
as $$
begin
  -- Leave room for the Realtime envelope and match maximumRealtimeUpdateChars in the client.
  if octet_length(p_data) <= 65536 then
    perform realtime.send(
      jsonb_build_object('cursor', p_seq, 'generation', p_generation, 'schema', p_schema, 'data', p_data),
      'saved',
      x2x_private.topic_for(p_document, p_version),
      true
    );
  else
    perform x2x_private.send_notice(p_document, p_version, p_seq);
  end if;
exception when others then
  perform x2x_private.send_notice(p_document, p_version, p_seq);
end;
$$;

revoke execute on function x2x_private.send_update(uuid, integer, integer, integer, integer, text)
  from public, anon, authenticated;

create or replace function public.x2x_append_update(p_actor uuid, p_document uuid, p_generation integer, p_schema integer, p_batch uuid, p_update text)
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
  perform x2x_private.send_update(d.id, d.access_version, d.head, d.generation, d.schema_version, p_update);
  return jsonb_build_object('seq', d.head, 'savedAt', v_saved_at);
end;
$$;
