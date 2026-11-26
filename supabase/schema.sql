-- Jalankan di Supabase → SQL Editor
create extension if not exists pgcrypto;

create table profiles (id uuid primary key references auth.users on delete cascade, name text not null, avatar_url text, created_at timestamptz default now());
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null, description text not null default '', category text not null,
  photos text[] not null default '{}',
  found_at timestamptz not null, floor int not null, room_id text not null, location_note text,
  status text not null default 'belum_diambil' check (status in ('belum_diambil','sudah_diambil')),
  created_at timestamptz default now());
create table conversations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  finder_id uuid not null references profiles(id),
  claimer_id uuid not null references profiles(id),
  status text not null default 'active' check (status in ('active','closed')),
  closed_at timestamptz, created_at timestamptz default now(),
  unique (post_id, claimer_id));
create table messages (id uuid primary key default gen_random_uuid(), conversation_id uuid not null references conversations(id) on delete cascade, sender_id uuid not null references profiles(id), body text not null, created_at timestamptz default now());
-- token serah terima: hanya bisa dibaca pemilik (claimer), bukan penemu
create table handover_tokens (conversation_id uuid primary key references conversations(id) on delete cascade, token text not null);

create function new_token() returns trigger language plpgsql security definer as $$
begin insert into handover_tokens values (new.id, upper(encode(gen_random_bytes(4),'hex'))); return new; end $$;
create trigger trg_token after insert on conversations for each row execute function new_token();

create function complete_handover(p_conversation uuid, p_token text) returns void language plpgsql security definer as $$
declare c conversations; begin
  select * into c from conversations where id = p_conversation;
  if c.finder_id <> auth.uid() then raise exception 'Hanya penemu yang bisa menyelesaikan serah terima'; end if;
  if not exists (select 1 from handover_tokens where conversation_id = p_conversation and token = upper(trim(p_token))) then raise exception 'Kode tidak cocok'; end if;
  update posts set status='sudah_diambil' where id = c.post_id;
  update conversations set status='closed', closed_at=now() where post_id = c.post_id;
end $$;

alter table profiles enable row level security; alter table posts enable row level security;
alter table conversations enable row level security; alter table messages enable row level security; alter table handover_tokens enable row level security;
create policy "profiles read" on profiles for select to authenticated using (true);
create policy "profiles write" on profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "posts read" on posts for select to authenticated using (true);
create policy "posts insert" on posts for insert to authenticated with check (user_id = auth.uid());
create policy "posts update" on posts for update to authenticated using (user_id = auth.uid());
create policy "posts delete" on posts for delete to authenticated using (user_id = auth.uid());
create policy "conv read" on conversations for select to authenticated using (auth.uid() in (finder_id, claimer_id));
create policy "conv insert" on conversations for insert to authenticated with check (claimer_id = auth.uid() and finder_id <> auth.uid());
create policy "msg read" on messages for select to authenticated using (exists (select 1 from conversations c where c.id = conversation_id and auth.uid() in (c.finder_id, c.claimer_id)));
create policy "msg insert" on messages for insert to authenticated with check (sender_id = auth.uid() and exists (select 1 from conversations c where c.id = conversation_id and c.status='active' and auth.uid() in (c.finder_id, c.claimer_id)));
create policy "token read" on handover_tokens for select to authenticated using (exists (select 1 from conversations c where c.id = conversation_id and c.claimer_id = auth.uid()));

create function handle_new_user() returns trigger language plpgsql security definer as $$
begin insert into profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1))); return new; end $$;
create trigger on_signup after insert on auth.users for each row execute function handle_new_user();

alter publication supabase_realtime add table messages, conversations;
insert into storage.buckets (id, name, public) values ('photos','photos',true) on conflict do nothing;
create policy "photos read" on storage.objects for select using (bucket_id='photos');
create policy "photos upload" on storage.objects for insert to authenticated with check (bucket_id='photos' and (storage.foldername(name))[1] = auth.uid()::text);
