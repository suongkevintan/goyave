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

## 4. Git (à venir)

- Branches : `feat/<module>-<sujet>`, `fix/<sujet>`.
- Commits courts à l'impératif : `feat(budget): ajoute le calcul par personne`.

---

## 5. Design de référence

Avant d'écrire de l'UI, consulter **`DESIGN.md`** (aesthetic Clay : canvas crème,
CTA encre, cartes feature saturées, coins très arrondis). La DA définitive (logo,
typo display) arrive en **phase 2** — un placeholder est en place (`components/Logo.tsx`).
