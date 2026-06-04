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

insert into activities (id, trip_id, title, description, location, lat, lng, duration_min, cost_per_person, status, proposed_by) values
  ('44444444-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Croisière sur le Loch Ness', 'Balade en bateau et chasse au monstre (optionnelle).', 'Loch Ness', 57.3229, -4.4244, 120, 25, 'validated', '22222222-0000-0000-0000-000000000002'),
  ('44444444-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Château d''Édimbourg', 'Visite du château et de la vieille ville.', 'Édimbourg', 55.9486, -3.1999, 180, 19, 'idea', '22222222-0000-0000-0000-000000000001'),
  ('44444444-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Viaduc de Glenfinnan', 'Le viaduc du Poudlard Express.', 'Glenfinnan', 56.8721, -5.4331, 90, 0, 'idea', '22222222-0000-0000-0000-000000000004')
on conflict (id) do nothing;

insert into activity_votes (id, activity_id, participant_id, type) values
  ('55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'love'),
  ('55555555-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000004', 'like'),
  ('55555555-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'love')
on conflict (id) do nothing;

insert into activity_comments (id, activity_id, participant_id, content) values
  ('66666666-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000004', 'Hâte ! On réserve tôt le matin pour éviter la foule ?')
on conflict (id) do nothing;

insert into budget_items (id, trip_id, category, description, total_cost, status, link_url, created_by) values
  ('77777777-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'transport', 'Vols A/R Paris → Édimbourg', 720, 'booked', null, '22222222-0000-0000-0000-000000000001'),
  ('77777777-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'accommodation', 'Cottage 7 nuits (Highlands)', 1400, 'to_book', null, '22222222-0000-0000-0000-000000000002'),
  ('77777777-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'rental', 'Location voiture 7 jours', 360, 'to_book', null, '22222222-0000-0000-0000-000000000003')
on conflict (id) do nothing;

insert into availabilities (id, trip_id, participant_id, avail_date, period, available) values
  ('88888888-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '22222222-0000-0000-0000-000000000001', '2026-07-18', 'morning', true),
  ('88888888-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '22222222-0000-0000-0000-000000000001', '2026-07-18', 'evening', true),
  ('88888888-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '22222222-0000-0000-0000-000000000002', '2026-07-18', 'morning', true),
  ('88888888-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', '22222222-0000-0000-0000-000000000004', '2026-07-18', 'evening', true)
on conflict (id) do nothing;
