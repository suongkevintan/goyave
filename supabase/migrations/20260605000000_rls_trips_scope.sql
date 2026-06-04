-- ============================================================================
-- Durcissement RLS `trips` + activation de l'accès par lien.
--
-- ⚠️ Correctif de sécurité : avant, SELECT sur trips était ouvert (using true),
-- donc la colonne share_token était lisible par n'importe qui → ça permettait de
-- récupérer les tokens et donc de contourner le scope des écritures. On scope
-- désormais la LECTURE de trips au share_token présenté (header x-share-token).
--
--  - SELECT : uniquement le voyage dont on connaît le share_token (anti-énumération).
--  - INSERT : ouvert → créer un nouveau voyage (le client fournit un share_token).
--  - UPDATE/DELETE : uniquement avec le bon share_token.
-- Idempotent.
-- ============================================================================

drop policy if exists trips_select on trips;
create policy trips_select on trips for select to anon, authenticated
  using (share_token = public.current_share_token());

drop policy if exists trips_write_ins on trips;
create policy trips_write_ins on trips for insert to anon, authenticated
  with check (true);

drop policy if exists trips_write_upd on trips;
create policy trips_write_upd on trips for update to anon, authenticated
  using (share_token = public.current_share_token())
  with check (share_token = public.current_share_token());

drop policy if exists trips_write_del on trips;
create policy trips_write_del on trips for delete to anon, authenticated
  using (share_token = public.current_share_token());
