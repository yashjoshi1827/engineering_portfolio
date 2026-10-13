-- Run once in a NEW Supabase project's SQL Editor, as postgres.
begin;
create table if not exists public.portfolio_owner (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id)
);
alter table public.portfolio_owner enable row level security;
revoke all on public.portfolio_owner from anon, authenticated;

create or replace function public.is_portfolio_owner() returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.portfolio_owner where user_id = auth.uid());
$$;
revoke all on function public.is_portfolio_owner() from public;
grant execute on function public.is_portfolio_owner() to authenticated;

create table if not exists public.portfolio_records (
 id uuid primary key,
 owner_id uuid not null references auth.users(id),
 kind text not null check(kind in ('logs','notes','goals','announcements','files')),
 payload jsonb not null,
 revision bigint not null default 1,
 operation_id uuid not null,
 deleted boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.portfolio_records enable row level security;
revoke all on public.portfolio_records from anon, authenticated;
grant select on public.portfolio_records to authenticated;
create policy portfolio_owner_read on public.portfolio_records for select to authenticated
using (owner_id = auth.uid() and public.is_portfolio_owner());

create table if not exists public.portfolio_public (
 id uuid primary key,
 kind text not null check(kind in ('logs','notes','announcements')),
 snapshot jsonb not null,
 updated_at timestamptz not null default now()
);
alter table public.portfolio_public enable row level security;
revoke all on public.portfolio_public from anon, authenticated;
grant select on public.portfolio_public to anon, authenticated;
create policy portfolio_public_read on public.portfolio_public for select to anon, authenticated using (true);

-- Only this RPC may mutate records. Optimistic revisions prevent silent overwrites.
create or replace function public.save_portfolio_record(
 p_id uuid, p_kind text, p_payload jsonb, p_revision bigint,
 p_deleted boolean, p_operation uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare old public.portfolio_records; saved public.portfolio_records; pub jsonb; allowed text[]; snap jsonb;
begin
 if not public.is_portfolio_owner() then raise exception 'Owner access required' using errcode='42501'; end if;
 if p_kind not in ('logs','notes','goals','announcements','files') or p_kind is null then raise exception 'Invalid record kind'; end if;
 if p_revision is null or p_revision < 0 or p_operation is null or p_deleted is null then raise exception 'Invalid revision'; end if;
 if p_payload is null or jsonb_typeof(p_payload) <> 'object' or octet_length(p_payload::text)>1000000 then raise exception 'Record must be an object under 1 MB'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into old from public.portfolio_records where id=p_id;
 if found then
   if old.owner_id <> auth.uid() or old.kind <> p_kind then raise exception 'Record identity mismatch'; end if;
   if old.operation_id=p_operation then return jsonb_build_object('ok',true,'record',to_jsonb(old)); end if;
   if old.revision<>p_revision then return jsonb_build_object('ok',false,'record',to_jsonb(old)); end if;
 else
   if p_revision<>0 then return jsonb_build_object('ok',false,'record',null); end if;
 end if;
 insert into public.portfolio_records(id,owner_id,kind,payload,revision,operation_id,deleted)
 values(p_id,auth.uid(),p_kind,p_payload,coalesce(old.revision,0)+1,p_operation,p_deleted)
 on conflict(id) do update set payload=excluded.payload,revision=excluded.revision,operation_id=excluded.operation_id,deleted=excluded.deleted,updated_at=now()
 returning * into saved;
 pub=p_payload->'published';
 if not p_deleted and p_kind in ('logs','notes','announcements') and jsonb_typeof(pub)='object' then
   allowed=case p_kind when 'logs' then array['title','project','objective','work','results','problems','next','at'] when 'notes' then array['title','project','category','markdown','at'] else array['title','body','at'] end;
   select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into snap from jsonb_each(pub) where key=any(allowed) and jsonb_typeof(value)='string';
   insert into public.portfolio_public(id,kind,snapshot) values(p_id,p_kind,snap)
   on conflict(id) do update set snapshot=excluded.snapshot,updated_at=now();
 else
   delete from public.portfolio_public where id=p_id;
 end if;
 return jsonb_build_object('ok',true,'record',to_jsonb(saved));
end; $$;
revoke all on function public.save_portfolio_record(uuid,text,jsonb,bigint,boolean,uuid) from public;
grant execute on function public.save_portfolio_record(uuid,text,jsonb,bigint,boolean,uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit)
values('portfolio-private','portfolio-private',false,47185920)
on conflict(id) do update set public=false,file_size_limit=47185920;
create policy portfolio_files_read on storage.objects for select to authenticated
using(bucket_id='portfolio-private' and public.is_portfolio_owner() and (storage.foldername(name))[1]=auth.uid()::text);
create policy portfolio_files_insert on storage.objects for insert to authenticated
with check(bucket_id='portfolio-private' and public.is_portfolio_owner() and (storage.foldername(name))[1]=auth.uid()::text);
create policy portfolio_files_update on storage.objects for update to authenticated
using(bucket_id='portfolio-private' and public.is_portfolio_owner() and (storage.foldername(name))[1]=auth.uid()::text)
with check(bucket_id='portfolio-private' and public.is_portfolio_owner() and (storage.foldername(name))[1]=auth.uid()::text);
create policy portfolio_files_delete on storage.objects for delete to authenticated
using(bucket_id='portfolio-private' and public.is_portfolio_owner() and (storage.foldername(name))[1]=auth.uid()::text);
commit;
