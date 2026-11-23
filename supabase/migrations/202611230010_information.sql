alter table x2x_private.documents add column created_by uuid references auth.users(id);
update x2x_private.documents set created_by = owner_id where created_by is null;
alter table x2x_private.documents alter column created_by set not null;

create function x2x_private.remember_creator()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  new.created_by := new.owner_id;
  return new;
end;
$$;
create trigger x2x_document_creator before insert on x2x_private.documents
for each row execute function x2x_private.remember_creator();

create function x2x_private.audit_document_access()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid;
  v_operation text;
begin
  if new.access_version = old.access_version then return new; end if;
  v_actor := (nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-x2x-audit-actor')::uuid;
  if v_actor is null then return new; end if;
  if new.owner_id <> old.owner_id then v_operation := 'transfer';
  elsif new.generation <> old.generation then v_operation := 'restore';
  elsif new.classification <> old.classification or new.watermark <> old.watermark or
    new.external_share <> old.external_share or new.action_rules <> old.action_rules then return new;
  else v_operation := 'permissions';
  end if;
  insert into x2x_private.audit(document_id, actor, operation) values(new.id, v_actor, v_operation);
  return new;
end;
$$;
create trigger x2x_track_document_access after update on x2x_private.documents
for each row execute function x2x_private.audit_document_access();

create function public.x2x_document_information(p_actor uuid, p_document uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  perform 1 from x2x_private.documents where id = p_document for share;
  if x2x_private.role_for(p_document, p_actor) is null then raise sqlstate 'PT403' using message = 'ACCESS_DENIED'; end if;
  return (select jsonb_build_object('creator', split_part(u.email, '@', 1))
  from x2x_private.documents d join auth.users u on u.id = d.created_by where d.id = p_document);
end;
$$;

revoke execute on function x2x_private.remember_creator(), x2x_private.audit_document_access() from public, anon, authenticated;
revoke execute on function public.x2x_document_information(uuid,uuid) from public, anon, authenticated;
grant execute on function public.x2x_document_information(uuid,uuid) to service_role;
