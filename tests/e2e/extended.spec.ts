import { test, expect, Page } from "@playwright/test";
const role = (p: Page, id: string) =>
  p.getByLabel("Demo account").selectOption(id);
const nav = (p: Page, v: string) =>
  p
    .getByRole("navigation")
    .getByRole("button", { name: v, exact: true })
    .click();
const close = (p: Page) =>
  p.getByRole("button", { name: "Close dialog", exact: true }).click();
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
test("private messages require acceptance and stay private to participants", async ({
  page,
}) => {
  await nav(page, "Messages");
  await page.getByRole("button", { name: "June Park", exact: false }).click();
  await expect(
    page.getByLabel("Private message", { exact: true }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Accept request" }).click();
  await page
    .getByLabel("Private message", { exact: true })
    .fill("Meet at 142 Fictional Lane");
  await page.getByRole("button", { name: "Send private message" }).click();
  await role(page, "june");
  await page.locator(".conversation").filter({ hasText: "Maya Chen" }).click();
  await expect(page.getByText("Meet at 142 Fictional Lane")).toBeVisible();
  await role(page, "eli");
  await expect(page.getByText("Meet at 142 Fictional Lane")).not.toBeVisible();
});
test("pending membership becomes approved through moderator review", async ({
  page,
}) => {
  await role(page, "pending");
  await expect(
    page.getByRole("button", { name: "Ask for help" }),
  ).toBeDisabled();
  await role(page, "mod");
  await nav(page, "Moderation");
  await page.getByRole("button", { name: "Approve membership" }).click();
  await role(page, "pending");
  await expect(
    page.getByRole("button", { name: "Ask for help" }),
  ).toBeEnabled();
  await expect(page.getByText("Your membership is pending")).not.toBeVisible();
});
test("group proposals require approval then allow joining", async ({
  page,
}) => {
  await nav(page, "Groups");
  await page.getByRole("button", { name: "Propose a group" }).click();
  await page.getByLabel("Group name").fill("Trail Friends");
  await page
    .getByLabel("What brings this group together?")
    .fill("Free neighborhood walks");
  await page.getByRole("button", { name: "Submit proposal" }).click();
  await expect(
    page.getByRole("button", { name: "Join Trail Friends" }),
  ).not.toBeVisible();
  await role(page, "mod");
  await nav(page, "Moderation");
  await page
    .getByRole("button", { name: "Approve group", exact: true })
    .click();
  await role(page, "maya");
  await nav(page, "Groups");
  await page.getByRole("button", { name: "Join Trail Friends" }).click();
  await expect(
    page.getByRole("button", { name: "Leave Trail Friends" }),
  ).toBeVisible();
});
test("public post validation protects addresses while allowing volunteer counts", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Ask for help", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Need 2 volunteers");
  await page
    .getByLabel("Description")
    .fill("Please bring 2 rakes for our cleanup.");
  await page.getByLabel("Approximate location").fill("123 Main Street");
  await page.getByRole("button", { name: "Publish post" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Keep exact addresses private",
  );
  await page.getByLabel("Approximate location").fill("Near the park");
  await page.getByRole("button", { name: "Publish post" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByText("Need 2 volunteers", { exact: true }).click();
  await page
    .getByPlaceholder("Add a neighborly comment…")
    .fill("Come to 123 Main Street");
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Keep exact addresses private",
  );
  await expect(
    page.getByText("Come to 123 Main Street", { exact: true }),
  ).not.toBeVisible();
});
test("muted group suppresses matching request alerts", async ({ page }) => {
  await role(page, "eli");
  await nav(page, "Settings");
  await page.getByLabel("Mute Garden Club").check();
  await role(page, "maya");
  await nav(page, "Neighborhood");
  await page.getByRole("button", { name: "Ask for help" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Garden group request");
  await page.getByLabel("Description").fill("Help plant the fall garden");
  await page.getByLabel("Approximate location").fill("Community garden");
  await page.getByLabel("Share with").selectOption("Garden Club");
  await page.getByRole("button", { name: "Publish post" }).click();
  await role(page, "eli");
  await page.getByRole("button", { name: "Alerts", exact: true }).click();
  await expect(
    page.getByText("Garden group request", { exact: true }),
  ).not.toBeVisible();
  await role(page, "june");
  await expect(
    page.getByText("Garden group request", { exact: true }),
  ).toBeVisible();
});
test("fallback completion waits 72 simulated hours and queues moderator review", async ({
  page,
}) => {
  await page
    .getByText("A little help with autumn leaves", { exact: true })
    .click();
  await role(page, "eli");
  await page.getByRole("button", { name: "Volunteer for this" }).click();
  await role(page, "maya");
  await page.getByRole("button", { name: "Approve Eli" }).click();
  await role(page, "eli");
  await page.getByRole("button", { name: "Start task" }).click();
  await page.getByRole("button", { name: "Request completion" }).click();
  await expect(
    page.getByRole("button", { name: "Close after 72 hours" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Demo: advance confirmation clock 72 hours" })
    .click();
  await page.getByRole("button", { name: "Close after 72 hours" }).click();
  await expect(page.getByText("Completion points awarded once")).toBeVisible();
  await close(page);
  await role(page, "mod");
  await nav(page, "Moderation");
  await expect(page.getByText("72-hour fallback closure review")).toBeVisible();
});
test("author can edit and delete a post", async ({ page }) => {
  await page
    .getByText("A little help with autumn leaves", { exact: true })
    .click();
  await page.getByRole("button", { name: "Edit post" }).click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("Updated autumn cleanup");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Updated autumn cleanup", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete post" }).click();
  await expect(page.getByText("Updated autumn cleanup")).not.toBeVisible();
});
test("logged out state survives reload and invalid login shows an error", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Log out" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Log in", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill("maya@example.test");
  await page.getByLabel("Password").fill("wrong");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("doesn’t match");
  await page.getByLabel("Password").fill("neighborly");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Good neighbors. Great neighborhood." }),
  ).toBeVisible();
});
for (const width of [1366, 390])
  test(`layout stays within viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole("heading", {
        name: "Good neighbors. Great neighborhood.",
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width < 760) {
      await page.getByRole("button", { name: "Toggle navigation" }).click();
      await nav(page, "Groups");
      await expect(
        page.getByRole("heading", { name: "Find your local circle." }),
      ).toBeVisible();
    }
    await page.screenshot({
      animations: "disabled",
      path: `docs/screenshots/viewport-${width}.png`,
      fullPage: true,
    });
  });
test("staff approves proposed neighborhoods without bypassing membership", async ({
  page,
}) => {
  await nav(page, "My profile");
  await page
    .getByRole("button", { name: "Manage neighborhood membership" })
    .click();
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/membership.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Propose a neighborhood" }).click();
  await page.getByLabel("Neighborhood name").fill("West Ames");
  await page
    .getByRole("button", { name: "Submit neighborhood proposal" })
    .click();
  await role(page, "staff");
  await nav(page, "Moderation");
  await page
    .getByRole("button", { name: "Approve neighborhood", exact: true })
    .click();
  await page.getByLabel("Viewing neighborhood").selectOption("West Ames");
  await expect(
    page.getByText("Join this neighborhood to participate"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ask for help" }),
  ).toBeDisabled();
});
test("local report escalates to staff with a recorded removal and score adjustment", async ({
  page,
}) => {
  await role(page, "mod");
  await nav(page, "Moderation");
  await page.getByRole("button", { name: "Review report" }).click();
  await page
    .getByLabel("Action", { exact: true })
    .selectOption("Escalate to staff");
  await page.getByLabel("Decision reason").fill("Needs staff review");
  await page.getByRole("button", { name: "Resolve report" }).click();
  await role(page, "staff");
  await nav(page, "Moderation");
  await expect(page.getByText("Needs staff review")).toBeVisible();
  await page.getByRole("button", { name: "Review report" }).click();
  await page.getByLabel("Action", { exact: true }).selectOption("Remove post");
  await page
    .getByLabel("Decision reason")
    .fill("Removed after reviewing content");
  await page.getByLabel("Reviewed reputation penalty (points)").fill("3");
  await page.getByRole("button", { name: "Resolve report" }).click();
  await expect(page.getByText("Removed after reviewing content")).toBeVisible();
  await nav(page, "Neighborhood");
  await expect(
    page.getByText("A heads-up from the neighborhood", { exact: true }),
  ).not.toBeVisible();
  await nav(page, "Leaderboard");
  await expect(page.getByTestId("score-mod")).toContainText("317");
});
test("volunteer withdraws and requester can reject applications without assigning", async ({
  page,
}) => {
  await page
    .getByText("A little help with autumn leaves", { exact: true })
    .click();
  await role(page, "eli");
  await page.getByRole("button", { name: "Volunteer for this" }).click();
  await page.getByRole("button", { name: "Withdraw application" }).click();
  await role(page, "maya");
  await expect(
    page.getByRole("button", { name: "Approve Eli" }),
  ).not.toBeVisible();
  await role(page, "eli");
  await page.getByRole("button", { name: "Volunteer for this" }).click();
  await role(page, "maya");
  await page.getByRole("button", { name: "Reject Eli" }).click();
  await expect(page.getByText("Task chat · 2 participants")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Approve Eli" }),
  ).not.toBeVisible();
});
test("group-only post stays within its circle until shared", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Ask for help" }).click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("Private garden request");
  await page.getByLabel("Description").fill("Help tend our little garden");
  await page.getByLabel("Approximate location").fill("Community garden");
  await page.getByLabel("Share with").selectOption("Garden Club");
  await page.getByRole("checkbox", { name: "Also show group posts" }).uncheck();
  await page.getByRole("button", { name: "Publish post" }).click();
  await role(page, "eli");
  await nav(page, "Groups");
  await page.getByRole("button", { name: "Leave Garden Club" }).click();
  await nav(page, "Neighborhood");
  await expect(
    page.getByText("Private garden request", { exact: true }),
  ).not.toBeVisible();
  await nav(page, "Groups");
  await page
    .locator(".group-card")
    .filter({ hasText: "Garden Club" })
    .getByRole("button", { name: "View circle" })
    .click();
  await expect(
    page.getByText("Private garden request", { exact: true }),
  ).not.toBeVisible();
});
test("editing saves group privacy, schedule and volunteer capacity", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Ask for help" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Editable garden day");
  await page.getByLabel("Description").fill("A little garden cleanup");
  await page.getByLabel("Approximate location").fill("Community garden");
  await page.getByLabel("Share with").selectOption("Garden Club");
  await page.getByRole("button", { name: "Publish post" }).click();
  await role(page, "eli");
  await nav(page, "Groups");
  await page.getByRole("button", { name: "Leave Garden Club" }).click();
  await nav(page, "Neighborhood");
  await expect(
    page.getByText("Editable garden day", { exact: true }),
  ).toBeVisible();
  await role(page, "maya");
  await page.getByText("Editable garden day", { exact: true }).click();
  await page.getByRole("button", { name: "Edit post" }).click();
  await page.getByLabel("Date and time (optional)").fill("2026-11-05T13:00");
  await page.getByLabel("Volunteers needed (optional)").fill("3");
  await page.getByRole("checkbox", { name: "Also show group posts" }).uncheck();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByText("0 of 3 volunteers approved", { exact: false }),
  ).toBeVisible();
  await close(page);
  await role(page, "eli");
  await expect(
    page.getByText("Editable garden day", { exact: true }),
  ).not.toBeVisible();
});
test("group proposal review stays in its own neighborhood and preserves the description", async ({
  page,
}) => {
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("neighborly-v1")!);
    const base = s.users[0];
    s.users.push(
      {
        ...base,
        id: "somerset-neighbor",
        name: "Avery Sample",
        neighborhood: "Somerset",
        groups: [],
      },
      {
        ...base,
        id: "somerset-mod",
        name: "Morgan Sample",
        neighborhood: "Somerset",
        role: "Moderator",
        groups: [],
      },
    );
    localStorage.setItem("neighborly-v1", JSON.stringify(s));
  });
  await page.reload();
  await role(page, "somerset-neighbor");
  await nav(page, "Groups");
  await page.getByRole("button", { name: "Propose a group" }).click();
  await page.getByLabel("Group name").fill("Somerset Makers");
  await page
    .getByLabel("What brings this group together?")
    .fill("Free craft and repair afternoons");
  await page.getByRole("button", { name: "Submit proposal" }).click();
  await role(page, "mod");
  await nav(page, "Moderation");
  await expect(
    page.getByText("Somerset Makers", { exact: true }),
  ).not.toBeVisible();
  await role(page, "somerset-mod");
  await nav(page, "Moderation");
  await page
    .getByRole("button", { name: "Approve group", exact: true })
    .click();
  await nav(page, "Groups");
  await expect(
    page.getByRole("heading", { name: "Somerset Makers" }),
  ).toBeVisible();
  await expect(
    page.getByText("Free craft and repair afternoons", { exact: true }),
  ).toBeVisible();
});
