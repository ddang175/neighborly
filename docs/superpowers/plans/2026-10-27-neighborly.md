# Neighborly implementation and validation plan

Goal: Build the Community Help App scope as a frontend-only Ames demonstration.
Architecture: React/TypeScript views over a tested local state model. localStorage persists fictional data. Demo roles simulate accounts; no APIs, backend, or real delivery.
Source: Google scope baseline v1.1, document 1BZFUlM6-j86mst1qKpeVt4Rpfp1dJXovP1rShxiqiaE.

1. Write and run failing model tests for membership and neighborhood authorization, private addresses, one vote, filtered alerts, multi-volunteer assignment, state transitions, cancellation history, and one-time +10 awards.
2. Implement the pure domain model and run all unit tests.
3. Write failing Playwright scenarios for feed discovery, request/application/approval/chat/completion, comments/votes, accounts/membership, groups/preferences, and moderation.
4. Implement the desktop app: neighborhood dashboard/feed; post form/details; task board; messages; groups; alerts; recognition; profile; membership; moderation and staff; simulated login/register/recovery.
5. Run browser scenarios, correct failures, verify production build, and capture final screenshots.

Review focus: repeating completion cannot duplicate points; switching account cannot reveal private chat; cancellation preserves history; muted groups/category/channel settings filter delivery; pending/outside members cannot publish. Address validation prevents public street numbers.
Design choices: Neighborly working name; warm green/cream visual identity; default accepted neighbor Maya Chen; fictional Ames data; deterministic local reset and role switcher; 72-hour closure demonstrated using an explicit demo clock.
