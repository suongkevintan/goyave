# Supabase — Voyage (phase 2)

Projet lié : **`lyznalohyniudklvlcej`** (`supabase link` déjà fait).

## Workflow migrations

Le schéma vit dans `supabase/migrations/` (source de vérité, versionnée).
Migration initiale : `20260604000000_init_schema.sql`.

### Appliquer le schéma au projet distant

Le CLI Supabase est une **devDependency** (pas d'install globale — `npm i -g supabase`
est déprécié). Utilise les scripts (le binaire est résolu depuis `node_modules`) :

> ⚠️ Commandes authentifiées → à lancer dans **ton** terminal (`supabase login` au préalable).

```bash
bun run db:link    # lie ce dossier au projet (lyznalohyniudklvlcej) — peut demander le mot de passe DB
bun run db:push    # applique les migrations en attente au projet distant
```

Les migrations sont **idempotentes** : `db push` est sûr même si le schéma a déjà été
appliqué manuellement (via l'éditeur SQL du dashboard).

### Variables d'environnement (app)

Renseigner `.env.local` à la racine (déjà créé, non versionné) :

```
VITE_SUPABASE_URL=https://lyznalohyniudklvlcej.supabase.co
VITE_SUPABASE_ANON_KEY=<clé anon>
```

Récupérer la clé anon :
```bash
supabase projects api-keys --project-ref lyznalohyniudklvlcej
```
(ou Dashboard → Project Settings → API → `anon public`)

Puis relancer `bun dev` : le client réel (`src/lib/supabase.ts`) s'active
automatiquement dès que les deux variables sont présentes.

## Contenu de la migration

- **Tables** : tout le modèle de la note de cadrage (§6).
- **Index** : sur les clés `trip_id` / `activity_id` les plus requêtées.
- **Storage** : buckets `activity-media` et `documents`.
- **Realtime** : activé sur `activities`, `activity_votes`, `activity_comments`,
  `beacons`, `availabilities`.
- **RLS** : activé partout, policies permissives pour la clé `anon` (accès gardé
  par le `share_token` côté app). ⚠️ À durcir avec Supabase Auth en phase 5.

## Statut d'intégration

Schéma + client prêts. La **migration des modules** du store local vers Supabase
(lecture/écriture + realtime) se fait module par module — voir `src/lib/store.tsx`
(l'API exposée à l'UI ne changera pas).
