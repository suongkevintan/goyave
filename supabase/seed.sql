-- ============================================================================
-- Voyage — Données de démonstration (seed reproductible)
-- UUID fixes → l'app peut référencer un trip connu (DEMO_TRIP_ID).
-- Idempotent : `on conflict (id) do nothing`.
-- Lancer via `supabase db reset` (auto) ou exécuter manuellement dans l'éditeur SQL.
-- ============================================================================

insert into trips (id, name, destination, description, start_date, end_date)
values (
  '11111111-1111-1111-1111-111111111111',
  'Road trip en Écosse', 'Highlands, Écosse',
  'Une semaine entre lochs, châteaux et whisky.',
  '2026-07-18', '2026-07-25'
)
on conflict (id) do nothing;

insert into participants (id, trip_id, name, status, allergies, notes) values
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Kevin', 'confirmed', null, 'Organisateur'),
  ('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Léa',   'confirmed', 'Fruits à coque', null),
  ('22222222-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Tom',   'uncertain', null, 'Conduit la voiture'),
  ('22222222-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Nina',  'confirmed', 'Lactose', null)
on conflict (id) do nothing;

insert into beacons (id, trip_id, participant_id, message, emoji) values
  ('33333333-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   '22222222-0000-0000-0000-000000000002',
   'Arrivée à Édimbourg, il pleut mais le château est magnifique !', '🏰')
on conflict (id) do nothing;
