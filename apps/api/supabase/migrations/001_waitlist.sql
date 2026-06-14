create extension if not exists "pgcrypto";

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('brand', 'creator')),
  name text not null,
  email text not null,
  company text,
  instagram text,
  niche text,
  followers text,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_role_idx
  on public.waitlist (email, role);

alter table public.waitlist enable row level security;
