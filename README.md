# Best Community Service — Interactive Prototype

A client-side community-service prototype for SE 3290. This replaces the previous neighborhood social application while preserving its approved green/cream visual style.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Node.js 24 LTS is recommended (verified with 24.20.0); the installed Vitest requires Node 22.12+, 24.x, or 26+. No backend or environment variables are needed.

## Teammate / Figma handoff

Start with **[APPLICATION_FLOWS.md](docs/APPLICATION_FLOWS.md)**. It covers every user journey, screen, field, branch, state transition, sample price, mock-admin action, and implementation boundary. Give it and this source to your teammate's agent.

- [Approved design](docs/superpowers/specs/2026-11-03-community-service-redo-design.md)
- [Implementation plan and verification record](docs/superpowers/plans/2026-11-03-community-service-redo.md)
- [Current screenshots](docs/screenshots/redo/)

Screenshots outside `docs/screenshots/redo/` and the older Neighborly planning document are historical references for the superseded app, not the current behavior.

## Included flows

- Rooms with catering, cleaning, tables, and chairs.
- Classes: take a dated session; volunteer to teach one-time or weekly sessions.
- Transportation: scheduled shuttles, on-demand requests, volunteer driving.
- Home care: cleaning, nursing, welfare checks; receive or offer care.
- Anonymous and registered donations, simulated payment and sample receipt.
- Room + Shuttle and Classes + Shuttle packages with shared details/review.
- Limited mock admin for sample prices and class approval.

Guests can browse/search; service actions require login except anonymous donations. New teaching submissions remain unpublished until approved. No extra approval gates are added to other services.

## Demo accounts

| Role       | Email              | Password   | Shortcut                            |
| ---------- | ------------------ | ---------- | ----------------------------------- |
| Member     | maya@example.test  | neighborly | Continue as Maya                    |
| Mock admin | admin@example.test | neighborly | Mock Admin → Continue as Demo Admin |

Signup accepts multiple volunteer interests. Credentials are fictional and authentication is simulated. All data lives in memory in the current tab: page refresh resets everything. Reset demo also clears the dataset after confirmation. No real payments, email, files, or database are involved.

Sample prices are editable; they are not instructor-specified amounts. The limited admin, class approval, and weekly recurrence were explicitly agreed extensions to the lecture baseline. See the flow document for provenance and exact scope.

## Verify and build

```sh
npm test
npm run build
npx playwright install chromium  # once, if needed
npm run test:e2e -- --workers=1
```

The production build is written to `dist/`. HTML entry is `index.html`; active TypeScript/React source is under `src/`. For a local production preview, use `npm run preview` after building.
