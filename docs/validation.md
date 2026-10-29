# Prototype validation record

Validated October 27, 2026 in the local workspace. The app uses fictional browser-local state; these results do not establish production security, real delivery, team approval, or instructor acceptance.

## Automated evidence

- `npm test`: **13 passed**, no failing unit tests.
- `npm run test:e2e -- --workers=2`: **24 passed** in Chromium.
- `npm run build`: **passed**, including strict TypeScript and unused-code checks.
- Dependency installation after updating the test runner reported **0 vulnerabilities**.
- Browser tests check for uncaught page errors during screen navigation.
- Layout checks pass at 1366 × 900 and 390 × 900; main workflow tests run at 1440 × 1000.

## Acceptance scenarios covered

1. Discover posts through search, type/category/group/status controls, including empty results.
2. Publish a request, deliver simulated alerts to eligible volunteers, apply as two volunteers, approve both as requester, open a three-participant chat, start work, request confirmation, confirm, and award each volunteer +10 once.
3. Submit comments, add/remove votes, report content, and resolve the report as moderator.
4. Prevent pending and outside-neighborhood users from publishing; hide privately submitted addresses from feeds.
5. Cancel and reopen with retained assignment history.
6. Join/leave groups; persist category/channel/group-muting and availability settings.
7. Register a pending account, simulate recovery, preserve logout after reload, reject invalid login and accept valid demo credentials.
8. Accept private message requests before chatting; prevent unrelated account access.
9. Approve pending membership and proposed groups through the moderator screen.
10. Reject public street addresses in forms/comments while allowing ordinary numeric descriptions.
11. Suppress muted-group volunteer alerts.
12. Close an unanswered confirmation only after advancing the explicit 72-hour demo clock, recording a moderator review case.
13. Edit/delete authored posts; persist edited schedule, capacity, group and privacy settings; reject capacity below already approved participants.
14. Approve neighborhood proposals as staff without granting posting rights.
15. Escalate reports to staff, record a removal and justified score adjustment, and retain the resolved decision.
16. Withdraw/reject applications without assigning or opening a task chat.
17. Restrict group-only content to its circle and keep group proposal review in its own neighborhood, preserving its description.
18. Navigate and capture the developed screens with no uncaught browser errors.

## TDD and review corrections

The first 10 domain rule tests were run against deliberately unimplemented behavior and failed before implementation. The first browser screen assertion likewise failed before screens existed. Subsequent regressions were reproduced with failing tests before fixes: over-broad address checks, public-comment addresses, persisted logout, group-only content visibility, approved neighborhood availability, edit-field persistence, and group proposal locality. Unit coverage grew to 13 tests and browser coverage to 24 scenarios.

Independent code review found edit-field persistence and group proposal ownership defects. Both were corrected and covered by regression tests. Staff report review also exposed a lost resolved-history flag, which was corrected and re-tested.

## Artifacts and limits

Screenshots are in `docs/screenshots/`; Playwright generates its HTML report in `playwright-report/` and retains failure traces/screenshots in `test-results/`. The README contains the reproducible presentation walkthrough and account credentials. The requirements map distinguishes implemented prototype screens from the scope's separate planning/class deliverables.

Tests cover representative acceptance and alternate flows, not every possible input or browser. Authentication, authorization, credentials, moderation, notifications, reputation and time advancement are frontend simulations. Address detection is illustrative, optional photos are not OCR-screened, aggregate community statistics are mock figures, and data is not synchronized across devices or users.
