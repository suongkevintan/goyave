# Voyage 🧭

The **single cockpit** to run a group trip — from the first idea all the way back home.
A Single Source of Truth for participants, activity ideas, itinerary, availability,
budget, statuses and documents, all in one place.

> Full scoping note: [`CONTEXT-SCOPE.md`](./CONTEXT-SCOPE.md)
> Code conventions: [`CONVENTIONS.md`](./CONVENTIONS.md)
> Design system: [`DESIGN.md`](./DESIGN.md) ("Clay" aesthetic)

## Stack

Bun · React + TypeScript · Vite · TailwindCSS v4 · React Router · (Supabase — phase 2) · (Leaflet — phase 3)

## Getting started

```bash
bun install
bun dev          # http://localhost:5173
bun run build    # production build
```

## Structure

```
src/
├── app/         Layout + routing
├── config/      Module registry (single source for nav + routes)
├── components/  Shared components (Logo placeholder, ModulePage…)
├── modules/     dashboard + casting, activities, itinerary, availability,
│                budget, beacon, documents
├── types/       Domain types (aligned with the Supabase schema)
└── lib/         Technical clients (supabase — placeholder)
```

## Modules (scoping note §5)

🗂️ Casting · 🎯 Activities · 📅 Itinerary · 📆 Availability · 💰 Budget · 📍 Beacon · 📎 Documents

## Dev tooling

- **Agentation**: visual annotation toolbar (dev only). MCP server configured in
  `.mcp.json` — approve it when Claude Code starts.

---

*Phase 1 — MVP in progress. Final brand identity (logo, display type) lands in phase 2.*
