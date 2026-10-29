import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
const role = async (page: any, id: string) =>
  page.getByLabel("Demo account").selectOption(id);
const nav = async (page: any, name: string) =>
  page
    .getByRole("navigation")
    .getByRole("button", { name, exact: true })
    .click();
test("home discovery, search, filters and empty state", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Good neighbors. Great neighborhood." }),
  ).toBeVisible();
  await page.getByPlaceholder("Search your neighborhood").fill("zznothing");
  await expect(page.getByText("No posts found")).toBeVisible();
  await page.getByPlaceholder("Search your neighborhood").fill("");
  await page.getByRole("button", { name: "Giveaways", exact: true }).click();
  await expect(
    page.getByText("A few good books, free to a new home"),
  ).toBeVisible();
  await expect(
    page.getByText("A little help with autumn leaves"),
  ).not.toBeVisible();
});
test("complete multi-volunteer lifecycle and one-time points", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Ask for help", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("Community garden cleanup");
  await page
    .getByLabel("Description")
    .fill("Two neighbors needed to tidy the garden.");
  await page.getByLabel("Approximate location").fill("Near Brookside Park");
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/request-form.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Publish post" }).click();
  await role(page, "eli");
  await page
    .getByRole("button", { name: "Alerts", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Community garden cleanup").first(),
  ).toBeVisible();
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/alerts.png",
    fullPage: true,
  });
  await nav(page, "Neighborhood");
  await page
    .getByText("Community garden cleanup", { exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Volunteer for this", exact: true })
    .click();
  await role(page, "june");
  await page
    .getByRole("button", { name: "Volunteer for this", exact: true })
    .click();
  await role(page, "maya");
  await page.getByRole("button", { name: "Approve Eli" }).click();
  await page.getByRole("button", { name: "Approve June" }).click();
  await expect(page.getByText("Task chat · 3 participants")).toBeVisible();
  await page.locator(".chat-panel").screenshot({
    animations: "disabled",
    path: "docs/screenshots/task-chat.png",
  });
  await page.getByPlaceholder("Write a message…").fill("See you by the park!");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByText("See you by the park!")).toBeVisible();
  await role(page, "eli");
  await page.getByRole("button", { name: "Start task", exact: true }).click();
  await page
    .getByRole("button", { name: "Request completion", exact: true })
    .click();
  await role(page, "maya");
  await page
    .getByRole("button", { name: "Confirm completion", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByText("Completed", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Completion points awarded once")).toBeVisible();
  await page.reload();
  await nav(page, "Leaderboard");
  await expect(page.getByTestId("score-eli")).toContainText("138");
});
test("comments, reversible votes, reporting and moderator resolution", async ({
  page,
}) => {
  await page
    .getByText("A little help with autumn leaves", { exact: true })
    .click();
  const up = page.getByRole("button", { name: "Upvote", exact: true });
  await up.click();
  await expect(up).toHaveAttribute("aria-pressed", "true");
  await up.click();
  await expect(up).toHaveAttribute("aria-pressed", "false");
  await page
    .getByPlaceholder("Add a neighborly comment…")
    .fill("Happy to bring a rake.");
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.getByText("Happy to bring a rake.")).toBeVisible();
  await page.getByRole("button", { name: "Report post" }).click();
  await page.getByLabel("Report reason").fill("Please review this post");
  await page.getByRole("button", { name: "Submit report" }).click();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await role(page, "mod");
  await nav(page, "Moderation");
  await page.getByRole("button", { name: "Review report" }).last().click();
  await page
    .getByLabel("Decision reason")
    .fill("Reviewed under community rules");
  await page.getByRole("button", { name: "Resolve report" }).click();
  await expect(page.getByText("Reviewed under community rules")).toBeVisible();
});
test("pending and outside-neighborhood members cannot publish; private addresses stay private", async ({
  page,
}) => {
  await role(page, "pending");
  await expect(page.getByText("Your membership is pending")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ask for help", exact: true }).first(),
  ).toBeDisabled();
  await role(page, "maya");
  await page.getByLabel("Viewing neighborhood").selectOption("Somerset");
  await expect(
    page.getByText("Join this neighborhood to participate"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ask for help", exact: true }).first(),
  ).toBeDisabled();
  await page.getByLabel("Viewing neighborhood").selectOption("Old Town");
  await expect(page.locator("main")).not.toContainText("142 Fictional Lane");
});
test("cancellation reopens without erasing history", async ({ page }) => {
  await page
    .getByText("A little help with autumn leaves", { exact: true })
    .click();
  await role(page, "eli");
  await page
    .getByRole("button", { name: "Volunteer for this", exact: true })
    .click();
  await role(page, "maya");
  await page.getByRole("button", { name: "Approve Eli" }).click();
  await page.getByRole("button", { name: "Cancel task", exact: true }).click();
  await page
    .getByRole("button", { name: "Reopen request", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByText("Open", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Cancelled by Maya")).toBeVisible();
});
test("groups, profile availability and notification preferences persist", async ({
  page,
}) => {
  await nav(page, "Groups");
  await page.getByRole("button", { name: "Join Book Exchange" }).click();
  await expect(
    page.getByRole("button", { name: "Leave Book Exchange" }),
  ).toBeVisible();
  await nav(page, "Settings");
  await page.getByLabel("Email alerts").uncheck();
  await page.getByLabel("Mute Garden Club").check();
  await page.reload();
  await nav(page, "Settings");
  await expect(page.getByLabel("Email alerts")).not.toBeChecked();
  await expect(page.getByLabel("Mute Garden Club")).toBeChecked();
  await nav(page, "My profile");
  await page.getByLabel("Available to volunteer").uncheck();
  await expect(page.getByText("Volunteering paused")).toBeVisible();
});
test("account registration, simulated login and recovery", async ({ page }) => {
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/login.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/registration.png",
    fullPage: true,
  });
  await page.getByLabel("Full name").fill("Alex Sample");
  await page.getByLabel("Email", { exact: true }).fill("alex@example.test");
  await page.getByLabel("Password", { exact: true }).fill("samplepass");
  await page.getByLabel("Private address").fill("99 Imaginary Road");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByText("Your membership is pending")).toBeVisible();
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/recovery.png",
    fullPage: true,
  });
  await page.getByLabel("Email", { exact: true }).fill("alex@example.test");
  await page.getByRole("button", { name: "Send recovery link" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Recovery email simulated",
  );
});
test("all navigation screens render without console errors and capture screenshots", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const name of [
    "Neighborhood",
    "Find help",
    "My tasks",
    "Messages",
    "Groups",
    "Leaderboard",
    "My profile",
    "Settings",
  ]) {
    await nav(page, name);
    await expect(page.locator("main")).toBeVisible();
    await page.screenshot({
      animations: "disabled",
      path: `docs/screenshots/${name.toLowerCase().replaceAll(" ", "-")}.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
  await role(page, "mod");
  await nav(page, "Moderation");
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/moderation.png",
    fullPage: true,
  });
});
