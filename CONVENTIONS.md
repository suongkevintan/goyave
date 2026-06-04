# Conventions de code — Voyage

Document court et pratique pour collaborer sans friction. Mis à jour au fil du projet.

---

## 1. Structure des dossiers

```
src/
├── app/            # Coquille applicative : layout + routing (routes.tsx, AppLayout.tsx)
├── components/     # Composants partagés, sans logique métier (Logo, ModulePage…)
├── config/         # Configuration déclarative (modules.ts = registre des modules)
├── lib/            # Clients & utilitaires techniques (supabase.ts…)
├── modules/        # Un dossier par module fonctionnel (cf. note de cadrage §5)
│   ├── casting/
│   ├── activities/
│   ├── itinerary/
│   ├── availability/
│   ├── budget/
│   ├── beacon/
│   ├── documents/
│   └── dashboard/
├── types/          # Types domaine (alignés sur le schéma Supabase)
└── index.css       # Design system "Clay" (tokens + composants BEM)
```

**Règle :** un module ne dépend pas d'un autre module. Tout partage passe par
`components/`, `lib/`, `config/` ou `types/`.

### Ajouter un module
1. Créer `src/modules/<id>/<Id>Page.tsx` (export `default`).
2. Ajouter l'entrée dans `src/config/modules.ts`.
3. Ajouter la route dans `src/app/routes.tsx`.

---

## 2. Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Composant React | PascalCase | `CastingPage`, `ModulePage` |
| Fichier de composant | PascalCase.tsx | `Logo.tsx` |
| Fichier util/config | camelCase.ts | `modules.ts` |
| Dossier de module | kebab/lowercase | `availability/` |
| Type / interface | PascalCase | `BudgetItem` |
| Variable / fonction | camelCase | `shareToken` |
| Constante globale | SCREAMING_SNAKE | `MODULES` |

Alias d'import : `@/` pointe vers `src/`. → `import { MODULES } from '@/config/modules'`.

---

## 3. Styles — Tailwind + BEM

Deux outils, deux rôles **complémentaires** :

- **Tailwind (par défaut)** : mise en page et one-offs directement dans le JSX.
- **BEM (primitives réutilisées)** : boutons, cartes, badges… définis dans
  `src/index.css` sous `@layer components`, pour garder un markup lisible et
  un style partagé entre contributeurs.

### Syntaxe BEM
```
.block              /* composant autonome        → .card        */
.block__element     /* partie d'un bloc           → .card__title */
.block--modifier    /* variante d'un bloc/élément → .card--dark  */
```

**Règles BEM :**
- Pas plus d'un niveau d'`__element` (`.card__title`, jamais `.card__header__title`).
- Un modificateur ne s'utilise jamais seul : toujours `class="card card--dark"`.
- Le bloc ne fixe ni marge externe ni position : c'est au parent de placer.
- Toutes les valeurs viennent des tokens (`var(--color-…)`, `var(--radius-…)`).

### Tokens (design system "Clay")
Définis dans `@theme` (`src/index.css`), issus de `DESIGN.md`. Disponibles à la fois :
- en utilitaires Tailwind : `bg-canvas`, `text-ink`, `text-muted`, `rounded-xl`…
- en variables CSS : `var(--color-canvas)`, `var(--radius-md)`…

➡️ **Ne jamais coder une couleur ou un rayon en dur.** Ajouter un token si besoin.

---

## 4. Git & collaboration

> ⚠️ **Langue : tout ce qui est visible sur Git est en anglais** — README, messages de
> commit, titres & descriptions de PR. Le reste (UI, docs internes, commentaires de
> code) reste en français.

### Commits — [Conventional Commits](https://www.conventionalcommits.org)

Format : `type(scope): summary` — résumé court, à l'impératif, en anglais, sans point final.

```
feat(budget): add per-person cost computation
fix(activities): keep vote toggle idempotent
```

| Type | Quand l'utiliser |
|---|---|
| `feat` | nouvelle fonctionnalité |
| `fix` | correction de bug |
| `chore` | outillage, config, deps (pas de code applicatif) |
| `refactor` | refacto sans changement de comportement |
| `docs` | documentation uniquement |
| `style` | formatage, CSS, sans logique |
| `test` | ajout/màj de tests |

- **scope** = le module ou la zone : `casting`, `activities`, `dashboard`, `store`, `ds`, `config`…
- **corps** (optionnel) : liste à puces de ce qui change concrètement et du *pourquoi*.
- Un commit = un changement cohérent (évite les commits fourre-tout).

### Branches

`type/scope-sujet-court` en kebab-case, anglais :

```
feat/phase-2-supabase
feat/budget-per-person-cost
fix/activities-vote-toggle
```

`main` est la branche stable. On ne pousse pas du WIP cassé dessus.

### Pull Requests

- **Titre** = même format que les commits : `feat(budget): add per-person cost computation`.
- **Description** (en anglais) : *What / Why / How to test*, + capture si UI.
- Garder les PR petites et focalisées (1 sujet) pour une review rapide.

---

## 5. Design de référence

Avant d'écrire de l'UI, consulter **`DESIGN.md`** (aesthetic Clay : canvas crème,
CTA encre, cartes feature saturées, coins très arrondis). La DA définitive (logo,
typo display) arrive en **phase 2** — un placeholder est en place (`components/Logo.tsx`).
