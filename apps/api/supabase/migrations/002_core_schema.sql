-- Perkley core schema: profiles, campaigns, submissions, escrow, payouts, audit, notifications.
-- Run after 001_waitlist.sql. Apply via Supabase SQL editor or `supabase db push`.

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('brand', 'creator', 'admin')),
  display_name text,
  email text,
  phone text,
  instagram_handle text,
  instagram_user_id text,
  instagram_access_token text,
  instagram_token_expires_at timestamptz,
  followers_count int,
  niche text,
  account_type text check (account_type is null or account_type in ('personal', 'business', 'creator')),
  trust_score numeric not null default 100,
  is_banned boolean not null default false,
  kyc_status text not null default 'none' check (kyc_status in ('none', 'pending', 'verified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_instagram_handle_idx on public.profiles (instagram_handle)
  where instagram_handle is not null;

-- Hide OAuth tokens from authenticated/anon clients — service role only.
revoke all on public.profiles from anon, authenticated;
grant select (
  id, role, display_name, email, phone, instagram_handle, followers_count,
  niche, account_type, trust_score, is_banned, kyc_status, created_at, updated_at
) on public.profiles to authenticated;
grant update (
  display_name, phone, instagram_handle, niche, account_type
) on public.profiles to authenticated;

-- Auto-create profile row on signup (role set by app metadata).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data ->> 'role', 'creator');
  if user_role not in ('brand', 'creator', 'admin') then
    user_role := 'creator';
  end if;

  insert into public.profiles (id, role, display_name, email)
  values (
    new.id,
    user_role,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.email
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  description text,
  bounty_type text not null check (bounty_type in ('awareness', 'referral', 'sales', 'hybrid')),
  budget numeric not null check (budget > 0),
  reward_structure jsonb not null default '{}'::jsonb,
  eligibility jsonb not null default '{}'::jsonb,
  required_hashtags text[] not null default '{}',
  required_mentions text[] not null default '{}',
  status text not null default 'draft' check (
    status in ('draft', 'pending_funding', 'active', 'completed', 'cancelled')
  ),
  max_participants int,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaigns_brand_id_idx on public.campaigns (brand_id);
create index if not exists campaigns_status_ends_at_idx on public.campaigns (status, ends_at);

-- ---------------------------------------------------------------------------
-- Campaign participants
-- ---------------------------------------------------------------------------

create table if not exists public.campaign_participants (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  creator_id uuid not null references public.profiles (id) on delete restrict,
  referral_code text unique,
  status text not null default 'joined' check (
    status in ('joined', 'submitted', 'verified', 'disqualified', 'paid')
  ),
  disqualification_reason text,
  joined_at timestamptz not null default now(),
  unique (campaign_id, creator_id)
);

create index if not exists campaign_participants_campaign_id_idx
  on public.campaign_participants (campaign_id);
create index if not exists campaign_participants_creator_id_idx
  on public.campaign_participants (creator_id);

-- ---------------------------------------------------------------------------
-- Submissions
-- ---------------------------------------------------------------------------

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.campaign_participants (id) on delete cascade,
  content_url text not null,
  platform_media_id text,
  platform text not null default 'instagram',
  verified boolean not null default false,
  verified_by uuid references public.profiles (id),
  verified_at timestamptz,
  rejection_reason text,
  flagged_for_review boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists submissions_participant_id_idx
  on public.submissions (participant_id);

-- ---------------------------------------------------------------------------
-- Metrics snapshots
-- ---------------------------------------------------------------------------

create table if not exists public.metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  views int not null default 0,
  likes int not null default 0,
  comments int not null default 0,
  shares int not null default 0,
  saves int not null default 0,
  reach int not null default 0,
  fetched_at timestamptz not null default now()
);

create index if not exists metrics_snapshots_submission_fetched_idx
  on public.metrics_snapshots (submission_id, fetched_at desc);

-- ---------------------------------------------------------------------------
-- Referral events
-- ---------------------------------------------------------------------------

create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.campaign_participants (id) on delete cascade,
  event_type text not null check (event_type in ('click', 'signup', 'sale')),
  value numeric not null default 0,
  source_ip inet,
  user_agent text,
  is_suspicious boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists referral_events_participant_event_idx
  on public.referral_events (participant_id, event_type);

-- ---------------------------------------------------------------------------
-- Escrow transactions
-- ---------------------------------------------------------------------------

create table if not exists public.escrow_transactions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete restrict,
  razorpay_order_id text,
  razorpay_payment_id text,
  amount numeric not null check (amount > 0),
  status text not null default 'pending' check (
    status in ('pending', 'funded', 'released', 'refunded', 'failed')
  ),
  created_at timestamptz not null default now()
);

create index if not exists escrow_transactions_campaign_id_idx
  on public.escrow_transactions (campaign_id);

-- ---------------------------------------------------------------------------
-- Payouts
-- ---------------------------------------------------------------------------

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.campaign_participants (id) on delete restrict,
  campaign_id uuid not null references public.campaigns (id) on delete restrict,
  amount numeric not null check (amount > 0),
  razorpay_payout_id text,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'paid', 'failed', 'on_hold')
  ),
  failure_reason text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists payouts_participant_id_idx on public.payouts (participant_id);
create index if not exists payouts_campaign_id_idx on public.payouts (campaign_id);

-- ---------------------------------------------------------------------------
-- Audit log (backend / admin only via service role)
-- ---------------------------------------------------------------------------

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_entity_idx
  on public.audit_log (entity_type, entity_id);
create index if not exists audit_log_created_at_idx
  on public.audit_log (created_at desc);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx
  on public.notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_participants enable row level security;
alter table public.submissions enable row level security;
alter table public.metrics_snapshots enable row level security;
alter table public.referral_events enable row level security;
alter table public.escrow_transactions enable row level security;
alter table public.payouts enable row level security;
alter table public.audit_log enable row level security;
alter table public.notifications enable row level security;

-- Helper: current user's profile role
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Profiles: read own row; update own safe fields
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy profiles_select_public_creators on public.profiles
  for select to authenticated
  using (role = 'creator' and is_banned = false);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Campaigns: brand owns CRUD; creators read active campaigns
create policy campaigns_brand_all on public.campaigns
  for all to authenticated
  using (brand_id = auth.uid())
  with check (brand_id = auth.uid());

create policy campaigns_creator_read_active on public.campaigns
  for select to authenticated
  using (
    status = 'active'
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

-- Participants: creator owns; brand reads for own campaigns
create policy participants_creator_all on public.campaign_participants
  for all to authenticated
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

create policy participants_brand_read on public.campaign_participants
  for select to authenticated
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.brand_id = auth.uid()
    )
  );

-- Submissions: creator owns; brand reads via campaign
create policy submissions_creator_all on public.submissions
  for all to authenticated
  using (
    exists (
      select 1 from public.campaign_participants cp
      where cp.id = participant_id and cp.creator_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.campaign_participants cp
      where cp.id = participant_id and cp.creator_id = auth.uid()
    )
  );

create policy submissions_brand_read on public.submissions
  for select to authenticated
  using (
    exists (
      select 1
      from public.campaign_participants cp
      join public.campaigns c on c.id = cp.campaign_id
      where cp.id = participant_id and c.brand_id = auth.uid()
    )
  );

-- Metrics: readable if submission is readable
create policy metrics_creator_read on public.metrics_snapshots
  for select to authenticated
  using (
    exists (
      select 1
      from public.submissions s
      join public.campaign_participants cp on cp.id = s.participant_id
      where s.id = submission_id and cp.creator_id = auth.uid()
    )
  );

create policy metrics_brand_read on public.metrics_snapshots
  for select to authenticated
  using (
    exists (
      select 1
      from public.submissions s
      join public.campaign_participants cp on cp.id = s.participant_id
      join public.campaigns c on c.id = cp.campaign_id
      where s.id = submission_id and c.brand_id = auth.uid()
    )
  );

-- Referral events: creator read own; brand read own campaigns
create policy referral_events_creator_read on public.referral_events
  for select to authenticated
  using (
    exists (
      select 1 from public.campaign_participants cp
      where cp.id = participant_id and cp.creator_id = auth.uid()
    )
  );

create policy referral_events_brand_read on public.referral_events
  for select to authenticated
  using (
    exists (
      select 1
      from public.campaign_participants cp
      join public.campaigns c on c.id = cp.campaign_id
      where cp.id = participant_id and c.brand_id = auth.uid()
    )
  );

-- Escrow: brand reads own campaign escrow
create policy escrow_brand_read on public.escrow_transactions
  for select to authenticated
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.brand_id = auth.uid()
    )
  );

-- Payouts: creator reads own; brand reads own campaigns
create policy payouts_creator_read on public.payouts
  for select to authenticated
  using (
    exists (
      select 1 from public.campaign_participants cp
      where cp.id = participant_id and cp.creator_id = auth.uid()
    )
  );

create policy payouts_brand_read on public.payouts
  for select to authenticated
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.brand_id = auth.uid()
    )
  );

-- Notifications: user reads/updates own
create policy notifications_own on public.notifications
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Audit log: no client access (service role only)
-- No policies for anon/authenticated — backend uses service role key.
