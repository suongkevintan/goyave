# Voyage — Note de Cadrage

> *Version 1.0 — 4 juin 2026*

---

## 1. Vision

**Voyage** est un outil de pilotage de voyages en groupe conçu pour être le **Single Source of Truth (SSOT)** d'un trip : des premières idées jusqu'au retour. Il remplace les documents éparpillés dans les fils de discussion, les réservations oubliées dans les boîtes mail et les tableaux Google Sheets qui ne se mettent jamais à jour.

L'outil est **collaboratif, fiable, ludique** — et pensé pour fonctionner aussi bien depuis un bureau que depuis un téléphone en pleine campagne écossaise.

---

## 2. Contexte & Problème

### Contexte
Un groupe d'amis (1 à ~20 personnes) planifie un voyage. Aujourd'hui, l'organisation se fait dans des groupes de messagerie (WhatsApp, etc.) où :
- les réservations se noient dans le flux des messages
- chaque personne garde ses documents dans son coin
- personne n'a la vue d'ensemble en temps réel
- les disponibilités se coordonnent sur des outils externes (Doodle)
- les dépenses s'éparpillent entre Tricount et des notes personnelles

### Problème central
Il n'existe pas de **cockpit unique** pour piloter un voyage de groupe : de la décision de partir jusqu'au dernier jour sur place.

---

## 3. Objectifs

| Priorité | Objectif |
|---|---|
| P0 | Centraliser toutes les informations du voyage en un seul endroit |
| P0 | Permettre une collaboration fluide sans création de compte obligatoire |
| P1 | Offrir une vue claire de l'itinéraire jour par jour avec carte |
| P1 | Coordonner les disponibilités du groupe |
| P1 | Suivre le budget prévisionnel avant le départ |
| P2 | Partager un statut simple pendant le voyage |
| P2 | Centraliser les liens et documents externes |

---

## 4. Utilisateurs

- **Organisateur** : Kevin ou toute personne qui crée le voyage. Vue complète, droits d'édition totaux.
- **Participant** : Tout membre du groupe. Peut consulter, voter, commenter, modifier. Accès via lien partagé.
- **Groupe** : Entre 1 et ~20 personnes par voyage.

### Accès
- **Phase 1** : Accès par lien partagé unique (pas de compte). Identification légère via fingerprint navigateur ou pseudo choisi à l'arrivée.
- **Phase 2** (future) : Authentification simple (email ou Google OAuth via Supabase Auth).

### Traçabilité
Toute modification est loggée (qui, quoi, quand) pour permettre un historique en cas de conflit.

---

## 5. Modules

### 5.1 🗂️ Casting — *Les participants*

La liste des membres du voyage avec leurs informations pratiques.

**Fonctionnalités :**
- Fiche par participant : nom/pseudo, photo, numéro de téléphone, allergies, infos importantes (groupe sanguin, etc.)
- Statut : Confirmé / Incertain / Retiré
- Nombre de participants visible en temps réel (utile pour les calculs de portions, coûts, etc.)
- Export simple de la liste

**Données :**
```
participant: id, trip_id, name, avatar_url, phone, allergies, notes, status, created_at
```

---

### 5.2 🎯 Activités — *Ce qu'on veut faire*

Le cœur créatif du projet : une collection d'idées d'activités proposées par les membres, qui évoluent vers un programme validé.

**Fonctionnalités :**
- Fiche activité riche :
  - Titre, description, lieu
  - Photos / vidéos (upload ou lien)
  - Durée estimée, coût estimé par personne
  - Tags (randonnée, culture, gastronomie, soirée…)
  - Statut : 💡 Idée / ✅ Validée / 📅 Au programme / ✔️ Faite
  - Liens externes (Google Maps, TripAdvisor, site officiel…)
- Système de **vote** (👍 / ❤️) par participant
- **Commentaires** par activité
- Proposée par : affichage du membre qui a ajouté l'activité
- Passage en "programme" : glissement vers le module Itinéraire

**Données :**
```
activity: id, trip_id, title, description, location, duration_min, cost_per_person, status, proposed_by, created_at
activity_media: id, activity_id, url, type (image/video/link)
activity_vote: id, activity_id, participant_id, type
activity_comment: id, activity_id, participant_id, content, created_at
activity_link: id, activity_id, label, url
```

---

### 5.3 📅 Itinéraire — *Le programme jour par jour*

La vue opérationnelle du voyage : activités organisées sur une timeline journalière avec carte.

**Fonctionnalités :**
- Vue calendrier sur la durée du voyage (J1, J2, J3…)
- Chaque journée divisée en créneaux : Matin / Après-midi / Soirée
- Drag & drop des activités validées vers les créneaux
- Carte interactive (Leaflet) avec marqueurs des activités du jour
- **Optimisation de trajet** : suggestion de l'ordre optimal des activités selon leur géolocalisation (TSP simplifié)
- Vue liste et vue carte switchables
- Export PDF de l'itinéraire

**Données :**
```
itinerary_slot: id, trip_id, date, period (morning/afternoon/evening), activity_id, order_index
```

---

### 5.4 📆 Dispo — *Trouver les bonnes dates*

Un outil de coordination des disponibilités, type Doodle mais intégré.

**Fonctionnalités :**
- Sélection d'une plage de dates à explorer (ex : juillet/août 2026)
- Chaque participant coche ses disponibilités par demi-journée (matin / soir)
- Vue d'ensemble : heat map des jours où le plus de monde est disponible
- Mise en avant du ou des "meilleurs créneaux"
- Utilisable aussi pour caler des réunions de préparation du voyage

**Données :**
```
availability: id, trip_id, participant_id, date, period (morning/evening), available (bool)
```

---

### 5.5 💰 Budget — *Les coûts prévisionnels*

Un mini-tableau de bord budgétaire pour l'avant-voyage. Tricount prend le relais pendant et après.

**Fonctionnalités :**
- Catégories de dépenses : ✈️ Transport, 🏠 Hébergement, 🚗 Location, 🎟️ Activités, 🍽️ Repas, 📦 Divers
- Pour chaque ligne : description, coût total estimé, coût par personne, statut (À réserver / Réservé / Payé), lien vers le document/réservation
- Calcul automatique du total et du coût par personne (basé sur le nombre de participants confirmés du module Casting)
- Lien Tricount en évidence pour le suivi des dépenses réelles
- Indicateur visuel : budget restant à confirmer

**Données :**
```
budget_item: id, trip_id, category, description, total_cost, status, link_url, created_by, created_at
```

---

### 5.6 📍 Balise — *Statut pendant le voyage*

Un espace ultra-simple pour savoir où en est chaque membre du groupe en temps réel (ou quasi).

**Fonctionnalités :**
- Chaque participant peut publier un court message de statut (max 140 caractères)
- Visible par tous les membres : liste chronologique
- Optionnel : emoji d'humeur
- Horodatage automatique
- Pas de GPS, pas de tracking — juste un message libre

**Données :**
```
beacon: id, trip_id, participant_id, message, emoji, created_at
```

---

### 5.7 📎 Documents & Liens — *Le classeur du voyage*

Un hub centralisé pour tous les liens et fichiers importants.

**Fonctionnalités :**
- Boutons de liens externes organisés par catégorie (Réservations, Finances, Photos, Divers)
- Lien Google Drive, Tricount, Google Photos, billets en ligne…
- Upload de fichiers légers vers Supabase Storage (PDF de billets, confirmations)
- Téléchargeable par tous les membres

**Données :**
```
document: id, trip_id, category, label, url, file_path, uploaded_by, created_at
```

---

## 6. Architecture Technique

### Stack

| Couche | Technologie | Justification |
|---|---|---|
| Runtime | **Bun** | Performance, TypeScript natif, remplace Node + npm |
| Frontend | **React 18** + **TypeScript** | Composants réutilisables, écosystème riche |
| Bundler | **Vite** | Rapide, compatible Bun |
| Styles | **TailwindCSS** | Cohérence visuelle rapide |
| Routing | **React Router v6** | Navigation SPA |
| Backend | **Supabase** | PostgreSQL + Auth + Storage + Realtime + Row Level Security |
| Cartes | **Leaflet** + **OpenStreetMap** | Open source, pas de clé API requise |
| Offline | **PWA** (Service Worker + Cache API) | Accès hors ligne à l'itinéraire |
| Futur mobile | **React Native** (Expo) | Réutilisation max de la logique React |

### Architecture Supabase

```
supabase/
├── tables/
│   ├── trips              — voyage principal
│   ├── participants        — casting
│   ├── activities          — activités + médias, votes, commentaires
│   ├── itinerary_slots     — programme jour par jour
│   ├── availabilities      — module dispo
│   ├── budget_items        — budget prévisionnel
│   ├── beacons             — statuts pendant le voyage
│   └── documents           — liens et fichiers
├── storage/
│   ├── activity-media      — photos/vidéos d'activités
│   └── documents           — PDFs et pièces jointes
└── realtime/
    └── activé sur : activities, beacons, availabilities
```

### Schéma principal

```sql
-- Trip (voyage)
create table trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text,
  description text,
  cover_image_url text,
  start_date date,
  end_date date,
  share_token text unique default gen_random_uuid()::text,
  created_at timestamptz default now()
);

-- Participants
create table participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  name text not null,
  avatar_url text,
  phone text,
  allergies text,
  notes text,
  status text default 'confirmed', -- confirmed | uncertain | withdrawn
  fingerprint text, -- browser fingerprint pour identification légère
  created_at timestamptz default now()
);

-- Activités
create table activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  title text not null,
  description text,
  location text,
  lat float,
  lng float,
  duration_min int,
  cost_per_person numeric,
  status text default 'idea', -- idea | validated | scheduled | done
  proposed_by uuid references participants(id),
  created_at timestamptz default now()
);

-- Votes sur activités
create table activity_votes (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid references activities(id) on delete cascade,
  participant_id uuid references participants(id) on delete cascade,
  type text default 'like', -- like | love
  unique(activity_id, participant_id)
);

-- Commentaires
create table activity_comments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid references activities(id) on delete cascade,
  participant_id uuid references participants(id),
  content text not null,
  created_at timestamptz default now()
);

-- Itinéraire
create table itinerary_slots (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  activity_id uuid references activities(id),
  slot_date date not null,
  period text not null, -- morning | afternoon | evening
  order_index int default 0
);

-- Disponibilités
create table availabilities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  participant_id uuid references participants(id) on delete cascade,
  avail_date date not null,
  period text not null, -- morning | evening
  available boolean default true,
  unique(trip_id, participant_id, avail_date, period)
);

-- Budget
create table budget_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  category text not null, -- transport | accommodation | rental | activities | food | misc
  description text not null,
  total_cost numeric,
  status text default 'to_book', -- to_book | booked | paid
  link_url text,
  created_by uuid references participants(id),
  created_at timestamptz default now()
);

-- Balise (statuts)
create table beacons (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  participant_id uuid references participants(id),
  message text not null,
  emoji text,
  created_at timestamptz default now()
);

-- Documents & Liens
create table documents (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  category text default 'misc', -- bookings | finance | photos | misc
  label text not null,
  url text,
  file_path text,
  uploaded_by uuid references participants(id),
  created_at timestamptz default now()
);

-- Logs (audit trail)
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  participant_id uuid references participants(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
```

---

## 7. Roadmap

### Phase 1 — MVP (Aujourd'hui)
Prototype fonctionnel, données locales, interface navigable.

- [ ] Dashboard principal (vue d'ensemble du voyage)
- [ ] Module Casting (liste participants)
- [ ] Module Activités (fiches, votes, commentaires)
- [ ] Navigation entre modules
- [ ] Design système de base (TailwindCSS)

### Phase 2 — Backend (Semaine 1-2)
Connexion Supabase, persistance réelle, collaboration.

- [ ] Setup Supabase (tables, RLS, storage)
- [ ] Accès par lien partagé (share_token)
- [ ] Module Budget
- [ ] Module Dispo
- [ ] Realtime sur activités et balise

### Phase 3 — Itinéraire & Carte (Semaine 3-4)
Le module le plus complexe.

- [ ] Module Itinéraire (calendrier + drag & drop)
- [ ] Intégration Leaflet + géolocalisation des activités
- [ ] Optimisation de trajet (ordre optimal)
- [ ] Module Balise

### Phase 4 — PWA & Polish (Mois 2)
Offline, notifications, peaufinage UX.

- [ ] PWA (Service Worker, cache offline)
- [ ] Module Documents & Liens
- [ ] Notifications (Supabase Realtime)
- [ ] Export PDF itinéraire

### Phase 5 — App Native (Futur)
- [ ] Migration vers React Native (Expo)
- [ ] App iOS + Android
- [ ] Authentification complète

---

## 8. Principes de Design

- **Mobile-first** : pensé pour être utilisé sur téléphone, y compris sans réseau
- **SSOT** : une seule source de vérité, tout le monde voit la même chose
- **Zéro friction** : accès par lien, pas de compte obligatoire
- **Tracé** : chaque action est loggée, rien ne se perd
- **Extensible** : architecture pensée pour accueillir de nouveaux modules (packing list, météo, etc.)

---

## 9. Hors périmètre (pour l'instant)

- Réservation en ligne directe (Booking, Airbnb…)
- Messagerie interne (WhatsApp reste pour ça)
- GPS temps réel / tracking de position
- Gestion comptable avancée (Tricount délégué pour ça)
- Authentification complexe (rôles admin/modérateur)

---

*Document vivant — mis à jour au fil du projet.*
