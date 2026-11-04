import { test, expect } from "@playwright/test";
test("public services replace the old social app and login resumes room booking", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Community Services" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Leaderboard", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Rooms", exact: true })
    .click();
  await page.getByRole("button", { name: "View Community Hall" }).click();
  await page.getByRole("button", { name: "Reserve room" }).click();
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await page.getByRole("button", { name: "Continue as Maya" }).click();
  await expect(
    page.getByRole("heading", { name: "Reserve a room" }),
  ).toBeVisible();
});
test("guest anonymous donation simulates payment without an account", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Donations", exact: true })
    .click();
  await page.getByRole("button", { name: "Donate anonymously" }).click();
  await page.getByLabel("Donation amount").fill("25");
  await page.getByRole("button", { name: "Review donation" }).click();
  await page.getByRole("button", { name: "Simulate payment" }).click();
  await expect(
    page.getByRole("heading", { name: "Donation complete." }),
  ).toBeVisible();
  await expect(
    page.getByText("No donor identity is attached to this donation."),
  ).toBeVisible();
});
const nav = async (page: import("@playwright/test").Page, name: string) =>
  page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name, exact: true })
    .click();
const login = async (page: import("@playwright/test").Page) => {
  await page.getByRole("button", { name: "Log in / Sign up" }).click();
  await page.getByRole("button", { name: "Continue as Maya" }).click();
};
const reviewAndPay = async (page: import("@playwright/test").Page) => {
  await page.getByRole("button", { name: "Review reservation" }).click();
  await page
    .getByRole("button", { name: "Continue to simulated payment" })
    .click();
  await page.getByRole("button", { name: "Simulate payment" }).click();
};
test("room plus shuttle shares a review and charges equipment and passenger quantities", async ({
  page,
}) => {
  await page.goto("/");
  await login(page);
  await nav(page, "Packages");
  await page
    .getByRole("button", { name: "Book Room + Shuttle", exact: true })
    .click();
  await expect(page.locator(".booking-summary .price-total")).toContainText(
    "$160.00",
  );
  await page.getByLabel("Event name or type").fill("Community meeting");
  await page.getByLabel("Expected attendance").fill("10");
  await page.getByRole("button", { name: "Choose add-ons" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Catering guests", { exact: false }).fill("10");
  await dialog.getByLabel("Room cleaning", { exact: false }).check();
  await dialog.getByLabel("Tables", { exact: false }).fill("2");
  await dialog.getByLabel("Chairs", { exact: false }).fill("10");
  await dialog.getByRole("button", { name: "Save add-ons" }).click();
  await page.getByRole("button", { name: "Continue to shuttle" }).click();
  await page.getByLabel("Shuttle passengers").fill("2");
  await page.getByRole("button", { name: "Review reservation" }).click();
  await expect(page.getByText("$290.00").first()).toBeVisible();
  await page
    .getByRole("button", { name: "Continue to simulated payment" })
    .click();
  await page.getByRole("button", { name: "Simulate payment" }).click();
  await expect(
    page.getByRole("heading", { name: "Package confirmed." }),
  ).toBeVisible();
  await expect(page.getByText("2 shuttle passengers reserved.")).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/redo/package-confirmation.png",
    fullPage: true,
  });
});
test("class submission stays private until mock admin approval publishes the weekly offering", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Classes");
  await page.getByRole("button", { name: "Teach a class" }).click();
  await page.getByRole("button", { name: "Continue as Maya" }).click();
  await page.getByLabel("Class title").fill("Community Watercolors");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Explore color with a volunteer.");
  await page.getByLabel("Class schedule").selectOption("weekly");
  await page.getByRole("button", { name: "Submit class", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Class submitted." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to services" }).click();
  await page.getByLabel("Search offerings").fill("Community Watercolors");
  await expect(
    page.getByRole("button", { name: "View Community Watercolors" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Mock Admin", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Continue as Demo Admin" }).click();
  await page
    .getByLabel("Price per session for Community Watercolors")
    .fill("12");
  await page.getByRole("button", { name: "Approve and publish" }).click();
  await nav(page, "Classes");
  await page.getByLabel("Search offerings").fill("Community Watercolors");
  await page
    .getByRole("button", { name: "View Community Watercolors" })
    .click();
  await expect(page.getByText("Explore color with a volunteer.")).toBeVisible();
  await page.getByRole("button", { name: "Enroll in class" }).click();
  await reviewAndPay(page);
  await expect(
    page.getByRole("heading", { name: "Reservation confirmed." }),
  ).toBeVisible();
});
test("free class enrolls without payment and class package reserves a shuttle", async ({
  page,
}) => {
  await page.goto("/");
  await login(page);
  await nav(page, "Classes");
  await page.getByRole("button", { name: "View Spanish" }).click();
  await page.getByRole("button", { name: "Enroll in class" }).click();
  await page.getByRole("button", { name: "Review reservation" }).click();
  await page
    .getByRole("button", { name: "Confirm reservation", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Reservation confirmed." }),
  ).toBeVisible();
  await nav(page, "Packages");
  await page.getByRole("button", { name: "Book Classes + Shuttle" }).click();
  await page.getByRole("button", { name: "Continue to shuttle" }).click();
  await page.getByLabel("Shuttle passengers").fill("1");
  await reviewAndPay(page);
  await expect(
    page.getByRole("heading", { name: "Package confirmed." }),
  ).toBeVisible();
});
test("scheduled shuttle and on-demand ride end with accurate reservation versus request states", async ({
  page,
}) => {
  await page.goto("/");
  await login(page);
  await nav(page, "Transportation");
  await page.getByRole("button", { name: "View Library shuttle" }).click();
  await page.getByRole("button", { name: "Reserve shuttle" }).click();
  await page.getByLabel("Passengers", { exact: true }).fill("2");
  await reviewAndPay(page);
  await expect(page.getByText("2 shuttle passengers reserved.")).toBeVisible();
  await nav(page, "Transportation");
  await page
    .getByRole("button", { name: "On-demand rides", exact: true })
    .click();
  await page.getByRole("button", { name: "View On-demand ride" }).click();
  await page
    .getByRole("button", { name: "Request a ride", exact: true })
    .click();
  await page.getByLabel("Pickup time").fill("19:30");
  await page.getByLabel("Pickup address").fill("123 Sample Street");
  await page
    .getByLabel("Destination", { exact: true })
    .fill("Community Center");
  await reviewAndPay(page);
  await expect(
    page.getByRole("heading", { name: "Ride request submitted." }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "No driver has been assigned. This is a request, not a guaranteed ride.",
    ),
  ).toBeVisible();
});
test("home care booking and caregiver availability use distinct take and give flows", async ({
  page,
}) => {
  await page.goto("/");
  await login(page);
  await nav(page, "Home Care");
  await page.getByRole("button", { name: "View Home cleaning" }).click();
  await page.getByRole("button", { name: "Request home care" }).click();
  await page
    .getByLabel("Assistance needed")
    .fill("Light cleaning in the kitchen.");
  await reviewAndPay(page);
  await expect(
    page.getByRole("heading", { name: "Reservation confirmed." }),
  ).toBeVisible();
  await nav(page, "Home Care");
  await page.getByRole("button", { name: "Provide home care" }).click();
  await page.getByLabel("Home cleaning", { exact: true }).check();
  await page.getByLabel("Welfare check", { exact: true }).check();
  await page
    .getByLabel("Qualifications", { exact: true })
    .fill("Community care volunteer.");
  await page.getByRole("button", { name: "Submit availability" }).click();
  await expect(
    page.getByRole("heading", { name: "Availability submitted." }),
  ).toBeVisible();
});
test("driver must choose at least one mode, then can offer both without admin approval", async ({
  page,
}) => {
  await page.goto("/");
  await login(page);
  await nav(page, "Transportation");
  await page.getByRole("button", { name: "Volunteer to drive" }).click();
  await page
    .getByLabel("Qualifications", { exact: true })
    .fill("Licensed driver with community experience.");
  await page.getByRole("button", { name: "Submit availability" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Choose shuttle, on-demand, or both.",
  );
  await page.getByLabel("Scheduled shuttle", { exact: true }).check();
  await page.getByLabel("On-demand ride", { exact: true }).check();
  await page.getByRole("button", { name: "Submit availability" }).click();
  await expect(
    page.getByRole("heading", { name: "Availability submitted." }),
  ).toBeVisible();
});
test("registered donation displays donor details on a sample receipt", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Donations");
  await page.getByRole("button", { name: "Donate with an account" }).click();
  await page.getByRole("button", { name: "Continue as Maya" }).click();
  await page.getByLabel("Donation amount").fill("50");
  await page.getByRole("button", { name: "Review donation" }).click();
  await page.getByRole("button", { name: "Simulate payment" }).click();
  await expect(
    page.getByText("SAMPLE RECEIPT · NOT A TAX DOCUMENT"),
  ).toBeVisible();
  await expect(page.getByText("No email was sent.")).toBeVisible();
});
test("mock pricing changes room add-on totals used by subsequent bookings", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Mock Admin", exact: true }).click();
  await page.getByRole("button", { name: "Continue as Demo Admin" }).click();
  await page
    .getByRole("button", { name: "Sample pricing", exact: true })
    .click();
  await page.getByLabel("Table · each", { exact: true }).fill("7");
  await page.getByRole("button", { name: "Save sample prices" }).click();
  await nav(page, "Rooms");
  await page.getByRole("button", { name: "View Community Hall" }).click();
  await page.getByRole("button", { name: "Reserve room" }).click();
  await page.getByLabel("Event name or type").fill("Test meeting");
  await page.getByRole("button", { name: "Choose add-ons" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Tables", { exact: false })
    .fill("2");
  await page.getByRole("button", { name: "Save add-ons" }).click();
  await page.getByRole("button", { name: "Review reservation" }).click();
  await expect(page.getByText("$174.00").first()).toBeVisible();
});
test("signup accepts multiple volunteer interests and continues the intended action", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Classes");
  await page.getByRole("button", { name: "Teach a class" }).click();
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page.getByLabel("Full name", { exact: true }).fill("Test Volunteer");
  await page
    .getByLabel("Email", { exact: true })
    .fill("volunteer@example.test");
  await page.getByLabel("Password", { exact: true }).fill("samplepass");
  await page
    .getByLabel("Mailing address", { exact: true })
    .fill("123 Sample Lane");
  await page.getByLabel("Teach", { exact: true }).check();
  await page.getByLabel("Drive", { exact: true }).check();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Teach a class." }),
  ).toBeVisible();
});
test("mobile navigation, service pages, and add-on dialog fit the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({
    path: "docs/screenshots/redo/home-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await nav(page, "Rooms");
  await page.getByRole("button", { name: "View Community Hall" }).click();
  await page.getByRole("button", { name: "Reserve room" }).click();
  await page.getByRole("button", { name: "Continue as Maya" }).click();
  await page.getByRole("button", { name: "Choose add-ons" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/screenshots/redo/room-mobile.png",
    fullPage: true,
  });
});
test("capture main service views for teammate visual reference", async ({
  page,
}) => {
  await page.goto("/");
  await page.screenshot({
    path: "docs/screenshots/redo/home.png",
    fullPage: true,
  });
  for (const [view, file] of [
    ["Rooms", "rooms"],
    ["Classes", "classes"],
    ["Transportation", "transportation"],
    ["Home Care", "home-care"],
    ["Donations", "donations"],
    ["Packages", "packages"],
  ]) {
    await nav(page, view);
    await page.screenshot({
      path: `docs/screenshots/redo/${file}.png`,
      fullPage: true,
    });
  }
});

test("capture authentication, forms, booking steps, and mock admin for handoff", async ({
  page,
}) => {
  const shot = async (name: string) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    return page.screenshot({
      path: `docs/screenshots/redo/${name}.png`,
      fullPage: (await page.getByRole("dialog").count()) === 0,
      animations: "disabled",
    });
  };
  await page.goto("/");
  await page.getByRole("button", { name: "Log in / Sign up" }).click();
  await shot("login");
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await shot("signup");
  await page.getByRole("button", { name: "Back to log in" }).click();
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await shot("recovery");
  await page.getByRole("button", { name: "Back to log in" }).click();
  await page.getByRole("button", { name: "Continue as Maya" }).click();
  await nav(page, "Rooms");
  await page.getByRole("button", { name: "View Community Hall" }).click();
  await shot("room-details");
  await page.getByRole("button", { name: "Reserve room" }).click();
  await page.getByLabel("Event name or type").fill("Community meeting");
  await shot("room-form");
  await page.getByRole("button", { name: "Choose add-ons" }).click();
  await shot("room-addons");
  await page.getByRole("button", { name: "Save add-ons" }).click();
  await page.getByRole("button", { name: "Review reservation" }).click();
  await shot("room-review");
  await page
    .getByRole("button", { name: "Continue to simulated payment" })
    .click();
  await shot("simulated-payment");
  await page.getByRole("button", { name: "Simulate payment" }).click();
  await shot("reservation-confirmation");
  await nav(page, "Classes");
  await page.getByRole("button", { name: "View Painting" }).click();
  await shot("class-details");
  await page.getByRole("button", { name: "Enroll in class" }).click();
  await shot("class-enrollment");
  await nav(page, "Classes");
  await page.getByRole("button", { name: "Teach a class" }).click();
  await page.getByLabel("Class title").fill("Watercolors together");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A friendly introduction to watercolor painting.");
  await page.getByLabel("Class schedule").selectOption("weekly");
  await shot("teach-class");
  await page.getByRole("button", { name: "Submit class", exact: true }).click();
  await shot("class-submitted");
  await nav(page, "Transportation");
  await page.getByRole("button", { name: "View Library shuttle" }).click();
  await shot("shuttle-details");
  await page.getByRole("button", { name: "Reserve shuttle" }).click();
  await shot("shuttle-reservation");
  await nav(page, "Transportation");
  await page
    .getByRole("button", { name: "On-demand rides", exact: true })
    .click();
  await page.getByRole("button", { name: "View On-demand ride" }).click();
  await page
    .getByRole("button", { name: "Request a ride", exact: true })
    .click();
  await shot("ride-request");
  await nav(page, "Transportation");
  await page.getByRole("button", { name: "Volunteer to drive" }).click();
  await shot("volunteer-drive");
  await nav(page, "Home Care");
  await page.getByRole("button", { name: "View Nursing" }).click();
  await shot("home-care-details");
  await page.getByRole("button", { name: "Request home care" }).click();
  await shot("home-care-request");
  await nav(page, "Home Care");
  await page.getByRole("button", { name: "Provide home care" }).click();
  await shot("volunteer-care");
  await nav(page, "Donations");
  await page.getByRole("button", { name: "Donate with an account" }).click();
  await shot("registered-donation");
  await page.getByRole("button", { name: "Review donation" }).click();
  await shot("donation-review");
  await page.getByRole("button", { name: "Simulate payment" }).click();
  await shot("donation-receipt");
  await nav(page, "Packages");
  await page.getByRole("button", { name: "Book Classes + Shuttle" }).click();
  await page.getByRole("button", { name: "Continue to shuttle" }).click();
  await shot("package-shuttle-selection");
  await page.getByRole("button", { name: "Review reservation" }).click();
  await shot("package-review");
  await page
    .getByRole("button", { name: "Mock Admin", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Continue as Demo Admin" }).click();
  await shot("admin-class-approvals");
  await page
    .getByRole("button", { name: "Sample pricing", exact: true })
    .click();
  await shot("admin-pricing");
});
