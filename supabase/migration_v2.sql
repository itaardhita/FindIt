-- Jalankan SETELAH schema.sql (Supabase → SQL Editor). Aman dijalankan ulang.
create table if not exists bookmarks (user_id uuid references profiles(id) on delete cascade, post_id uuid references posts(id) on delete cascade, created_at timestamptz default now(), primary key (user_id, post_id));
create table if not exists blocks (blocker_id uuid references profiles(id) on delete cascade, blocked_id uuid references profiles(id) on delete cascade, created_at timestamptz default now(), primary key (blocker_id, blocked_id));
create table if not exists reports (id uuid primary key default gen_random_uuid(), reporter_id uuid not null references profiles(id) on delete cascade, post_id uuid references posts(id) on delete cascade, reported_user_id uuid references profiles(id) on delete cascade, reason text not null, details text, created_at timestamptz default now());
create table if not exists notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id) on delete cascade, type text not null, title text not null, body text not null default '', link text, read boolean not null default false, created_at timestamptz default now());
alter table bookmarks enable row level security; alter table blocks enable row level security; alter table reports enable row level security; alter table notifications enable row level security;
drop policy if exists "bm all" on bookmarks; create policy "bm all" on bookmarks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "blk all" on blocks; create policy "blk all" on blocks for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid() and blocked_id <> auth.uid());
drop policy if exists "rep insert" on reports; create policy "rep insert" on reports for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists "ntf read" on notifications; create policy "ntf read" on notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "ntf update" on notifications; create policy "ntf update" on notifications for update to authenticated using (user_id = auth.uid());

-- Block: tidak bisa mulai chat / kirim pesan jika salah satu memblokir
create or replace function is_blocked(a uuid, b uuid) returns boolean language sql security definer stable as $$
  select exists (select 1 from blocks where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)) $$;
drop policy if exists "conv insert" on conversations;
create policy "conv insert" on conversations for insert to authenticated with check (claimer_id = auth.uid() and finder_id <> auth.uid() and not is_blocked(claimer_id, finder_id));
drop policy if exists "msg insert" on messages;
create policy "msg insert" on messages for insert to authenticated with check (sender_id = auth.uid() and exists (select 1 from conversations c where c.id = conversation_id and c.status = 'active' and auth.uid() in (c.finder_id, c.claimer_id) and not is_blocked(c.finder_id, c.claimer_id)));

-- Notifikasi otomatis
create or replace function notify_claim() returns trigger language plpgsql security definer as $$
declare t text; n text; begin
  select title into t from posts where id = new.post_id; select name into n from profiles where id = new.claimer_id;
  insert into notifications (user_id, type, title, body, link) values (new.finder_id, 'claim', 'Ada yang mengklaim barangmu', n || ' merasa "' || t || '" adalah miliknya.', '/messages/' || new.id);
  return new; end $$;
drop trigger if exists trg_notify_claim on conversations;
create trigger trg_notify_claim after insert on conversations for each row execute function notify_claim();

create or replace function notify_message() returns trigger language plpgsql security definer as $$
declare c conversations; n text; r uuid; begin
  select * into c from conversations where id = new.conversation_id; select name into n from profiles where id = new.sender_id;
  r := case when new.sender_id = c.finder_id then c.claimer_id else c.finder_id end;
  insert into notifications (user_id, type, title, body, link) values (r, 'message', n, left(new.body, 80), '/messages/' || c.id);
  return new; end $$;
drop trigger if exists trg_notify_message on messages;
create trigger trg_notify_message after insert on messages for each row execute function notify_message();

create or replace function complete_handover(p_conversation uuid, p_token text) returns void language plpgsql security definer as $$
declare c conversations; t text; begin
  select * into c from conversations where id = p_conversation;
  if c.finder_id <> auth.uid() then raise exception 'Hanya penemu yang bisa menyelesaikan serah terima'; end if;
  if not exists (select 1 from handover_tokens where conversation_id = p_conversation and token = upper(trim(p_token))) then raise exception 'Kode tidak cocok'; end if;
  select title into t from posts where id = c.post_id;
  update posts set status = 'sudah_diambil' where id = c.post_id;
  update conversations set status = 'closed', closed_at = now() where post_id = c.post_id;
  insert into notifications (user_id, type, title, body, link) values
    (c.finder_id, 'handover', 'Serah terima selesai', '"' || t || '" sudah diserahkan ke pemiliknya.', '/history'),
    (c.claimer_id, 'handover', 'Barangmu sudah kembali', '"' || t || '" tercatat sudah kamu terima.', '/history');
end $$;

-- Realtime untuk status postingan & notifikasi
do $$ begin
  begin alter publication supabase_realtime add table posts; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table notifications; exception when duplicate_object then null; end;
end $$;
