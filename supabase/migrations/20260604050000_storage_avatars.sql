-- ============================================================================
-- Storage — bucket avatars + policies d'accès aux buckets de l'app.
-- (activity-media et documents existent déjà via la migration initiale.)
-- Modèle phase 2 (accès par lien, sans auth) : lecture/écriture ouvertes au rôle
-- anon sur les buckets de l'app. ⚠️ À durcir avec Supabase Auth en phase 5.
-- Idempotent.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

do $$
begin
  -- Reset
  drop policy if exists app_buckets_select on storage.objects;
  drop policy if exists app_buckets_insert on storage.objects;
  drop policy if exists app_buckets_update on storage.objects;
  drop policy if exists app_buckets_delete on storage.objects;

  create policy app_buckets_select on storage.objects for select to anon, authenticated
    using (bucket_id in ('avatars', 'activity-media', 'documents'));
  create policy app_buckets_insert on storage.objects for insert to anon, authenticated
    with check (bucket_id in ('avatars', 'activity-media', 'documents'));
  create policy app_buckets_update on storage.objects for update to anon, authenticated
    using (bucket_id in ('avatars', 'activity-media', 'documents'))
    with check (bucket_id in ('avatars', 'activity-media', 'documents'));
  create policy app_buckets_delete on storage.objects for delete to anon, authenticated
    using (bucket_id in ('avatars', 'activity-media', 'documents'));
end $$;
