# Supabase — Voyage (phase 2)

## Mise en route

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Copier l'URL du projet et la clé `anon` dans `.env.local` à la racine :
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
3. Exécuter [`schema.sql`](./schema.sql) dans l'éditeur SQL Supabase
   (ou `supabase db push` avec la CLI).
4. Relancer `bun dev`. Le client réel (`src/lib/supabase.ts`) s'active
   automatiquement quand les variables sont présentes.

## Contenu de `schema.sql`

- **Tables** : tout le modèle de la note de cadrage (§6).
- **Index** : sur les clés `trip_id` / `activity_id` les plus requêtées.
- **Storage** : buckets `activity-media` et `documents`.
- **Realtime** : activé sur `activities`, `activity_votes`, `activity_comments`,
  `beacons`, `availabilities`.
- **RLS** : activé partout, policies permissives pour la clé `anon` (accès gardé
  par le `share_token` côté app). ⚠️ À durcir avec Supabase Auth en phase 5.

## Statut d'intégration

Le schéma et le client sont prêts. La **migration des modules** du store local
vers Supabase (lecture/écriture + realtime) se fait module par module — voir
`src/lib/store.tsx` (l'API exposée à l'UI ne changera pas).
