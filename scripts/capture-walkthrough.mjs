import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const out = path.resolve("docs/walkthrough");
fs.mkdirSync(out, { recursive: true });
const manifest = [];
const errors = [];
const browser = await chromium.launch();
let p, context, chapter;
const btn = (name) => p.getByRole("button", { name, exact: true });
const click = async (name) => btn(name).click();
const nav = async (name) => {
  await p
    .getByRole("navigation")
    .getByRole("button", { name, exact: true })
    .click();
  await p.evaluate(() => window.scrollTo(0, 0));
};
const role = async (id) => p.getByLabel("Demo account").selectOption(id);
const close = async () =>
  p
    .getByRole("dialog")
    .last()
    .getByRole("button", { name: "Close dialog", exact: true })
    .click();
async function fresh() {
  if (context) await context.close();
  context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  p = await context.newPage();
  p.setDefaultTimeout(6000);
  await p.goto("http://127.0.0.1:5174/");
  await p
    .getByRole("heading", { name: "Good neighbors. Great neighborhood." })
    .waitFor();
  await p.evaluate(() => document.fonts.ready);
}
async function snap(title, caption, target) {
  const toast = p.getByRole("button", { name: "Dismiss notification" });
  if (await toast.isVisible()) await toast.click();
  let loc = target;
  if (!loc && (await p.getByRole("dialog").count()))
    loc = p.getByRole("dialog").last();
  if (loc) await loc.scrollIntoViewIfNeeded();
  const num = manifest.length + 1;
  const filename = `${String(num).padStart(3, "0")}-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 65)}.jpg`;
  const file = path.join(out, filename);
  let dim;
  if (loc) {
    const b = await loc.boundingBox();
    dim = { width: Math.round(b.width), height: Math.round(b.height) };
  } else dim = p.viewportSize();
  await (loc || p).screenshot({
    path: file,
    type: "jpeg",
    quality: 86,
    animations: "disabled",
  });
  manifest.push({ num, chapter, title, caption, path: file, ...dim });
  fs.writeFileSync(
    path.join(out, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log(`${num}. ${title}`);
}
async function run(name, fn) {
  chapter = name;
  await fresh();
  try {
    await fn();
  } catch (e) {
    errors.push({ chapter: name, error: e.message });
    console.log("ERROR " + name + ": " + e.message);
    await p.screenshot({
      path: path.join(out, "error-" + errors.length + ".png"),
    });
  }
}
async function openPost(title = "A little help with autumn leaves") {
  await p.getByRole("button", { name: title, exact: true }).click();
}
async function request(title, group = "") {
  await click("Ask for help");
  await p.getByLabel("Title", { exact: true }).fill(title);
  await p
    .getByLabel("Description")
    .fill(
      "A couple of helping hands for a friendly neighborhood project. All help is free.",
    );
  await p.getByLabel("Approximate location").fill("Near Brookside Park");
  if (group) await p.getByLabel("Share with").selectOption(group);
}
await run("01 · Home and navigation", async () => {
  await snap(
    "Neighborhood home",
    "The desktop landing page introduces Old Town, community activity, navigation, and the Ask for help action.",
  );
  await p.locator("#feed").scrollIntoViewIfNeeded();
  await snap(
    "Neighborhood feed",
    "The feed combines posts, comments, votes, category tabs, search, group filters, and task-status filters.",
  );
  await p.locator(".book-photo").scrollIntoViewIfNeeded();
  await snap(
    "Giveaway and volunteer offer cards",
    "Giveaways and free-help offers appear beside ordinary neighborhood information.",
  );
  await nav("Find help");
  await snap(
    "Find help page",
    "The volunteering discovery page brings free help requests and volunteer offers together.",
  );
  await nav("My tasks");
  await snap(
    "My tasks page",
    "A member’s requests, applications, and assignments appear in the task board.",
  );
});
await run("02 · Registration and account access", async () => {
  await click("Log out");
  await snap(
    "Login page",
    "The simulated login page includes email/password fields, recovery, registration, and a demo shortcut.",
  );
  await p.getByLabel("Email", { exact: true }).fill("maya@example.test");
  await p.getByLabel("Password").fill("incorrect");
  await click("Log in");
  await snap(
    "Invalid login",
    "An incorrect demo password displays an inline error.",
  );
  await click("Forgot password?");
  await snap(
    "Account recovery form",
    "A neighbor can enter an email address for simulated account recovery.",
  );
  await p.getByLabel("Email", { exact: true }).fill("maya@example.test");
  await click("Send recovery link");
  await snap(
    "Recovery confirmation",
    "The confirmation explicitly states that delivery is simulated; no email is sent.",
  );
  await click("Back to log in");
  await click("Create an account");
  await snap(
    "Registration page",
    "Registration collects name, email, password, neighborhood, private address, and agreement to community rules.",
  );
  await p.getByLabel("Full name").fill("Alex Sample");
  await p.getByLabel("Email", { exact: true }).fill("alex@example.test");
  await p.getByLabel("Password").fill("neighborly123");
  await p.getByLabel("Private address").fill("99 Imaginary Road");
  await p.getByRole("checkbox").check();
  await snap(
    "Completed registration form",
    "Fictional address information is submitted privately for membership review.",
  );
  await click("Create account");
  await snap(
    "Registered account pending approval",
    "New accounts enter a pending state, and publishing controls are disabled.",
  );
  await click("Log out");
  await p.getByLabel("Email", { exact: true }).fill("maya@example.test");
  await p.getByLabel("Password").fill("neighborly");
  await click("Log in");
  await snap(
    "Successful simulated login",
    "Valid demo credentials restore access to the approved neighbor’s community.",
  );
});
await run("03 · Neighborhood membership", async () => {
  await nav("My profile");
  await click("Manage neighborhood membership");
  await snap(
    "Membership page",
    "Membership status, self-declared residency, neighborhood selection, and private address submission are visible here.",
  );
  await p.getByLabel("Private address").fill("200 Fictional Lane");
  await p.getByLabel("I self-declare").check();
  await snap(
    "Membership request form filled",
    "The address is restricted to membership review and is not displayed on the public feed.",
  );
  await click("Request membership review");
  await snap(
    "Membership review pending",
    "Submitting a membership request returns the member to a pending state.",
  );
  await role("mod");
  await nav("Moderation");
  await snap(
    "Moderator membership review",
    "A local moderator can review the privately submitted address and approve or reject membership.",
  );
  await p
    .locator(".review-item")
    .filter({ hasText: "Maya Chen" })
    .getByRole("button", { name: "Approve membership" })
    .click();
  await role("maya");
  await nav("Neighborhood");
  await snap(
    "Membership approved",
    "Approval restores neighborhood publishing controls.",
  );
  await p.getByLabel("Viewing neighborhood").selectOption("Somerset");
  await snap(
    "Outside neighborhood restriction",
    "A member viewing another neighborhood cannot publish there or read that neighborhood’s member feed.",
  );
  await p.getByLabel("Viewing neighborhood").selectOption("Old Town");
  await role("pending");
  await snap(
    "Pending member restriction",
    "The seeded pending neighbor Sam Rivera sees the pending notice and disabled publishing actions.",
  );
  await role("mod");
  await nav("Moderation");
  await click("Reject");
  await role("pending");
  await nav("Neighborhood");
  await snap(
    "Rejected membership",
    "A rejected member remains unable to publish and sees the rejected status.",
  );
});
await run("04 · Feed discovery and post details", async () => {
  await p.locator("#feed").scrollIntoViewIfNeeded();
  for (const tab of [
    "Help requests",
    "Offers to help",
    "Giveaways",
    "Events",
    "PSAs",
    "Garage sales",
  ]) {
    await click(tab);
    await snap(
      `${tab} filter`,
      `Selecting ${tab} narrows the feed to that post type.`,
    );
  }
  await click("All posts");
  await p.getByLabel("Search your neighborhood").fill("books");
  await snap(
    "Text search results",
    "Text search matches post titles and descriptions.",
  );
  await p
    .getByLabel("Search your neighborhood")
    .fill("no-matching-neighbor-post");
  await snap(
    "Empty search results",
    "An empty-results message offers a clear way to recover by changing search or filters.",
  );
  await p.getByLabel("Search your neighborhood").fill("");
  await p.getByLabel("Category filter").selectOption("Tech help");
  await snap(
    "Category filter",
    "Category filtering narrows posts to a service area such as Tech help.",
  );
  await p.getByLabel("Category filter").selectOption("");
  await p.getByLabel("Group filter").selectOption("Garden Club");
  await snap(
    "Group filter",
    "A group filter narrows the neighborhood feed to Garden Club posts.",
  );
  await p.getByLabel("Group filter").selectOption("");
  await p.getByLabel("Task status filter").selectOption("Open");
  await snap(
    "Task status filter",
    "The task-status filter exposes the current request state.",
  );
  await p.getByLabel("Task status filter").selectOption("");
  for (const title of [
    "A few good books, free to a new home",
    "A friendly hand with your tech",
    "Let’s grow something together",
    "A heads-up from the neighborhood",
    "Saturday porch treasure hunt",
  ]) {
    await openPost(title);
    await snap(
      `${title} details`,
      "The detail view opens the full post, author, category, approximate location, reactions, and conversation.",
    );
    await close();
  }
});
await run("05 · Creating and editing posts", async () => {
  await request("Saturday neighborhood cleanup");
  await snap(
    "Help request form upper section",
    "Required fields are title, description, category, and approximate location.",
  );
  await p.getByLabel("Photo (optional)").scrollIntoViewIfNeeded();
  await snap(
    "Help request optional fields",
    "Optional controls include date/time, volunteer count, group sharing, neighborhood visibility, and a photo.",
  );
  await p.getByLabel("Approximate location").fill("123 Main Street");
  await click("Publish post");
  await p.getByRole("alert").scrollIntoViewIfNeeded();
  await snap(
    "Public address validation",
    "An exact street address is rejected in public post fields; a general area should be used.",
  );
  await p.getByLabel("Approximate location").fill("Near Brookside Park");
  await p.getByLabel("Date and time (optional)").fill("2026-11-07T10:00");
  await p.getByLabel("Volunteers needed (optional)").fill("3");
  await click("Publish post");
  await p.locator("#feed").scrollIntoViewIfNeeded();
  await snap(
    "Published help request",
    "The new request appears immediately in the browser-local neighborhood feed.",
  );
  await openPost("Saturday neighborhood cleanup");
  await click("Edit post");
  await p.getByLabel("Title", { exact: true }).fill("Saturday park cleanup");
  await snap(
    "Edit post form",
    "Authors can edit title, description, category, location, schedule, capacity, group, sharing, and photo.",
  );
  await click("Save changes");
  await snap(
    "Saved post changes",
    "The revised title and volunteer capacity are reflected in the detail view.",
  );
  await click("Delete post");
  await p.locator("#feed").scrollIntoViewIfNeeded();
  await snap(
    "Post deleted",
    "Deleting an authored post removes it from the neighborhood feed.",
  );
  await click("Ask for help");
  await p.getByLabel("Post type").selectOption("Offer help");
  await p
    .getByLabel("Title", { exact: true })
    .fill("Happy to help with a laptop");
  await p
    .getByLabel("Description")
    .fill("Free computer help on Sunday afternoons.");
  await p.getByLabel("Category", { exact: true }).selectOption("Tech help");
  await p.getByLabel("Approximate location").fill("Old Town library area");
  await snap(
    "Free volunteer offer form",
    "The same composer supports offers of free assistance, with category and availability details.",
  );
  await click("Publish post");
  await openPost("Happy to help with a laptop");
  await snap(
    "Published volunteer offer",
    "The volunteer offer opens as a complete neighborhood post.",
  );
  await close();
  await click("Ask for help");
  await p.getByLabel("Post type").selectOption("PSA");
  await p.getByLabel("Title", { exact: true }).fill("A neighborly reminder");
  await p
    .getByLabel("Description")
    .fill("Please keep the community garden gate closed.");
  await p.getByLabel("Approximate location").fill("Community garden");
  await p
    .getByLabel("Photo (optional)")
    .setInputFiles({
      name: "sample-photo.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6U8AAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await p.locator(".upload-preview").waitFor();
  await snap(
    "Photo attachment preview",
    "The composer accepts an optional image and displays a preview before publishing.",
  );
  await click("Publish post");
  await openPost("A neighborly reminder");
  await snap(
    "Published PSA with attachment",
    "The published post retains its optional attachment.",
  );
});
await run("06 · Comments, voting and boundaries", async () => {
  await openPost();
  await snap(
    "Help request details open",
    "The requester sees post actions, help status, applications, task history, and neighborhood comments.",
  );
  await click("Upvote");
  await snap(
    "Upvote applied",
    "The selected upvote and net vote total change together.",
  );
  await click("Downvote");
  await snap(
    "Vote changed to downvote",
    "Changing vote direction replaces the prior vote rather than creating an additional vote.",
  );
  await click("Downvote");
  await snap(
    "Vote removed",
    "Selecting the same vote again removes it and restores the net total.",
  );
  await click("React with appreciation");
  await snap(
    "Appreciation reaction",
    "A separate heart reaction records appreciation without completing the task.",
  );
  await p
    .getByPlaceholder("Add a neighborly comment…")
    .fill("Happy to bring an extra rake.");
  await click("Post comment");
  await snap(
    "Comment posted",
    "A neighborly comment appears with the author’s name in the public conversation.",
    p.locator(".comments"),
  );
  await p
    .getByPlaceholder("Add a neighborly comment…")
    .fill("Meet at 123 Main Street");
  await click("Post comment");
  await snap(
    "Address rejected in comment",
    "The public conversation rejects exact street-address text; private chat is the appropriate place for it.",
  );
  await role("eli");
  await click("Report post");
  await p
    .getByLabel("Report reason")
    .fill("Please review the details of this request.");
  await snap(
    "Report post form",
    "A report describes the concern and explains that penalties require moderator review.",
    p.locator(".report-form"),
  );
  await click("Submit report");
  await snap(
    "Report submitted",
    "A report is recorded without automatically changing the author’s reputation.",
  );
  await click("Block neighbor");
  await nav("Neighborhood");
  await p.locator("#feed").scrollIntoViewIfNeeded();
  await snap(
    "Blocked author hidden from feed",
    "Blocking a neighbor removes that author’s posts from the viewer’s feed.",
  );
  await nav("Settings");
  await p.getByRole("button", { name: "Unblock" }).scrollIntoViewIfNeeded();
  await snap(
    "Blocked-neighbor settings",
    "Settings list blocked neighbors and provide an Unblock control.",
  );
  await click("Unblock");
  await snap(
    "Neighbor unblocked",
    "The blocked entry is removed and the neighbor can appear in the feed again.",
  );
});
await run("07 · Volunteer request lifecycle", async () => {
  await request("Community garden cleanup");
  await click("Publish post");
  await role("eli");
  await click("Alerts");
  await snap(
    "Eligible volunteer receives alert",
    "A new help request creates a simulated alert for an available volunteer with matching preferences.",
  );
  await nav("Neighborhood");
  await openPost("Community garden cleanup");
  await snap(
    "Volunteer request before application",
    "The eligible volunteer sees the application action; task chat is not available yet.",
  );
  await click("Volunteer for this");
  await snap(
    "Volunteer application sent",
    "Applying does not assign the volunteer; approval is still required.",
  );
  await click("Withdraw application");
  await snap(
    "Application withdrawn",
    "A volunteer can withdraw before approval.",
  );
  await click("Volunteer for this");
  await role("june");
  await click("Volunteer for this");
  await role("maya");
  await snap(
    "Requester reviews two applicants",
    "The requester can compare applicants’ task counts and points, then approve or decline them.",
    p.locator(".task-panel"),
  );
  await click("Approve Eli");
  await snap(
    "First volunteer assigned",
    "Approving a volunteer changes the task to Assigned and opens a private task chat.",
    p.locator(".task-panel"),
  );
  await click("Approve June");
  await snap(
    "Multiple volunteers approved",
    "The task records both participants and capacity; approval remains requester-controlled.",
    p.locator(".task-panel"),
  );
  await snap(
    "Three-person task chat",
    "The requester and two approved volunteers share a private task conversation.",
    p.locator(".chat-panel"),
  );
  await p
    .getByLabel("Task message")
    .fill("Let’s meet by the community garden gate at ten.");
  await click("Send message");
  await snap(
    "Task message sent",
    "Chat content is visible to the requester and approved task participants.",
    p.locator(".chat-panel"),
  );
  await role("mod");
  await snap(
    "Unassigned member has no task chat",
    "An unrelated approved neighbor can view the public post but does not receive the private task conversation.",
  );
  await role("eli");
  await click("Start task");
  await snap(
    "Task in progress",
    "An approved participant starts work, moving the task to In progress.",
    p.locator(".task-panel"),
  );
  await click("Request completion");
  await snap(
    "Awaiting requester confirmation",
    "The volunteer requests confirmation; the task is not completed or rewarded yet.",
    p.locator(".task-panel"),
  );
  await role("maya");
  await snap(
    "Requester completion confirmation",
    "The requester receives the Confirm completion action.",
    p.locator(".task-panel"),
  );
  await click("Confirm completion");
  await snap(
    "Task completed and rewarded once",
    "Completion is confirmed and each approved volunteer receives one ten-point task reward.",
    p.locator(".task-panel"),
  );
  await snap(
    "Task experience feedback",
    "Either task party can report an experience for moderator review; reports do not impose automatic penalties.",
    p.locator(".report-form"),
  );
  await close();
  await nav("Leaderboard");
  await snap(
    "Leaderboard after completion",
    "The leaderboard reflects the confirmed task points for both approved volunteers.",
  );
  await nav("My tasks");
  await click("Completed");
  await snap(
    "Completed task board filter",
    "The task board can be narrowed to completed work.",
  );
  await nav("Messages");
  await snap(
    "Task chat listed in Messages",
    "Approved task conversations also appear in the member’s conversation list.",
  );
});
await run("08 · Cancellation, rejection and fallback", async () => {
  await openPost();
  await role("eli");
  await click("Volunteer for this");
  await role("maya");
  await click("Reject Eli");
  await snap(
    "Application declined",
    "The requester can decline an application without assigning the volunteer or opening chat.",
    p.locator(".task-panel"),
  );
  await role("eli");
  await click("Volunteer for this");
  await role("maya");
  await click("Approve Eli");
  await click("Cancel task");
  await snap(
    "Task cancelled",
    "Cancelling changes the state while retaining the assignment history.",
    p.locator(".task-panel"),
  );
  await click("Reopen request");
  await snap(
    "Request reopened with retained history",
    "Reopening restores Open status, clears active assignments, and retains prior approvals and cancellation history.",
    p.locator(".task-panel"),
  );
  await role("eli");
  await click("Volunteer for this");
  await role("maya");
  await click("Approve Eli");
  await role("eli");
  await click("Start task");
  await click("Request completion");
  await snap(
    "Fallback unavailable before 72 hours",
    "The fallback closure control is disabled until the confirmation waiting period has elapsed.",
    p.locator(".fallback"),
  );
  await click("Demo: advance confirmation clock 72 hours");
  await snap(
    "Fallback enabled after demo clock advance",
    "The explicit demo clock simulates the proposed 72-hour waiting period.",
    p.locator(".fallback"),
  );
  await click("Close after 72 hours");
  await snap(
    "Fallback task closure",
    "The task closes with a recorded fallback history entry and one-time completion points.",
    p.locator(".task-panel"),
  );
  await close();
  await role("mod");
  await nav("Moderation");
  await snap(
    "Fallback queued for review",
    "Fallback closure produces a moderator-review report rather than silently bypassing oversight.",
  );
});
await run("09 · Groups and local circles", async () => {
  await nav("Groups");
  await snap(
    "Groups page",
    "Approved local circles list their purpose, sample member count, join/leave action, and group page.",
  );
  await p
    .locator(".group-card")
    .filter({ hasText: "Garden Club" })
    .getByRole("button", { name: "View circle" })
    .click();
  await snap(
    "Group page as member",
    "A joined group shows posts, a mute option, and a group-post composer action.",
  );
  await p.getByLabel("Mute Garden Club").check();
  await snap(
    "Group muted from circle page",
    "Group members can silence matching alerts directly from the circle.",
  );
  await click("Post to this group");
  await snap(
    "Group-specific composer",
    "Opening the composer from a circle preselects the group.",
  );
  await p.getByRole("checkbox", { name: "Also show group posts" }).uncheck();
  await snap(
    "Group-only sharing setting",
    "Unchecking neighborhood sharing keeps a group post restricted to the circle.",
  );
  await close();
  await close();
  await click("Leave Garden Club");
  await snap(
    "Group left",
    "After leaving, the group offers Join group and matching group alerts no longer target the member.",
  );
  await click("Join Book Exchange");
  await snap(
    "Group joined",
    "Joining a new circle changes its action to Joined / Leave.",
  );
  await click("Propose a group");
  await snap(
    "Propose group dialog",
    "A new circle requires a name and description and waits for moderator approval.",
  );
  await p.getByLabel("Group name").fill("Book Exchange");
  await p
    .getByLabel("What brings this group together?")
    .fill("Sharing stories");
  await click("Submit proposal");
  await snap(
    "Duplicate group detected",
    "A duplicate group name is rejected without creating another circle.",
  );
  await p.getByLabel("Group name").fill("Trail Friends");
  await p
    .getByLabel("What brings this group together?")
    .fill("Free neighborhood walks and trail cleanups.");
  await click("Submit proposal");
  await snap(
    "Group proposal pending",
    "The proposed group is listed as pending and is not yet available for joining.",
  );
  await role("mod");
  await nav("Moderation");
  await snap(
    "Group proposal in moderator queue",
    "A local moderator reviews proposed groups within the neighborhood.",
  );
  await click("Approve group");
  await role("maya");
  await nav("Groups");
  await snap(
    "Approved group available",
    "An approved group becomes visible with its submitted description and a Join group control.",
  );
});
await run("10 · Private messaging", async () => {
  await nav("Messages");
  await snap(
    "Messages landing page",
    "The conversation list includes message requests and approved task chats; no conversation is selected initially.",
  );
  await p.locator(".conversation").filter({ hasText: "June Park" }).click();
  await snap(
    "Incoming private-message request",
    "The recipient must accept or decline before either side can exchange private messages.",
  );
  await click("Decline request");
  await snap(
    "Message request declined",
    "Declining removes the request without creating a conversation.",
  );
  await p.getByLabel("Choose a neighbor").selectOption("eli");
  await snap(
    "New message-request recipient",
    "The sender chooses an approved neighbor from the same neighborhood.",
  );
  await click("Send message request");
  await p.locator(".conversation").filter({ hasText: "Eli Brooks" }).click();
  await snap(
    "Outgoing request awaiting consent",
    "The sender sees a waiting state; no message input appears before acceptance.",
  );
  await role("eli");
  await p.locator(".conversation").filter({ hasText: "Maya Chen" }).click();
  await snap(
    "Recipient reviews message request",
    "The recipient can accept the new request or decline it.",
  );
  await click("Accept request");
  await snap(
    "Accepted private conversation",
    "Acceptance opens the private message input.",
  );
  await p
    .getByLabel("Private message", { exact: true })
    .fill("Thanks for helping! We can share the exact meeting place here.");
  await click("Send private message");
  await snap(
    "Private message delivered in simulation",
    "The message is added to the accepted conversation in local browser data.",
  );
  await role("maya");
  await p.locator(".conversation").filter({ hasText: "Eli Brooks" }).click();
  await snap(
    "Private conversation viewed by other participant",
    "The other accepted participant sees the same simulated message.",
  );
  await role("june");
  await snap(
    "Private conversation hidden from unrelated neighbor",
    "An unrelated account does not see or access another pair’s private conversation.",
  );
});
await run("11 · Alerts and preferences", async () => {
  await click("Alerts");
  await snap(
    "Alerts page with new item",
    "Website alerts show read state and simulated delivery channels.",
  );
  await click("Mark all as read");
  await snap(
    "Alerts marked read",
    "Mark all as read clears the visible unread state.",
  );
  await role("eli");
  await snap(
    "Empty alerts state",
    "A member with no matching website alerts sees a quiet-state message.",
  );
  await nav("Settings");
  await snap(
    "Notification settings",
    "A neighbor controls website, email, simulated browser delivery, categories, group muting, and blocked neighbors.",
  );
  await p.getByLabel("Email alerts").uncheck();
  await p.getByLabel("Browser alerts").check();
  await snap(
    "Delivery channels changed",
    "The demo stores channel preferences; browser delivery remains explicitly simulated.",
  );
  await p.getByLabel("Yard & garden", { exact: true }).uncheck();
  await snap(
    "Category subscription changed",
    "A deselected category no longer qualifies the member for matching request alerts.",
  );
  await p.getByLabel("Mute Garden Club").check();
  await snap(
    "Group alert mute enabled",
    "A muted group is excluded from matching request delivery.",
  );
  await p.reload();
  await nav("Settings");
  await snap(
    "Preferences persist after reload",
    "Saved browser-local settings survive a page reload.",
  );
});
await run("12 · Profile, availability and recognition", async () => {
  await nav("My profile");
  await snap(
    "Member profile",
    "The profile presents the neighbor, membership status, bio, availability, points, task count, and badges.",
  );
  await click("Edit profile");
  await snap(
    "Profile editor",
    "The member can change the display name and biography.",
  );
  await p
    .getByLabel("About me")
    .fill("I enjoy gardening, lending tools, and meeting neighbors.");
  await click("Save profile");
  await snap(
    "Profile edits saved",
    "The updated biography appears on the profile.",
  );
  await p.getByLabel("Available to volunteer").uncheck();
  await snap(
    "Volunteering paused",
    "Pausing availability removes the member from eligible volunteer alert targeting and prevents new applications.",
  );
  await p.getByLabel("Available to volunteer").check();
  await snap(
    "Volunteering resumed",
    "Availability can be restored without changing neighborhood membership.",
  );
  await nav("Leaderboard");
  await snap(
    "Neighborhood leaderboard",
    "The leaderboard ranks approved neighbors using sample points and confirmed work.",
  );
  await p.locator(".scoring-note").scrollIntoViewIfNeeded();
  await snap(
    "Badges and scoring rules",
    "Recognition explains net vote points, ten-point task rewards, point/task/category badge thresholds, and reviewed penalties.",
  );
});
await run("13 · Reports, enforcement and staff review", async () => {
  await role("mod");
  await nav("Moderation");
  await snap(
    "Moderator dashboard",
    "Local moderators review reports, membership, and group proposals.",
  );
  await click("Review report");
  await snap(
    "Report review dialog",
    "Every moderation decision includes an action, recorded reason, and optional justified point adjustment.",
  );
  await p
    .getByLabel("Decision reason")
    .fill("Reviewed the posted park closure dates; no rule violation.");
  await click("Resolve report");
  await snap(
    "Resolved report decision",
    "The resolved report retains the recorded decision reason.",
  );
  await fresh();
  await role("mod");
  await nav("Moderation");
  await click("Review report");
  await p.getByLabel("Action", { exact: true }).selectOption("Suspend author");
  await p
    .getByLabel("Decision reason")
    .fill("Demo suspension after reviewing a repeated content violation.");
  await snap(
    "Suspension review action",
    "Suspension requires an explicit moderator decision and reason.",
  );
  await click("Resolve report");
  await role("mod");
  await nav("Neighborhood");
  await snap(
    "Suspended-member restriction",
    "The suspended account sees its membership state and loses publishing controls.",
  );
  await fresh();
  await role("mod");
  await nav("Moderation");
  await click("Review report");
  await p
    .getByLabel("Action", { exact: true })
    .selectOption("Escalate to staff");
  await p
    .getByLabel("Decision reason")
    .fill("Requesting staff review of this report.");
  await snap(
    "Escalation prepared",
    "A moderator may send an unresolved case to nonprofit staff with a recorded reason.",
  );
  await click("Resolve report");
  await role("staff");
  await nav("Moderation");
  await snap(
    "Staff escalations dashboard",
    "Staff can review the escalated report and proposed neighborhoods.",
  );
  await click("Review report");
  await p.getByLabel("Action", { exact: true }).selectOption("Remove post");
  await p
    .getByLabel("Decision reason")
    .fill("Removed after staff review of community guidelines.");
  await p.getByLabel("Reviewed reputation penalty (points)").fill("3");
  await snap(
    "Content removal and reviewed penalty",
    "Staff can remove a reported post and record a justified reputation adjustment.",
  );
  await click("Resolve report");
  await snap(
    "Staff decision retained in history",
    "The resolved escalated report remains visible with its reason.",
  );
  await nav("Neighborhood");
  await p.locator("#feed").scrollIntoViewIfNeeded();
  await snap(
    "Reported content removed",
    "The removed PSA is absent from the neighborhood feed.",
  );
});
await run("14 · Neighborhood proposals and staff decisions", async () => {
  await nav("My profile");
  await click("Manage neighborhood membership");
  await click("Propose a neighborhood");
  await snap(
    "Propose neighborhood dialog",
    "A neighbor can propose a missing neighborhood for nonprofit staff review.",
  );
  await p.getByLabel("Neighborhood name").fill("Old Town");
  await click("Submit neighborhood proposal");
  await snap(
    "Duplicate neighborhood warning",
    "Known or already-proposed neighborhood names are rejected.",
  );
  await p.getByLabel("Neighborhood name").fill("West Ames");
  await click("Submit neighborhood proposal");
  await snap(
    "Neighborhood proposal pending",
    "A submitted neighborhood is listed as waiting for staff review.",
  );
  await role("staff");
  await nav("Moderation");
  await snap(
    "Neighborhood staff review queue",
    "Staff review the new neighborhood proposal separately from local group approvals.",
  );
  await click("Approve neighborhood");
  await snap(
    "Neighborhood proposal approved",
    "Staff approval creates an available neighborhood listing.",
  );
  await p.getByLabel("Viewing neighborhood").selectOption("West Ames");
  await snap(
    "Approved neighborhood still needs membership",
    "Creating a neighborhood does not grant posting permission; the member must still request membership.",
  );
});
await run("15 · Responsive layouts and demo controls", async () => {
  await p.setViewportSize({ width: 1366, height: 768 });
  await snap(
    "Desktop layout at 1366 by 768",
    "The desktop layout keeps the main navigation, community dashboard, and primary action visible.",
  );
  await p.setViewportSize({ width: 390, height: 844 });
  await snap(
    "Narrow layout at 390 pixels",
    "The narrow layout reorganizes the same frontend without horizontal page overflow.",
  );
  await click("Toggle navigation");
  await snap(
    "Narrow navigation drawer",
    "A compact menu exposes the same app sections.",
  );
  await nav("Groups");
  await snap(
    "Narrow groups layout",
    "Local circle cards stack vertically on a narrow display.",
  );
  await p.setViewportSize({ width: 1280, height: 800 });
  await nav("Neighborhood");
  await click("Reset demo");
  await snap(
    "Demo reset and role toolbar",
    "Reset demo restores sample data; the toolbar switches between requester, volunteers, pending neighbor, moderator, and staff.",
  );
});
fs.writeFileSync(
  path.join(out, "errors.json"),
  JSON.stringify(errors, null, 2),
);
console.log(JSON.stringify({ screenshots: manifest.length, errors }));
await browser.close();
