-- HerCare+ Supabase / PostgreSQL schema (production reference)
--
-- This is the intended persistence layer behind the current device-local
-- implementation. The frontend auth/records services are written so that
-- swapping localStorage for the network client touches only services/*,
-- not the UI. Apply with: supabase db push  (or psql -f schema.sql)
--
-- Privacy by design:
--   * Health records are only ever readable by their owner (RLS below).
--   * OTP codes are stored hashed; plaintext never persists.
--   * Emergency/safety data is separated so it can be audited independently.

-- Users keyed by phone number (verified identity), not email.
create table if not exists public.profiles (
  id               uuid primary key default gen_random_uuid(),
  phone            text unique not null,          -- normalised +91XXXXXXXXXX
  display_name     text,
  language         text not null default 'en' check (language in ('en','hi','kn')),
  phone_verified   boolean not null default false,
  created_at       timestamptz not null default now()
);

-- Server-owned OTP requests. The client can create and verify, never read.
create table if not exists public.otp_requests (
  id            uuid primary key default gen_random_uuid(),
  phone         text not null,
  code_hash     text not null,                     -- sha256(salt.code)
  salt          text not null,
  attempts      integer not null default 0,
  max_attempts  integer not null default 5,
  expires_at    timestamptz not null,
  used          boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists otp_requests_phone_idx on public.otp_requests (phone, created_at desc);

-- Per-user health records. All scoped to auth.uid() -> profiles.id.
create table if not exists public.period_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  start      date not null,
  end        date,
  flow       text check (flow in ('light','medium','heavy')),
  symptoms   text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.maternal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null check (type in ('bp','weight','iron','appointment','milestone')),
  date       date not null,
  value      text,
  note       text,
  created_at timestamptz not null default now()
);

create table if not exists public.infant_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null check (type in ('feeding','sleep','vaccination','growth','milestone','appointment')),
  date       date not null,
  value      text,
  note       text,
  created_at timestamptz not null default now()
);

-- Recovery journal. Contents may be sensitive; owner-only, never shared by default.
create table if not exists public.recovery_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  date       date not null,
  type       text not null check (type in ('craving','anxiety','pain','sleep','win')),
  intensity  integer check (intensity between 1 and 5),
  note       text,
  created_at timestamptz not null default now()
);

create table if not exists public.recovery_profiles (
  user_id             uuid primary key references public.profiles(id) on delete cascade,
  quit_date           date not null,
  daily_spend_rupees  integer not null default 0,
  pin_hash            text                        -- optional local privacy lock only
);

-- Safety: trusted contacts and privately stored incident reports.
create table if not exists public.trusted_contacts (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references public.profiles(id) on delete cascade,
  name     text not null,
  phone    text not null,
  relation text
);

create table if not exists public.incident_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  category    text not null,
  occurred_on date,
  description text not null,
  contact     text,
  follow_up   text check (follow_up in ('call','sms','none')),
  created_at  timestamptz not null default now()
);

-- The public facility directory has no per-user RLS; it is read-only and
-- verified records are curated by staff. `is_sample` guards demo vs real data.
create table if not exists public.facilities (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null,
  ownership     text not null check (ownership in ('government','private')),
  free          boolean not null default false,
  fee_verified  boolean not null default false,
  fee_note      text,
  specialities  text[] not null default '{}',
  female_doctor boolean,
  languages     text[] not null default '{}',
  address       text,
  state         text not null,
  district      text not null,
  block         text not null,
  village       text not null,
  phone         text,
  hours         text,
  source        text,
  last_verified date,
  is_sample     boolean not null default true
);

-- ---- Row Level Security --------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.period_entries    enable row level security;
alter table public.maternal_entries  enable row level security;
alter table public.infant_entries    enable row level security;
alter table public.recovery_logs     enable row level security;
alter table public.recovery_profiles enable row level security;
alter table public.trusted_contacts  enable row level security;
alter table public.incident_reports  enable row level security;
alter table public.otp_requests      enable row level security;
alter table public.facilities        enable row level security;

-- OTP + profile writes happen through a service role (the API), so authenticated
-- users get no direct access to otp_requests at all.
create policy "self profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Health + safety records: owner-only for every operation.
create policy "owner period" on public.period_entries    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner maternal" on public.maternal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner infant" on public.infant_entries     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner recovery_logs" on public.recovery_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner recovery_profile" on public.recovery_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner contacts" on public.trusted_contacts  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner reports" on public.incident_reports   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Facility directory: public read, staff/service-role write.
create policy "public read facilities" on public.facilities for select using (true);
