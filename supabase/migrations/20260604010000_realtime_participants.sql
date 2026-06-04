-- Active la diffusion temps réel sur la table participants (module Casting).
-- Idempotent : ne rien faire si déjà présent dans la publication.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'participants'
  ) then
    alter publication supabase_realtime add table participants;
  end if;
end $$;
