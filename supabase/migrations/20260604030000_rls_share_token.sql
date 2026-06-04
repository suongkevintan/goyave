-- ============================================================================
-- Durcissement RLS — scope des ÉCRITURES par share_token.
--
-- Modèle (phase 2, sans auth) :
--  - SELECT : ouvert au rôle anon → indispensable pour que le realtime
--    (postgres_changes) reçoive les événements (il n'a pas accès aux headers HTTP).
--  - INSERT / UPDATE / DELETE : autorisés uniquement si la requête porte le bon
--    share_token (header `x-share-token`, lu via current_share_token()).
--    → personne ne peut modifier un voyage sans connaître son lien.
--
-- ⚠️ Les lectures ne sont pas scopées (limite assumée : trip_id/share_token sont
--    des valeurs difficiles à deviner). Scope total des lectures = phase ultérieure
--    via JWT signés (edge function) ou Supabase Auth.
-- Idempotent.
-- ============================================================================

-- ── Helpers ───────────────────────────────────────────────────────────────
create or replace function public.current_share_token()
returns text language sql stable as $$
  select nullif(current_setting('request.headers', true)::json ->> 'x-share-token', '')
$$;

-- security definer : résout token → trip indépendamment des policies sur trips.
create or replace function public.current_trip_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.trips where share_token = public.current_share_token()
$$;

-- ── Reset des anciennes policies permissives ────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'trips','participants','activities','activity_votes','activity_comments',
    'itinerary_slots','availabilities','budget_items','beacons','documents','activity_logs'
  ]
  loop
    execute format('drop policy if exists %I on %I;', t || '_anon_all', t);
    execute format('drop policy if exists %I on %I;', t || '_select', t);
    execute format('drop policy if exists %I on %I;', t || '_write_ins', t);
    execute format('drop policy if exists %I on %I;', t || '_write_upd', t);
    execute format('drop policy if exists %I on %I;', t || '_write_del', t);
    -- SELECT ouvert (realtime)
    execute format('create policy %I on %I for select to anon, authenticated using (true);', t || '_select', t);
  end loop;
end $$;

-- ── Écritures scopées : tables possédant trip_id ────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'participants','activities','itinerary_slots','availabilities',
    'budget_items','beacons','documents','activity_logs'
  ]
  loop
    execute format('create policy %I on %I for insert to anon, authenticated with check (trip_id = public.current_trip_id());', t || '_write_ins', t);
    execute format('create policy %I on %I for update to anon, authenticated using (trip_id = public.current_trip_id()) with check (trip_id = public.current_trip_id());', t || '_write_upd', t);
    execute format('create policy %I on %I for delete to anon, authenticated using (trip_id = public.current_trip_id());', t || '_write_del', t);
  end loop;
end $$;

-- ── Écritures scopées : votes & commentaires (via l'activité) ───────────────
do $$
declare t text;
begin
  foreach t in array array['activity_votes','activity_comments']
  loop
    execute format($p$create policy %I on %I for insert to anon, authenticated
      with check (activity_id in (select id from public.activities where trip_id = public.current_trip_id()));$p$, t || '_write_ins', t);
    execute format($p$create policy %I on %I for update to anon, authenticated
      using (activity_id in (select id from public.activities where trip_id = public.current_trip_id()))
      with check (activity_id in (select id from public.activities where trip_id = public.current_trip_id()));$p$, t || '_write_upd', t);
    execute format($p$create policy %I on %I for delete to anon, authenticated
      using (activity_id in (select id from public.activities where trip_id = public.current_trip_id()));$p$, t || '_write_del', t);
  end loop;
end $$;

-- ── trips : SELECT ouvert (ci-dessus), AUCUNE écriture anon ─────────────────
-- (création/édition de voyage = étape « accès par lien » ultérieure.)
