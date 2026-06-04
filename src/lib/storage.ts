import { supabase } from '@/lib/supabase'

/**
 * Upload d'un fichier vers un bucket public Supabase Storage.
 * Renvoie l'URL publique, ou null si Supabase n'est pas configuré / en cas d'échec.
 *
 * Buckets de l'app : `avatars`, `activity-media`, `documents`
 * (cf. supabase/migrations — policies anon, accès par lien).
 */
export async function uploadPublicFile(
  bucket: 'avatars' | 'activity-media' | 'documents',
  file: File,
): Promise<string | null> {
  if (!supabase) return null
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) {
    console.error('upload error', error.message)
    return null
  }
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
