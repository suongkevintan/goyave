-- Active la diffusion temps réel sur itinerary_slots (module Itinéraire). Idempotent.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'itinerary_slots'
  ) then
    alter publication supabase_realtime add table itinerary_slots;
  end if;
end $$;
