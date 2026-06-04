-- ============================================================================
-- Voyage — Schéma Supabase (phase 2)
-- Dérivé de la note de cadrage (CONTEXT-SCOPE.md §6).
-- À exécuter dans l'éditeur SQL Supabase ou via `supabase db push`.
-- ============================================================================

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text,
  description text,
  cover_image_url text,
  start_date date,
  end_date date,
  share_token text unique default gen_random_uuid()::text,
  created_at timestamptz default now()
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  name text not null,
  avatar_url text,
  phone text,
  allergies text,
  notes text,
  status text default 'confirmed', -- confirmed | uncertain | withdrawn
  fingerprint text,                -- identification légère (phase 1)
  created_at timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  title text not null,
  description text,
  location text,
  lat float,
  lng float,
  duration_min int,
  cost_per_person numeric,
  status text default 'idea',      -- idea | validated | scheduled | done
  proposed_by uuid references participants(id),
  created_at timestamptz default now()
);

create table if not exists activity_votes (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid references activities(id) on delete cascade,
  participant_id uuid references participants(id) on delete cascade,
  type text default 'like',        -- like | love
  unique(activity_id, participant_id)
);

create table if not exists activity_comments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid references activities(id) on delete cascade,
  participant_id uuid references participants(id),
  content text not null,
  created_at timestamptz default now()
);

create table if not exists itinerary_slots (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  activity_id uuid references activities(id),
  slot_date date not null,
  period text not null,            -- morning | afternoon | evening
  order_index int default 0
);

create table if not exists availabilities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  participant_id uuid references participants(id) on delete cascade,
  avail_date date not null,
  period text not null,            -- morning | evening
  available boolean default true,
  unique(trip_id, participant_id, avail_date, period)
);

create table if not exists budget_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  category text not null,          -- transport | accommodation | rental | activities | food | misc
  description text not null,
  total_cost numeric,
  status text default 'to_book',   -- to_book | booked | paid
  link_url text,
  created_by uuid references participants(id),
  created_at timestamptz default now()
);

create table if not exists beacons (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  participant_id uuid references participants(id),
  message text not null,
  emoji text,
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  category text default 'misc',    -- bookings | finance | photos | misc
  label text not null,
  url text,
  file_path text,
  uploaded_by uuid references participants(id),
  created_at timestamptz default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  participant_id uuid references participants(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ── Index utiles ────────────────────────────────────────────────────────────
create index if not exists idx_participants_trip   on participants(trip_id);
create index if not exists idx_activities_trip      on activities(trip_id);
create index if not exists idx_votes_activity       on activity_votes(activity_id);
create index if not exists idx_comments_activity    on activity_comments(activity_id);
create index if not exists idx_availabilities_trip  on availabilities(trip_id);
create index if not exists idx_budget_trip          on budget_items(trip_id);
create index if not exists idx_beacons_trip         on beacons(trip_id);
create index if not exists idx_documents_trip       on documents(trip_id);

-- ── Storage ─────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('activity-media', 'activity-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- ── Realtime ────────────────────────────────────────────────────────────────
-- Activer la diffusion temps réel sur les tables collaboratives.
alter publication supabase_realtime add table activities;
alter publication supabase_realtime add table activity_votes;
alter publication supabase_realtime add table activity_comments;
alter publication supabase_realtime add table beacons;
alter publication supabase_realtime add table availabilities;

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Phase 1/2 : accès par lien (share_token), pas de compte. On active RLS sur
-- toutes les tables et on ouvre des policies permissives pour la clé anon
-- (l'accès est gardé côté app par la connaissance du share_token).
-- ⚠️ À durcir en phase 5 avec Supabase Auth (policies basées sur auth.uid()).

do $$
declare t text;
begin
  foreach t in array array[
    'trips','participants','activities','activity_votes','activity_comments',
    'itinerary_slots','availabilities','budget_items','beacons','documents','activity_logs'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format($f$
      create policy %I on %I for all
      to anon, authenticated
      using (true) with check (true);
    $f$, t || '_anon_all', t);
  end loop;
end $$;
