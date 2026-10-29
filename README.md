# Neighborly — Community Help App

A working frontend prototype of the supplied SE 3290 scope baseline (v1.1), set in Ames, Iowa. React + TypeScript + Vite. **No backend, database, real authentication, or live messaging/notification services.** All people, addresses, conversations, and activity are fictional. Demo state stays in this browser’s localStorage.

## Run

Requires Node.js 22.12+ (developed with Node 24).

```sh
npm install
npm run dev
```

Open the local address printed by Vite (normally http://127.0.0.1:5173).

```sh
npm test                 # Domain rule tests
npm run test:e2e         # Chromium end-to-end tests; starts Vite on port 5174
npm run build           # TypeScript validation and production build
npm run preview         # Preview the built app
```

On a fresh machine, run `npx playwright install chromium` once before browser tests. `npx playwright show-report` opens the HTML report. Failure screenshots and traces are retained under `test-results/`. Final screen captures are in [docs/screenshots](docs/screenshots).

## Present the idea

The app starts as approved neighbor **Maya Chen**. The green toolbar switches fictional accounts without losing demo activity. **Reset demo** restores all sample data.

1. As Maya, select **Ask for help**, fill the title, description, category, and approximate location, and publish. Leave the volunteer count at two.
2. Switch to **Eli Brooks**, open **Alerts**, find the request in **Neighborhood**, and select **Volunteer for this**.
3. Switch to **June Park** and apply to the same request.
4. Switch to Maya. Approve Eli and June. The private three-person task chat opens.
5. Send a message; switch to Eli; select **Start task**, then **Request completion**.
6. Switch to Maya and **Confirm completion**. Each approved volunteer receives +10 points exactly once. Check **Leaderboard**.
7. On another task, cancel and reopen it to see retained history. Alternatively, advance the explicit demo clock after requesting completion to demonstrate the reviewable 72-hour fallback.
8. Report a post, switch to **Robin Ellis** (moderator), and review it. Record a decision reason; resolve, remove, suspend, or escalate. **Taylor Reed** (staff) reviews escalations and proposed neighborhoods.

Other available scenarios: pending-member restrictions (Sam Rivera), simulated registration/login/recovery, neighborhood selection and membership review, group proposals and approval, join/leave, category/status/group search, optional photo uploads, editing/deleting posts, comments, reversible voting and appreciation, message requests with recipient consent, availability and notification settings, blocking, points, badges, and reviewed reputation adjustments.

For simulated login, use `maya@example.test` and password `neighborly`. Other seeded emails use the account ID (`eli`, `june`, `pending`, `mod`, `staff`) at `example.test`, with the same password.

## Scope and limits

The [requirements coverage map](docs/requirements.md) links scope areas to prototype screens and tests. [Validation notes](docs/validation.md) record test evidence and limitations.

Account switching, credentials, permissions, time advancement, moderation, and delivery are client-side simulations for presentation. Do not enter real credentials or resident data. Exact address fields are private in the demonstrated views; street-address checks are illustrative text validation, not an exhaustive privacy detection service. Optional uploaded images should contain fictional data. Aggregate community statistics are sample figures. No production readiness or instructor acceptance is claimed.
