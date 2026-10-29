# Scope analysis and coverage

Source: [SE 3290 Scope Deliverable, proposed baseline v1.1](https://docs.google.com/document/d/1BZFUlM6-j86mst1qKpeVt4Rpfp1dJXovP1rShxiqiaE/edit), read October 27, 2026.

## Product interpretation

A nonprofit-operated neighborhood website for free help and useful community posts. All members are neighbors; volunteering is an availability setting. The frontend supports desktop demonstrations, with an additional narrow-screen layout. Membership and roles are simulated, not independently verified. The scope’s production construction, backend, database, integrations, hosting, and deployment are planning-only items and are excluded from this implementation.

## Coverage map

| Scope / WBS               | Implemented screen and behavior                                                                                                    | Verification                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 3.1 Home/navigation       | Neighborhood dashboard, discovery, contextual actions, persistent navigation                                                       | Navigation and viewport E2E                                    |
| 3.2 Account access        | Simulated registration, login, logout, recovery, required fields and invalid credentials                                           | Account and persisted logout E2E                               |
| 3.3 Profile               | Editable name/bio, volunteer availability, reputation summary                                                                      | Profile/settings E2E                                           |
| 4.1 Membership            | Private self-declared address submission; pending/approved/rejected states; neighborhood selection                                 | Membership, posting restriction E2E and domain tests           |
| 4.2 Neighborhood creation | Duplicate detection, staff proposal review; approval does not grant membership                                                     | Staff proposal E2E                                             |
| 4.3 Groups                | Proposals, moderator approval, join/leave, group circles, neighborhood sharing                                                     | Group approval, private-group E2E                              |
| 5.1 Posts/comments        | PSAs, giveaways, garage sales, events; details, create/edit/delete, optional photos, comments                                      | Feed, editing, privacy and moderation E2E                      |
| 5.2 Discovery             | Text search and category, group, status and post-type filters; empty state                                                         | Discovery E2E                                                  |
| 5.3 Reactions             | One reversible up/downvote per person; appreciation reactions                                                                      | Voting E2E and domain test                                     |
| 6.1 Requests/offers       | Required request fields, approximate location, optional date/count/photo; free-help offers and message requests                    | Lifecycle, form/privacy E2E                                    |
| 6.2 Applications          | Apply/withdraw; requester approve/reject; capacity and multi-volunteer task chat                                                   | Multi-volunteer and application E2E; domain tests              |
| 6.3 Task lifecycle        | Open → Assigned → In progress → Awaiting confirmation → Completed; Cancelled → Open; retained history; explicit 72-hour demo clock | Lifecycle, cancellation, fallback E2E; transition/reward tests |
| 7.1 Communication         | Accepted private message requests; task chat limited to approved participants                                                      | Consent/privacy and lifecycle E2E                              |
| 7.2 Alerts                | Per-recipient delivery log; neighborhood and group volunteer targeting                                                             | Lifecycle, muted-group E2E; eligibility test                   |
| 7.3 Preferences           | Availability, category subscriptions, group muting; website/email/browser channel simulation                                       | Preferences E2E and eligibility test                           |
| 8.1 Points                | Net vote delta; +10 per approved volunteer on confirmed completion, awarded once                                                   | Scoring/lifecycle domain tests and E2E                         |
| 8.2 Recognition           | Neighborhood leaderboard; point badges 50/100/250; task badges 1/5/10; category badges after 5                                     | Badge domain test, leaderboard E2E                             |
| 8.3 Feedback              | Report task experience; reasoned moderator score adjustments                                                                       | Report/escalation E2E                                          |
| 9.1 Permissions           | Pending/outside-neighborhood posting restrictions, local moderators, staff escalations                                             | Membership, role and moderation E2E                            |
| 9.2 Enforcement           | Report, block/unblock, content removal, suspension, resolution/escalation and recorded reasons                                     | Reporting and staff E2E                                        |
| 9.3 Privacy/content       | Private membership addresses; approximate public locations; participant chat; local/free/kind guidelines; reports                  | Privacy, chat, and membership tests                            |
| 10.1–10.3 Prototype       | Integrated frontend, browser-local sample state, source, screenshots, validation records                                           | Build, unit suite and Playwright suite                         |

## Boundaries

No paid services, advertising transactions, donations, payments, bookings, rentals, catering, class registration, transportation management, emergency response, identity verification, native app, real message/email/browser delivery, or production launch. Neighborhood boundaries and residency are self-declared. The prototype supports moderation of prohibited content; it does not perform automated content classification.

Figma work, an SRS, project budget, schedule, WBS revisions and production technical design remain separate class deliverables. This task delivers the requested frontend and its validation artifacts, without fabricating approval, deadlines, or team review.
