# Testing Strategy — Shelton Tool-Hire Review Portal (Web Client)

## 1. Overview

This document outlines the approach to testing the Next.js web client. It mirrors the API's [TESTING-STRATEGY.md](../../ReviewPortal-API/docs/TESTING-STRATEGY.md) and follows the same test pyramid: most coverage at the unit/component level, fewer integration tests, and a small set of end-to-end tests covering critical user journeys.

The goal is **meaningful coverage** — every form validation rule, every guard, every conditional render branch — not a fixed coverage percentage.

The detailed test plan, including black-box and usability schemas, is in [TEST-PLAN.md](TEST-PLAN.md).

---

## 2. Test Pyramid

```
         /  E2E  \           ← 3 critical user journeys (Playwright)
        /---------\
       / Integration \       ← Route handler proxy + form ↔ API contract
      /----------------\
     /   Component &     \   ← React components, hooks, lib helpers (Jest + RTL)
    /__Unit Tests__________\
```

| Level | What we test | Tools | Approx. count |
|-------|--------------|-------|----------------|
| **Unit / Component** | UI components, hooks, lib helpers, zod schemas | Jest, @testing-library/react, @testing-library/user-event | 60–80 tests |
| **Integration** | Route handlers (`/api/auth/*`, `/api/backend/*`), form submission flows with mocked fetch | Jest + msw / fetch-mock | 15–25 tests |
| **End-to-End** | Critical user journeys through the browser against a running app | Playwright | 3–5 scenarios |

---

## 3. Unit & Component Tests

**Configuration:** [jest.config.mjs](../jest.config.mjs), [jest.setup.ts](../jest.setup.ts)
**Test location:** Co-located `__tests__` folders next to the component (e.g. `components/equipment/__tests__/RentalCalculator.test.tsx`)

### 3.1 Coverage Areas

- **Forms:** every form's `zod` schema (success, missing field, boundary length, malformed value) and the form's rendering of inline error messages.
- **UI primitives:** non-trivial variants in [components/ui/](../components/ui/) (e.g. `Button` size/variant matrix).
- **Feature components:** conditional rendering branches (`hasEnoughReviews`, `companyResponse` presence, `status === 'Pending'` badge).
- **Hooks:** [hooks/use-debounce.ts](../hooks/use-debounce.ts), [hooks/use-current-user.ts](../hooks/use-current-user.ts).
- **Lib helpers:** API client error mapping, ProblemDetails → React Hook Form field error mapping, currency / date formatters.
- **Guards:** [lib/admin-guard.ts](../lib/admin-guard.ts) — verifies 401 redirect and 403 redirect paths.

### 3.2 Naming Convention

```
describe('<Subject>', () => {
  it('<state under test> → <expected behaviour>', () => { ... });
});
```

Examples:
- `describe('RentalCalculator', () => { it('end date before start → shows inline error and disables submit') })`
- `describe('admin-guard', () => { it('401 from /api/auth/me → redirects to /login?next=...') })`
- `describe('reviewSchema', () => { it('text under 20 chars → fails with min-length message') })`

### 3.3 Test Data

Co-locate small fixtures next to the test. Where a fixture is reused, place it in `__fixtures__/` inside the feature folder. Generate randomised data with vanilla helpers rather than a faker library — speed matters more than realism for component tests.

---

## 4. Integration Tests

### 4.1 Route Handlers

Tests for [app/api/auth/login/route.ts](../app/api/auth/login/), [app/api/auth/logout/route.ts](../app/api/auth/logout/), and [app/api/backend/[...path]/route.ts](../app/api/backend/) verify:

- Successful login sets the `rp.auth` cookie with `HttpOnly`, `Secure`, `SameSite=Lax`.
- Logout clears the cookie.
- The proxy forwards the path, method, and body unchanged, attaches the `Authorization` header from the cookie, and surfaces non-2xx responses without leaking stack traces.

Mock the upstream API with `msw` (server) or a fetch shim.

### 4.2 Form ↔ API Contract

For each form (`ReviewForm`, `AdminToolForm`, `AdminCategoryForm`, `CommentForm`, `CompanyResponseForm`, `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `RentalCalculator`):

- Submitting valid data POSTs to the expected URL with the expected JSON body.
- A 400 ProblemDetails maps each `errors.<field>` entry to a React Hook Form field error.
- A 401 prompts the auth-redirect helper.
- A 5xx surfaces a toast and leaves the form editable.

---

## 5. End-to-End Tests

**Tool:** Playwright
**Location:** `tests/e2e/` (integrated and planned in Sprint 4 — see the complete setup and code specs in [PLAYWRIGHT-INTEGRATION.md](PLAYWRIGHT-INTEGRATION.md))

### 5.1 Critical User Journeys

#### Journey 1: Browse → Detail → Calculate
1. Navigate to homepage.
2. Click a category.
3. Click a tool.
4. Enter a start and end date-time in the calculator.
5. Verify the breakdown and total render.

#### Journey 2: Submit Review → Moderate → Publish
1. Open a tool detail page.
2. Submit a review with all five ratings and ≥ 20 chars of text.
3. Verify the "Awaiting moderation" toast.
4. Log in as a moderator in a second context.
5. Navigate to `/admin/moderation` and approve the review.
6. Return to the tool detail page and verify the review is visible.

#### Journey 3: Admin → Add Tool → Verify
1. Log in as admin.
2. Navigate to `/admin/tools/new`.
3. Fill all required fields and upload an image.
4. Save.
5. Navigate to `/equipment/[categoryId]` and confirm the new tool appears.

### 5.2 Setup
- Use Playwright projects to run against Chromium, Firefox, and WebKit.
- Start a local Next.js production build (`npm run build && npm run start`) before the suite.
- Seed the backend with the same fixtures the API integration tests use.

---

## 6. Acceptance Criteria Traceability

Every user story in [agile/](agile/) has acceptance criteria that map to at least one test:

| Test Level | What It Verifies |
|------------|-------------------|
| Unit / component | Render branches, conditional UI, validation messages, helpers |
| Integration | Route handler behaviour, form → API contract |
| E2E | Full user flow including hydration and navigation |

A story is **Done** when:
- ✅ All acceptance criteria have corresponding passing tests.
- ✅ Component tests cover the new render branches.
- ✅ The form's zod schema has explicit cases per validation rule.
- ✅ A manual smoke test on a dev build confirms the visual state.
- ✅ Reviewed via pull request.

---

## 7. Coverage Targets

Coverage is computed via `jest --coverage`. Targets are based on what matters:

| Area | Target | Rationale |
|------|--------|-----------|
| Forms and validators | 100% line | Validation rules must each have a test |
| Feature components | 80%+ line | Every conditional branch in user-visible UI |
| Hooks and lib helpers | 90%+ line | Tiny, deterministic, easy to test |
| UI primitives | 60%+ line | Mostly thin wrappers; integration tests cover usage |
| Route handlers | 90%+ line | Auth and proxy behaviour is security-critical |
| Pages | not measured | Pages are integration-tested via E2E |

---

## 8. CI Integration

The GitHub Actions workflow runs on every push:

```yaml
- run: npm ci
- run: npm run lint
- run: npm test -- --runInBand --coverage
- run: npm run build
```

`prebuild` invokes `npm run test:ci`, so a failing test blocks the build even if a developer runs `npm run build` directly. Playwright runs on a nightly workflow against the latest production build (post-submission task).

---

## 9. Manual Test Aides

- Run `npm run dev` and click through the three critical journeys before tagging a release.
- Use the React DevTools Profiler on the homepage and a category page after any layout change to confirm no client-side waterfall is introduced.
- Run Lighthouse against the production build (`npm run build && npm run start`) before submitting any non-trivial change to the public shell.
