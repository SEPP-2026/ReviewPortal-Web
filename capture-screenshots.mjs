import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = "https://reviewportal-frontend-dccvarataff4a8hg.southeastasia-01.azurewebsites.net";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const CREDS = {
  customer: { email: "customer.test@reviewportal.local", password: "Customer123!" },
  moderator: { email: "moderator.test@reviewportal.local", password: "Moderator123!" },
  admin: { email: "admin.test@reviewportal.local", password: "Admin123!" },
};

const TOOL_ID = 2011; // SDS Max Drill (real, has image)

// page sets: [filename, path]
const GUEST = [
  ["guest-home", "/"],
  ["guest-equipment", "/equipment"],
  ["guest-equipment-detail", `/equipment/${TOOL_ID}`],
  ["guest-reviews", "/reviews"],
  ["guest-calculator", "/calculator"],
  ["guest-pricing", "/pricing"],
  ["guest-services", "/services"],
  ["guest-contact", "/contact"],
  ["guest-login", "/login"],
  ["guest-register", "/register"],
];
const CUSTOMER = [
  ["customer-home", "/"],
  ["customer-equipment-detail", `/equipment/${TOOL_ID}`],
  ["customer-reviews", "/reviews"],
  ["customer-account-reviews", "/account/reviews"],
  ["customer-change-password", "/account/change-password"],
];
const MODERATOR = [
  ["moderator-moderation", "/admin/moderation"],
  ["moderator-bookings", "/admin/bookings"],
];
const ADMIN = [
  ["admin-dashboard", "/admin"],
  ["admin-tools", "/admin/tools"],
  ["admin-categories", "/admin/categories"],
  ["admin-bookings", "/admin/bookings"],
  ["admin-moderation", "/admin/moderation"],
];

async function settle(page) {
  try { await page.waitForLoadState("networkidle", { timeout: 15000 }); } catch {}
  await page.waitForTimeout(1500);
}

async function shoot(page, name, path) {
  const url = BASE + path;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await settle(page);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    console.log(`  OK  ${name}  (${path})`);
  } catch (e) {
    console.log(`  FAIL ${name} (${path}): ${e.message}`);
  }
}

async function login(context, page, role) {
  const { email, password } = CREDS[role];
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.fill("#login-email", email);
  await page.fill("#login-password", password);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await settle(page);
  // confirm cookie present
  const cookies = await context.cookies();
  const ok = cookies.some((c) => c.name === "rp_auth");
  console.log(`  login ${role}: cookie ${ok ? "set" : "MISSING"} url=${page.url().replace(BASE, "")}`);
  return ok;
}

async function runRole(browser, role, pages, loginRole) {
  console.log(`\n=== ${role} ===`);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  if (loginRole) await login(context, page, loginRole);
  for (const [name, path] of pages) await shoot(page, name, path);
  await context.close();
}

const browser = await chromium.launch();
await runRole(browser, "guest", GUEST, null);
await runRole(browser, "customer", CUSTOMER, "customer");
await runRole(browser, "moderator", MODERATOR, "moderator");
await runRole(browser, "admin", ADMIN, "admin");
await browser.close();
console.log("\nDONE");
