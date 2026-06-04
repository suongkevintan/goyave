-- Active la diffusion temps réel sur budget_items (module Budget).
-- (availabilities est déjà dans la publication via la migration initiale.)
-- Idempotent.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'budget_items'
  ) then
    alter publication supabase_realtime add table budget_items;
  end if;
end $$;
