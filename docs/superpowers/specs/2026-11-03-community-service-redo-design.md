# Best Community Service prototype rework

Status: approved by the user; implemented and verified.

## Intent and sources

Replace the incorrect neighborhood-help application with an interactive, client-side prototype of the nonprofit Best Community Service. The priority is fidelity to the assignment, not adding product features. The teammate will use the coded prototype to create the Figma deliverable. Only the prototype portion is in scope here.

Sources reviewed in full:

- `/Users/ddang175/Documents/ProjectManagementREDO/lecture_notes_2.pdf` (12 pages), particularly October 6, 8, and 13.
- `/Users/ddang175/Documents/ProjectManagementREDO/Team Project SE 3290 + Tips (1).pdf` (4 pages).
- Supplemental lecture notes pasted by the user and the subsequent requirements discussion.

The tips require user-facing interactive screens and permit mock data without a backend. Their larger SRS, project-plan, and production-estimation deliverables are outside this rework. General lecture topics such as earned-value dashboards are not application features.

## Approach and existing work

The user chose to restart application content and behavior while preserving the existing style and login/signup. Retain the existing React 19, TypeScript, Vite, and lucide-react toolchain. Preserve the forest-green/cream palette, DM Sans/Manrope typography, sidebar, card styling, spacing conventions, buttons, and authentication presentation. Reuse presentation patterns only, not the old application rules or data model.

This is the sensible approach given the explicit appearance constraint. Patching the existing social platform would carry forward irrelevant rules. Changing framework or creating a new visual design would add work without serving the requirement.

The repository already has uncommitted changes. Do not discard, reset, or overwrite unrelated work. Record the existing appearance before changing product code. Keep the old screenshots as references; save new screenshots separately.

## Scope and navigation

Main views: Home/services, Rooms, Classes, Transportation, Home Care, Donations, Packages. Each core service has a landing page and complete user flow. A narrow Mock Admin view is an explicitly requested extension, described below.

Remove the old neighborhood feed, posts, help exchange, groups, messages, points, leaderboard, membership approval, moderation, and related business rules from the active application. No replacement social features, staff operations dashboard, payroll, notifications system, or other service categories.

## Accounts and access

- Guests can browse, search, view service details and calendars, and donate anonymously.
- Login is required to begin reservations, class enrollment, ride/home-care requests, or volunteer offerings. Retain the intended service destination after login.
- Preserve existing login/signup interaction and appearance, adapted to the new model; remove neighborhood/residency approval requirements and old unrelated signup terms.
- Registration collects name, email, password, and address as needed for the agreed forms; volunteer activities can be selected in combination: Teach, Drive, Give Home Care. A user can participate in multiple activities without separate accounts. No volunteer approval, background-check, or file-upload workflow.
- Authentication and all actions are explicitly simulated. Do not send credentials or transactions to a server. Do not persist plaintext passwords beyond browser-session state.

## Rooms

Required flow: calendar -> available date/time -> reservation details -> optional add-ons pop-up -> review/confirmation -> simulated payment -> result.

Agreed details: room, date, start/end time, event name/type, expected attendance. Rooms are physical spaces at the center. Weddings, community meetings, and funerals are narrative examples, not separate services.

Required optional add-ons: simple vendor catering, cleaning, equipment rental. Equipment is tables and chairs, with quantities. Add-ons affect the total and are not standalone core services. No restaurant menu.

Builder-selected sample data, permitted by the user: Community Hall (capacity 80, $80/hour) and Meeting Room (capacity 20, $40/hour); catering $8/person, cleaning $20/reservation, tables $5 each, chairs $1 each. All are fictional and editable in Mock Admin. Show units clearly and validate room capacity, time order, nonnegative quantities, and conflicting room reservations in the prototype.

## Classes

Required sample offerings: Spanish, arts and crafts, painting; volunteers teach. Two paths: Take and Teach.

Take: keyword/list browsing -> class details -> select -> simulated payment when paid -> confirmation. Classes remain separate from room booking even when held in a center room.

Teach: calendar availability -> class title, date/time, description, prerequisites, language, level -> submit. The user explicitly requested both one-time and weekly recurring offerings. Recurring fields: first date, weekday/time, end date. Validate that the recurrence produces dates and that end date is not before start date.

User-requested extension: new classes are submitted to Mock Admin and stay out of public listings until approved. Approval publishes the submitted title, schedule, course details, and configured price; a recurring listing exposes its applicable sessions. Do not invent rejection/appeals workflows.

Sample starting fees: Spanish free, arts and crafts $10/session, painting $15/session. Clearly label all as sample prices. New class submissions default to free until admin sets a price when approving. Builder default: taking a recurring class reserves one selected dated occurrence and charges its per-session price; whole-series enrollment/billing is not specified and will not be added.

## Transportation

Two subtypes: scheduled shuttle and on-demand ride. Two paths: Take and Drive.

Shuttle: calendar and available trip list -> select a trip displaying route, departure, arrival, available seats -> passenger count -> review -> applicable simulated payment -> confirmation. Use sample routes/times, such as Community Center <-> Library and Community Center <-> Northside. Validate passenger count against seats; reserve seats on confirmation.

On-demand: pickup, destination, requested date/time, passenger count -> review -> applicable simulated payment -> request submitted. Do not claim a driver is assigned or a ride is guaranteed. No maps, dispatch, live tracking, or matching workflow.

Drive: volunteer chooses shuttle, on-demand, or both; supplies availability and qualifications; submission confirmation. No driver approval or staff scheduling screens. Guaranteed shuttle staffing is an operational assumption, not a feature to build.

Builder-selected sample fees: shuttle $5/passenger, on-demand ride $10/request, editable through Mock Admin. These are prototype choices; the source leaves shuttle pricing open.

## Home Care

In-home services for the elderly and people with disabilities, distinct from room cleaning at the center. Include cleaning, nursing, and welfare checks as samples.

Take: available-service calendar -> details -> select appointment -> recipient name, home address, short assistance description -> review -> confirmation, with simulated payment if configured as paid.

Give: choose offered service(s), calendar availability, qualifications text -> submit -> confirmation. No certification uploads or provider approval workflow. No medical records or clinical management functionality.

Builder-selected sample fees: cleaning $20/appointment; nursing and welfare checks free. Availability is fictional and users cannot select unavailable appointments.

## Donations

Separate anonymous and registered donor tracks. Anonymous donations require no account. Registered donations require login and collect name, email, mailing address, prefilled where available. Any positive donation amount is allowed.

Review -> clearly simulated payment -> anonymous confirmation or registered on-screen sample receipt. No real tax claims, email delivery, or downloadable receipt requirement. Anonymous donations do not attach the signed-in account's identity to the donation record even if initiated while logged in. The prototype does not pretend it processes real payment information.

## Packages

Only Room + Shuttle and Classes + Shuttle. Individual services remain independently usable. Enter shared information once and carry it across the package.

- Room + Shuttle: room/details/add-ons -> shuttle trip and passenger count -> shared review with itemized total -> one simulated payment if applicable -> confirmation covering both reservations.
- Classes + Shuttle: class/session -> shuttle trip and passenger count -> shared review -> one simulated payment if applicable -> confirmation covering both.

The bundled services and information reuse come from the lecture. The shared review/payment sequence was separately approved by the user. Carry contact information and the selected event/class date forward. Shuttle selections must use that date; route/times remain visible for the user to choose a suitable trip. Validate both services before committing either reservation so a failed selection does not create half a package.

## Mock Admin (explicit user extension)

The written assignment does not require staff screens. The user later explicitly requested a small mock admin page for pricing and class approval. Do not infer broader staff features from that request.

- Reachable through an explicit prototype/admin demo control and a mock admin sign-in; ordinary registration does not grant admin capabilities. Guest users cannot change prices or approve classes. Clearly identify this as a mock role, not production authorization.
- Pricing: edit sample fees per room/class/trip/ride/home-care posting and per room add-on, with nonnegative values and clear units. Zero means free. User-facing prices and booking totals use the same values.
- Pending classes: inspect submitted details, configure price, approve; public listings update only after approval.
- No new approval gate for ordinary reservations, enrollments, ride requests, home-care requests, drivers, or caregivers; follow their documented confirmation/request-submitted steps.
- No manager screens, general operations, user administration, analytics, payments backend, or approval queues for unrelated entities.

## Reusable behavior and technical choices

Use shared accessible calendar/date selection, lists/search, labeled forms, optional add-on modal, review/price summary, simulated payment, and confirmation components. Calendar views must show availability, not merely decorative dates. Use consistent provider/recipient layouts without erasing service-specific fields.

Builder decision: use browser-session mock state, resettable for demonstrations, for users, catalog, availability, pending classes, reservations, and prices. Session reloads may retain non-sensitive prototype state, but no server or cross-device synchronization is needed. Do not read the old neighborly data keys into the new application.

Show payment simulation before completing a paid booking; never collect real card details. Keep displayed and charged sample totals consistent. Lock totals on review or return to review if catalog prices change. Avoid duplicate submissions. Date/time fixtures should remain usable relative to the date the prototype is opened.

## Verification and handoff

Run TypeScript/build checks and meaningful tests of access gates, pending-class publication, price arithmetic, room add-on totals, shuttle seats, package atomic confirmation, recurrence, and donation anonymity. Replace obsolete social-platform tests as part of the intentional application replacement. Check core flows in Playwright, including login continuation and free versus paid paths. Check desktop and mobile layouts and keyboard-accessible dialogs/forms.

Handoff includes runnable source, updated README with commands, sample accounts, source-vs-agreed-extension scope, and new screenshots covering implemented views/steps. Preserve the original style references. No external publishing, backend setup, or deployment is required.
