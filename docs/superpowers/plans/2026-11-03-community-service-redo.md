# Community Service Redo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the neighborhood application with the approved community-service prototype and an exhaustive teammate flow handoff.

**Architecture:** Existing React/TypeScript/Vite app; fresh typed service model and client state; reusable service catalog, calendar, provider forms, booking wizard, review/payment, and confirmation components. Existing palette, typography, layout, and auth presentation remain.

**Tech Stack:** React 19, TypeScript, Vite, lucide-react, Vitest, Playwright. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-03-community-service-redo-design.md`

## Global Constraints

- Client-side mock only; no real transactions or backend.
- Preserve existing style; replace old content and domain logic.
- Class approval and mock pricing admin are agreed extensions, not original lecture requirements.
- Respect pre-existing edits; preserve old screenshots; no unsolicited commit, publish, or reset.
- User explicitly approved implementation in this folder; execute inline without another approval interruption.

## Review Focus

- Guest action resumes intended service after authentication; anonymous donation remains exempt.
- Pending classes cannot be booked before approval, including recurring sessions.
- Changed prices and depleted seats must not create misleading or partial package bookings.
- Invalid intervals, fractional seats, and recurrence bounds must fail before state mutation.
- Anonymous donation records must exclude signed-in identity.

## Task 1: Fresh service model and business rules

Files: `src/services/model.ts`, `src/services/model.test.ts`.
Interfaces: typed `CatalogItem`, `User`, `Offering`, `BookingDraft`, `AppState`; `createState`, `quote`, `validateBooking`, `completeBooking`, `submitOffering`, `approveClass`, `classDates`.

- [x] Write tests for price arithmetic, pending class publication, weekly recurrence, conflicting room intervals, seat limits, all-or-nothing packages, and anonymous donor identity.
- [x] Run `npm test -- src/services/model.test.ts`; confirm new tests fail before implementation.
- [x] Implement model with dynamic sample dates and configured sample prices; run unit suite to green.

## Task 2: Navigation, authentication, catalogs, and offerings

Files: `src/App.tsx`, `src/Auth.tsx`, `src/services/{context,ui,Catalog,Offering,Admin}.tsx`, `src/services/styles.css`.
Interfaces: shared app provider owns in-memory state; `useServices` provides catalog, current user, navigation, booking/auth entry points; `Catalog` opens details or selected workflows; `Offering` writes provider submissions.

- [x] Write browser tests for public catalog, auth continuation, pending class approval, and removed old navigation; observe initial failure.
- [x] Build sidebar/home, services and packages, visible sample details, actual availability calendars, existing-style login/signup with multiple volunteer choices, provider forms, mock-admin pricing/class approval.
- [x] Preserve old screenshot references; remove obsolete source and tests from active TypeScript/test suite by archiving outside active source paths.

## Task 3: Booking, packages, payments, and donation

Files: `src/services/{Booking,Donations}.tsx`; tests `tests/e2e/services.spec.ts`.
Interfaces: shared booking wizard consumes `BookingDraft` and commits through `completeBooking`; donation path uses the same explicit simulation pattern but keeps anonymous identity absent.

- [x] Browser-test room add-ons/totals, both package variants, shuttle seats, ride request, class enrollment, home care, registered and anonymous donations.
- [x] Build editable back/next flow, add-on dialog, review, simulated payment, and result views. Ensure totals derive from the central price model.
- [x] Run `npm run build`, `npm test`, and `npm run test:e2e -- --workers=1`; fix demonstrated defects.

## Task 4: Review, visual QA, screenshots, and teammate handoff

Files: `README.md`, `docs/APPLICATION_FLOWS.md`, `docs/screenshots/redo/*`.

- [x] Capture and inspect desktop/mobile screenshots and complete keyboard/dialog checks.
- [x] One fresh reviewer checks implementation against spec; fix material findings with regression tests.
- [x] Write handoff covering every entry point, fields, transitions, branches, mock admin behavior, validation, state persistence, sample data, limitations, and source-vs-extension boundaries.
- [x] Re-run affected checks and report verified results and delivery paths.

## Progress and rulings

- Baseline: existing Vitest suite passed 13/13 before modifications.
- Work in the requested directory; before-image source copied to `/private/tmp/bcs-redo-before/` to protect pre-existing work. No worktree/branch change or commits requested.
- Repository Markdown is the handoff format: user wants to give code and flow instructions directly to teammate's agent.

## Verification record

- Task 1 complete: fresh transaction model; Vitest **14/14 passing**. Tests use a fixed clock; sample catalog uses dates relative to page load.
- Task 2 complete: replacement navigation, authentication continuation, catalogs, forms, class approval, and sample pricing. Obsolete application files removed from active source after their before-images were saved under `/private/tmp/bcs-redo-before/`.
- Task 3 complete: all individual services and both packages; room add-ons, simulated payments, free paths, class-only publication, and anonymous donor identity checks.
- Task 4 complete: Playwright **14/14 passing**, production build passes, 37 current screenshot references, comprehensive flow handoff and runnable source archive.
- Independent review: two important findings reproduced with failing regression tests and fixed: phantom package shuttle line before trip selection; hidden end-time rejection of valid ride pickups. Final unit suite 14/14; browser late-pickup and initial-package-total checks pass.
- Form validation fix: compute fallible state transformations synchronously so submit handlers can display validation messages rather than crashing React. Browser invalid-driver-submission regression passes.
- Visual fix: load service overrides after the original foundation; desktop/mobile reference captures confirm original palette and corrected responsive layout.
- Ruling: use current-tab in-memory state, not persistence; no credentials saved to local storage. The flow handoff explains refresh/reset behavior.
- Ruling: only class offerings need the user-requested admin approval; other flows keep documented confirmation/request steps.
- Minor limitation retained: the compact calendar shows at most 42 days; later recurring sessions remain selectable through its date input. Documented in the flow handoff; month pagination is outside this implementation.
- No new dependencies, backend, deployment, git reset, or commits.
