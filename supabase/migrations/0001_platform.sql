-- ============================================================
-- Poema — Platform migration (Phase 1 + scaffolding for 2/3)
-- Run this AFTER schema.sql on a FRESH public-platform database.
-- This file intentionally leaves schema.sql untouched for the
-- legacy single-user deploy (poema-self).
-- ============================================================

-- --------------------------------------------------------
-- PROFILES — extend for the public platform
-- --------------------------------------------------------

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists website    text;

-- username shape: lowercase alphanumerics + underscore, 2–30 chars.
-- Enforced at DB level; UI also validates.
do $$ begin
  alter table public.profiles
    add constraint profiles_username_shape
      check (username is null or username ~ '^[a-z0-9_]{2,30}$');
exception when duplicate_object then null; end $$;

-- Case-insensitive username uniqueness. ("Alice" == "alice")
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- Reserved slugs: names that collide with top-level routes.
-- Mirrored in lib/reserved.ts for client-side validation.
create table if not exists public.reserved_slugs (slug text primary key);

insert into public.reserved_slugs(slug) values
  ('signin'),('signup'),('signout'),('auth'),('write'),('settings'),
  ('following'),('bookmarks'),('explore'),('dashboard'),('admin'),
  ('api'),('poems'),('collections'),('p'),('c'),('about'),('terms'),
  ('privacy'),('help'),('search'),('notifications'),('home'),('new'),
  ('edit'),('drafts'),('static'),('_next'),('favicon.ico'),
  ('onboarding'),('poema'),('www')
on conflict do nothing;

create or replace function public.username_not_reserved()
returns trigger language plpgsql as $$
begin
  if new.username is not null
     and exists (select 1 from public.reserved_slugs where slug = lower(new.username)) then
    raise exception 'username "%" is reserved', new.username;
  end if;
  return new;
end; $$;

drop trigger if exists profiles_username_reserved on public.profiles;
create trigger profiles_username_reserved
  before insert or update of username on public.profiles
  for each row execute function public.username_not_reserved();

-- Auto-create a profile row on auth.users insert.
-- username stays NULL; the onboarding page prompts the user to pick one.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Explicit insert policy for self (the trigger above runs as definer,
-- but this also lets clients self-insert if ever needed).
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles for insert
  to authenticated with check (auth.uid() = id);

-- --------------------------------------------------------
-- COLLECTIONS (chapbooks) — created before poems reference it
-- --------------------------------------------------------

do $$ begin
  create type poem_status as enum ('draft','scheduled','published');
exception when duplicate_object then null; end $$;

create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  slug        text not null,
  description text,
  status      poem_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index if not exists collections_author_slug_idx
  on public.collections(author_id, slug);

alter table public.collections enable row level security;

drop policy if exists "collections_read" on public.collections;
create policy "collections_read" on public.collections for select
  to anon, authenticated
  using (status = 'published' or (auth.uid() is not null and auth.uid() = author_id));

drop policy if exists "collections_cud_own" on public.collections;
create policy "collections_cud_own" on public.collections for all
  to authenticated
  using  (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- --------------------------------------------------------
-- POEMS — extend for drafts, scheduling, slugs, collections
-- --------------------------------------------------------

alter table public.poems
  add column if not exists slug                text,
  add column if not exists status              poem_status  not null default 'draft',
  add column if not exists published_at        timestamptz,
  add column if not exists scheduled_for       timestamptz,
  add column if not exists collection_id       uuid references public.collections(id) on delete set null,
  add column if not exists collection_position int,
  add column if not exists updated_at          timestamptz not null default now();

-- Per-author slug uniqueness so /alice/p/first-frost is stable.
create unique index if not exists poems_author_slug_idx
  on public.poems (author_id, slug)
  where slug is not null;

-- Feed indexes
create index if not exists poems_feed_idx
  on public.poems (status, published_at desc)
  where status = 'published';

create index if not exists poems_author_feed_idx
  on public.poems (author_id, status, published_at desc);

-- updated_at auto-maintain
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists poems_touch on public.poems;
create trigger poems_touch before update on public.poems
  for each row execute function public.touch_updated_at();

drop trigger if exists collections_touch on public.collections;
create trigger collections_touch before update on public.collections
  for each row execute function public.touch_updated_at();

-- Rewrite RLS — drop permissive legacy policies and replace with
-- status-aware, owner-scoped policies.
drop policy if exists "Public read"   on public.poems;
drop policy if exists "Auth insert"   on public.poems;
drop policy if exists "Auth update"   on public.poems;
drop policy if exists "Auth delete"   on public.poems;
drop policy if exists "poems_read"          on public.poems;
drop policy if exists "poems_insert_self"   on public.poems;
drop policy if exists "poems_update_own"    on public.poems;
drop policy if exists "poems_delete_own"    on public.poems;

-- Readers see: (published AND publish time has arrived) OR their own rows.
-- The coalesce handles "publish now" inserts where published_at is set to now().
create policy "poems_read" on public.poems for select
  to anon, authenticated
  using (
    (status = 'published' and coalesce(published_at, created_at) <= now())
    or (auth.uid() is not null and auth.uid() = author_id)
  );

create policy "poems_insert_self" on public.poems for insert
  to authenticated with check (auth.uid() = author_id);

create policy "poems_update_own" on public.poems for update
  to authenticated
  using  (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "poems_delete_own" on public.poems for delete
  to authenticated using (auth.uid() = author_id);

-- --------------------------------------------------------
-- FOLLOWS — who follows whom (Phase 2 feature)
-- --------------------------------------------------------

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followee_id uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index if not exists follows_followee_idx on public.follows(followee_id);

alter table public.follows enable row level security;

drop policy if exists "follows_read" on public.follows;
create policy "follows_read" on public.follows for select
  to anon, authenticated using (true);

drop policy if exists "follows_insert_self" on public.follows;
create policy "follows_insert_self" on public.follows for insert
  to authenticated with check (auth.uid() = follower_id);

drop policy if exists "follows_delete_self" on public.follows;
create policy "follows_delete_self" on public.follows for delete
  to authenticated using (auth.uid() = follower_id);

-- --------------------------------------------------------
-- BOOKMARKS — private saves (Phase 2 feature)
-- --------------------------------------------------------

create table if not exists public.bookmarks (
  user_id    uuid not null references auth.users(id) on delete cascade,
  poem_id    uuid not null references public.poems(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, poem_id)
);

create index if not exists bookmarks_user_idx on public.bookmarks(user_id, created_at desc);

alter table public.bookmarks enable row level security;

drop policy if exists "bookmarks_read_own" on public.bookmarks;
create policy "bookmarks_read_own" on public.bookmarks for select
  to authenticated using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_self" on public.bookmarks;
create policy "bookmarks_insert_self" on public.bookmarks for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_self" on public.bookmarks;
create policy "bookmarks_delete_self" on public.bookmarks for delete
  to authenticated using (auth.uid() = user_id);

-- --------------------------------------------------------
-- PUBLIC_POEMS view — feed queries don't repeat the filter
-- --------------------------------------------------------

create or replace view public.public_poems as
  select
    p.id, p.title, p.content, p.tags, p.slug, p.status,
    p.published_at, p.created_at, p.updated_at,
    p.collection_id, p.collection_position,
    p.author_id,
    pr.username       as author_username,
    pr.display_name   as author_display_name,
    pr.avatar_url     as author_avatar_url
  from public.poems p
  join public.profiles pr on pr.id = p.author_id
  where p.status = 'published'
    and coalesce(p.published_at, p.created_at) <= now()
    and pr.username is not null;
