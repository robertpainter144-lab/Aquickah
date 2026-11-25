# Aquickah

A private, neighbor-to-neighbor network for rides, food, and favors on a
small island in winter — built around a merit system ("Hearth Points")
that rewards showing up for each other, and a community board ("The
Grange") that gamifies turning a side project into a real local business.

This is a proof of concept: no accounts, no payments, no real-time backend.
State lives in the browser's `localStorage` and resets if you clear it.

## What's in here

- **Feed** — post and claim rides, food drop-offs, and small favors.
  Completing one earns the helper Hearth Points.
- **The Grange** — a board for personal projects and budding businesses.
  Flag a project as a venture and it moves through stages (Seed → Sprout →
  Rooted → Harvest) as neighbors Back It, Skill-Share, or Testify.
- **The Lantern List** — an opt-in list for anyone who'd welcome company
  this season. Lighting a lantern for someone sends a low-pressure invite
  and earns both people bonus Hearth Points.
- **Profile** — Hearth Point total, tier, and a short history of what
  you've given and received.

## Running it

```sh
npm install
npm run dev
```

Open the local URL it prints. On a phone, open it in Safari (iPhone) or
Chrome (Android) and use "Add to Home Screen" — it installs as a
standalone app.

## Stack

Vite, React, TypeScript, Tailwind CSS v4. No backend — everything is seed
data plus local state.
