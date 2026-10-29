import { chromium } from "@playwright/test";
import fs from "node:fs";
const mf = "docs/walkthrough/manifest.json",
  m = JSON.parse(fs.readFileSync(mf, "utf8"));
const browser = await chromium.launch();
let ctx, p;
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  p = await ctx.newPage();
  await p.goto("http://127.0.0.1:5174/");
}
async function capture(num) {
  const row = m.find((x) => x.num === num);
  await p.screenshot({
    path: row.path,
    type: "jpeg",
    quality: 86,
    animations: "disabled",
  });
  row.width = 1280;
  row.height = 800;
  console.log("Recaptured notice", num);
}
await fresh();
await p
  .getByRole("button", {
    name: "A little help with autumn leaves",
    exact: true,
  })
  .click();
await p
  .getByPlaceholder("Add a neighborly comment…")
  .fill("Meet at 123 Main Street");
await p.getByRole("button", { name: "Post comment" }).click();
await p.getByRole("status").waitFor();
await capture(55);
await fresh();
await p
  .getByRole("navigation")
  .getByRole("button", { name: "Groups", exact: true })
  .click();
await p.getByRole("button", { name: "Propose a group" }).click();
await p.getByLabel("Group name").fill("Book Exchange");
await p.getByLabel("What brings this group together?").fill("Sharing stories");
await p.getByRole("button", { name: "Submit proposal" }).click();
await p.getByRole("status").waitFor();
await capture(94);
await fresh();
await p
  .getByRole("navigation")
  .getByRole("button", { name: "My profile", exact: true })
  .click();
await p.getByRole("button", { name: "Manage neighborhood membership" }).click();
await p.getByRole("button", { name: "Propose a neighborhood" }).click();
await p.getByLabel("Neighborhood name").fill("Old Town");
await p.getByRole("button", { name: "Submit neighborhood proposal" }).click();
await p.getByRole("status").waitFor();
await capture(134);
fs.writeFileSync(mf, JSON.stringify(m, null, 2));
await browser.close();
