-- ============================================================
-- Poema — Database Schema
-- Run this in your Supabase SQL editor before starting the app
-- ============================================================

-- --------------------------------------------------------
-- profiles table (future: poet accounts + custom subdomains)
-- Currently unused by the UI; the column exists so the
-- migration to multi-tenancy requires no destructive changes.
-- --------------------------------------------------------
create table if not exists public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  username     text        unique,
  display_name text,
  bio          text,
  slug         text        unique,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public read profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Owner update profile"
  on public.profiles for update
  to authenticated
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- --------------------------------------------------------
-- poems table
-- author_id is nullable for now (admin-seeded poems have no
-- owner). When poet accounts ship, set it to the user's id
-- on insert and tighten the RLS policies accordingly.
-- --------------------------------------------------------
create table if not exists public.poems (
  id         uuid        primary key default gen_random_uuid(),
  title      text        not null,
  content    text        not null,
  tags       text[]      not null default '{}',
  author_id  uuid        references auth.users(id) on delete set null, -- future poet ownership
  created_at timestamptz not null default now()
);

alter table public.poems enable row level security;

-- Anyone (including anonymous visitors) can read poems
create policy "Public read"
  on public.poems for select
  to anon, authenticated
  using (true);

-- Authenticated users can insert poems
-- TODO: when poet accounts ship, also set author_id = auth.uid() via with check
create policy "Auth insert"
  on public.poems for insert
  to authenticated
  with check (true);

-- Authenticated users can update poems
-- TODO: tighten to (auth.uid() = author_id) once every poem has an owner
create policy "Auth update"
  on public.poems for update
  to authenticated
  using  (true)
  with check (true);

-- Authenticated users can delete poems
-- TODO: tighten to (auth.uid() = author_id) once every poem has an owner
create policy "Auth delete"
  on public.poems for delete
  to authenticated
  using (true);
