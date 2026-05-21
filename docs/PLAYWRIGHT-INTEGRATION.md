# Playwright E2E Integration Guide & Specifications

This document outlines the detailed architecture, configuration, and test specifications for the **Playwright End-to-End (E2E) automation suite** in the Next.js web client (`ReviewPortal-Web`). 

---

## 1. Overview & Architecture

Playwright is used for high-fidelity browser automation, running full user scenarios against a compiled production bundle of the Next.js client.

```
+-------------------------------------------------------------+
|                      Playwright Runner                      |
|                                                             |
|   +-------------------+             +-------------------+   |
|   |   Chromium E2E    |             |    Firefox E2E    |   |
|   +---------+---------+             +---------+---------+   |
|             |                                 |             |
+-------------|---------------------------------|-------------+
              |                                 |
              +----------------+----------------+
                               | (HTTP/HTML/JS)
                               v
               +---------------+---------------+
               |      Next.js Web Client       |
               |     http://localhost:3000     |
               +---------------+---------------+
                               |
                               v
               +---------------+---------------+
               |      ASP.NET Core Web API     |
               |     http://localhost:5000     |
               +-------------------------------+
```

---

## 2. Installation & Setup

To activate the Playwright automated suite, run the following commands in the `ReviewPortal-Web` root directory:

```bash
# 1. Install Playwright test runner as a development dependency
npm install --save-dev @playwright/test

# 2. Download and install modern browser binaries (Chromium, Firefox, WebKit) and OS dependencies
npx playwright install --with-deps
```

---

## 3. Configuration Scaffolding (`playwright.config.ts`)

The suite utilizes a customized `playwright.config.ts` located at the project root. It handles test isolation, browser selection, sequential scheduling, and automatic server instantiation:

```typescript
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Auth cache storage destinations
export const STORAGE_STATE_ADMIN = path.join(__dirname, 'playwright/.auth/admin.json');
export const STORAGE_STATE_USER = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Sequential execution prevents database race conditions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker avoids database write collisions during E2E runs
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry', // Saves execution traces upon failure for easy debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Global setup block to handle one-time user sign-in caching
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],

  // Boots local Next.js client automatically before running specs
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

## 4. Authentication Caching Setup (`tests/e2e/global.setup.ts`)

To avoid performing slow login workflows in every single E2E test, Playwright captures standard browser storage contexts (cookies & local storage) and writes them to local secure JSON cache files. Tests then instantiate clean contexts loaded with these states.

```typescript
import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE_ADMIN, STORAGE_STATE_USER } from '../../playwright.config';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@reviewportal.com');
  await page.fill('input[name="password"]', 'AdminSecurePass123!');
  await page.click('button[type="submit"]');

  // Verify successful redirect to the admin shell
  await expect(page).toHaveURL(/.*dashboard|.*\//);
  
  // Cache credentials
  await page.context().storageState({ path: STORAGE_STATE_ADMIN });
});

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'customer@reviewportal.com');
  await page.fill('input[name="password"]', 'CustomerPass123!');
  await page.click('button[type="submit"]');

  // Verify redirect to landing page
  await expect(page).toHaveURL('/');
  
  // Cache credentials
  await page.context().storageState({ path: STORAGE_STATE_USER });
});
```

---

## 5. Critical Journey Specifications

The suite automates the three core user workflows outlined in your Testing Strategy:

### Journey 1: Browse -> Detail -> Calculate (`tests/e2e/browse-calculate.spec.ts`)
Validates responsive navigation, catalogue browsing, details views, and interactive client-side calculator behavior.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Journey 1: Browse -> Detail -> Calculate', () => {
  test('should browse the equipment list and compute pricing correctly', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Rent Quality Tools');

    // 2. Click through to the public equipment directory
    await page.click('a:has-text("Browse Available Equipment")');
    await expect(page).toHaveURL('/equipment');

    // 3. Select the first tool card in the grid
    const firstTool = page.locator('a.group').first();
    await expect(firstTool).toBeVisible();
    const toolName = await firstTool.locator('h3').innerText();
    
    await firstTool.click();
    await expect(page).toHaveURL(/\/equipment\/\d+/);
    await expect(page.locator('h1')).toContainText(toolName);

    // 4. Test client-side Calculator calculations
    const calculator = page.locator('div:has-text("Rental Calculator")').first();
    await expect(calculator).toBeVisible();

    // Verify daily rate calculations
    const dailyBtn = page.locator('button:has-text("Daily")');
    await expect(dailyBtn).toHaveClass(/bg-accent/); // Highlighted active rate

    // Change numeric duration to 4 days
    const durationInput = page.locator('input[type="number"]').nth(1);
    await durationInput.fill('4');

    // Check estimated total is computed and visible
    const totalCost = page.locator('span.text-3xl.font-bold.text-accent');
    await expect(totalCost).not.toContainText('--');

    // Verify booking action button state
    await expect(page.locator('button:has-text("Book Now")')).toBeEnabled();
  });
});
```

### Journey 2: Submit Review -> Moderate -> Publish (`tests/e2e/review-moderation.spec.ts`)
Validates full end-to-end data integrity: user submits feedback, moderator approves it from the staff portal, guest sees it updated in public real-time feed.

```typescript
import { test, expect } from '@playwright/test';
import { STORAGE_STATE_USER, STORAGE_STATE_ADMIN } from '../../playwright.config';

test.describe('Journey 2: Submit Review -> Moderate -> Publish', () => {
  const timestampReview = `E2E Automated review text verifying integrity. - ${Date.now()}`;

  test('should submit reviews, approve inside moderation dashboard, and render publicly', async ({ browser }) => {
    // Phase 1: Submit feedback as Customer
    const userCtx = await browser.newContext({ storageState: STORAGE_STATE_USER });
    const userPage = await userCtx.newPage();
    
    await userPage.goto('/equipment/1');
    await expect(userPage.locator('h1')).toBeVisible();

    // Complete review form
    await userPage.fill('textarea[placeholder*="Write your review"]', timestampReview);
    const starSection = userPage.locator('div.flex.items-center.gap-1').first();
    await starSection.locator('svg').nth(4).click(); // Click 5th star
    await userPage.click('button[type="submit"]:has-text("Submit")');

    // Verify the pending status notification
    const feedbackBanner = userPage.locator('div:has-text("submitted and is awaiting moderation")');
    await expect(feedbackBanner).toBeVisible();
    await userCtx.close();

    // Phase 2: Approve the pending review as Admin
    const adminCtx = await browser.newContext({ storageState: STORAGE_STATE_ADMIN });
    const adminPage = await adminCtx.newPage();
    
    await adminPage.goto('/admin/moderation');
    await expect(adminPage.locator('h2')).toContainText('Moderation Queue');

    // Locate matching submission item
    const reviewBlock = adminPage.locator(`article:has-text("${timestampReview}")`);
    await expect(reviewBlock).toBeVisible();

    // Perform approval action
    await reviewBlock.locator('button:has-text("Approve review")').click();

    // Wait for optimistic UI update and item removal
    await expect(reviewBlock).not.toBeVisible();
    await adminCtx.close();

    // Phase 3: Verify public visibility
    const guestCtx = await browser.newContext();
    const guestPage = await guestCtx.newPage();
    
    await guestPage.goto('/equipment/1');
    const approvedItem = guestPage.locator(`article:has-text("${timestampReview}")`);
    await expect(approvedItem).toBeVisible();
    await guestCtx.close();
  });
});
```

### Journey 3: Admin -> Add Tool -> Verify (`tests/e2e/admin-tool.spec.ts`)
Validates back-office administrative features: file upload logic, database mutations, and immediate public search visibility.

```typescript
import { test, expect } from '@playwright/test';
import { STORAGE_STATE_ADMIN } from '../../playwright.config';
import path from 'path';

test.describe('Journey 3: Admin -> Add Tool -> Verify', () => {
  test.use({ storageState: STORAGE_STATE_ADMIN });

  test('should create a custom tool and see it listed in catalog', async ({ page }) => {
    const e2eToolName = `MSc Hammer ${Date.now()}`;

    await page.goto('/admin/tools');
    await expect(page.locator('h1')).toContainText('Tool Catalogue');

    // Open add tool drawer/modal
    await page.click('button:has-text("Create Tool")');
    await expect(page.locator('h3:has-text("Create tool")')).toBeVisible();

    // Pre-fill forms
    await page.selectOption('select[name="categoryId"]', '1');
    await page.fill('input[name="name"]', e2eToolName);
    await page.fill('textarea[name="description"]', 'Heavy weight demolition hammer for automated verification.');
    await page.fill('input[name="hourlyRate"]', '12.50');
    await page.fill('input[name="dailyRate"]', '37.00');
    await page.fill('input[name="weeklyRate"]', '150.00');
    await page.fill('textarea[name="specialNotes"]', 'Wear hearing protection; Check steel pins.');

    // Upload asset
    const uploadEvent = page.waitForEvent('filechooser');
    await page.click('input[type="file"]');
    const uploader = await uploadEvent;
    await uploader.setFiles(path.join(__dirname, 'mock-thumbnail.png'));

    // Submit form
    await page.click('button[type="submit"]:has-text("Create tool")');

    // Confirm UI optimistic transition
    await expect(page.locator('h3:has-text("Create tool")')).not.toBeVisible();
    await expect(page.locator(`tr:has-text("${e2eToolName}")`)).toBeVisible();

    // Verify public index updates
    await page.goto('/equipment');
    const catalogCard = page.locator(`a:has-text("${e2eToolName}")`);
    await expect(catalogCard).toBeVisible();
  });
});
```

---

## 6. Execution Command Scripts

Once installed, the following npm scripts are added to `package.json` to facilitate developer runs:

- **Standard Run**: `npm run test:e2e`  
  Executes all three specification files sequentially inside headless background browser threads. Prints terminal reports.
- **Interactive UI Panel**: `npm run test:e2e:ui`  
  Launches the graphical desktop dashboard of Playwright. Allows developers to step through individual click items, view DOM structures at each step, and inspect API network calls in a timeline ruler.
- **Specific Browser**: `npx playwright test --project=firefox`  
  Runs tests exclusively against the Firefox browser environment.

---

## 7. CI/CD Integration (.github/workflows)

The tests run inside GitHub Actions on every Pull Request targeting `main` or `develop` branch. A dedicated `.github/workflows/playwright.yml` handles:

1. Checking out code and caching NPM dependencies.
2. Setting up the official LTS Node.js runtimes.
3. Automatically caching Playwright browser binary versions.
4. Spawning local Next.js client.
5. Invoking tests and saving results.
6. Uploading HTML reports and debugging zip traces to GitHub actions tab on failure for interactive audit post-mortems.
