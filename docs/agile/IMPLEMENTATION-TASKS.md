# Implementation Tasks — Web Client

> Backend counterpart: [../../../ReviewPortal-API/docs/agile/IMPLEMENTATION-TASKS.md](../../../ReviewPortal-API/docs/agile/IMPLEMENTATION-TASKS.md).
>
> This document lists the discrete frontend tasks executed across the four sprints. Each row pairs to a user story in [EPIC-1](EPIC-1-CATALOGUE-AND-CALCULATOR.md) / [EPIC-2](EPIC-2-REVIEWS-AND-RATINGS.md) / [EPIC-3](EPIC-3-BACKOFFICE-AND-MODERATION.md) and a UI requirement in [../REQUIREMENTS-SPECIFICATION.md](../REQUIREMENTS-SPECIFICATION.md).

---

## Conventions

- `Task ID` is the frontend task identifier (`FE-TASK-*`).
- `Status` is one of `Done`, `In Progress`, `Open`, or `Blocked`.
- `Evidence` points to the file, route, or commit that proves completion.

---

## Sprint 1 — Foundation

| Task ID | Description | Story | Status | Evidence |
|---------|-------------|-------|--------|----------|
| FE-TASK-01 | Bootstrap Next.js 15 App Router project with TS, Tailwind 4, ESLint, Prettier | US-1.9-FE | Done | [../../package.json](../../package.json), [../../tsconfig.json](../../tsconfig.json), [../../next.config.ts](../../next.config.ts) |
| FE-TASK-02 | Configure `components.json` + shadcn/ui primitives in [components/ui/](../../components/ui/) | US-1.1-FE | Done | [../../components.json](../../components.json) |
| FE-TASK-03 | Site shell: `SiteHeader`, `SiteFooter`, `MobileNav` | US-1.7-FE | Done | [../../components/layout](../../components/layout) |
| FE-TASK-04 | Set up `types/api.ts` with the catalogue DTOs | US-1.8-FE | Done | [../../types/api.ts](../../types/api.ts) |
| FE-TASK-05 | `lib/api-client.ts` and `lib/backend-api.ts` for client and server fetch | US-1.8-FE | Done | [../../lib/api-client.ts](../../lib/api-client.ts), [../../lib/backend-api.ts](../../lib/backend-api.ts) |
| FE-TASK-06 | `app/api/backend/[...path]/route.ts` proxy with cookie attachment | US-1.8-FE | Done | [../../app/api/backend](../../app/api/backend) |
| FE-TASK-07 | Homepage RSC + `FeaturedCategories` + `CategoryCard` | US-1.1-FE | Done | [../../app/page.tsx](../../app/page.tsx), [../../components/sections](../../components/sections) |
| FE-TASK-08 | Category browse RSC + `ToolGrid`, `ToolCard`, `SortControls`, pagination | US-1.2-FE | Done | [../../app/equipment](../../app/equipment), [../../components/equipment](../../components/equipment) |
| FE-TASK-09 | Tool detail RSC + `ToolGallery`, `RateTable` | US-1.3-FE | Done | [../../app/equipment](../../app/equipment) |
| FE-TASK-10 | `loading.tsx` + `error.tsx` for catalogue routes | US-1.9-FE | Done | per-route files |
| FE-TASK-11 | Jest + RTL configuration in [../../jest.config.mjs](../../jest.config.mjs) and [../../jest.setup.ts](../../jest.setup.ts) | US-1.9-FE | Done | Jest config files |
| FE-TASK-12 | GitHub Actions workflow: lint, test, build on every push | US-1.9-FE | Done | `.github/workflows/` |

## Sprint 2 — Search, Calculator, Auth

| Task ID | Description | Story | Status | Evidence |
|---------|-------------|-------|--------|----------|
| FE-TASK-13 | Header search input + `useDebounce` | US-1.4-FE | Done | [../../components/layout](../../components/layout), [../../hooks/use-debounce.ts](../../hooks/use-debounce.ts) |
| FE-TASK-14 | Search results route reusing `ToolCard` + empty state | US-1.4-FE | Done | [../../app/equipment](../../app/equipment) |
| FE-TASK-15 | `RentalCalculator` with React Hook Form + zod + day picker | US-1.5-FE | Done | [../../components/equipment](../../components/equipment) |
| FE-TASK-16 | `PriceFilter` bound to URL params | US-1.6-FE | Done | [../../components/equipment](../../components/equipment) |
| FE-TASK-17 | `/register`, `/login`, `/forgot-password`, `/reset-password` forms | US-2.6-FE, US-2.8-FE | Done | [../../app/register](../../app/register), [../../app/login](../../app/login), [../../app/forgot-password](../../app/forgot-password), [../../app/reset-password](../../app/reset-password) |
| FE-TASK-18 | `app/api/auth/(login|logout|me)/route.ts` with httpOnly cookie | US-2.6-FE | Done | [../../app/api/auth](../../app/api/auth) |
| FE-TASK-19 | `useCurrentUser` hook | US-2.6-FE | Done | [../../hooks/use-current-user.ts](../../hooks/use-current-user.ts) |
| FE-TASK-20 | `ReviewForm` + `StarInput` + zod schema | US-2.1-FE | Done | [../../components/feed](../../components/feed) |
| FE-TASK-21 | `ReviewList`, `ReviewItem`, `StarRating` | US-2.2-FE | Done | [../../components/feed](../../components/feed) |
| FE-TASK-22 | "Not enough reviews" branch on `ToolCard` and detail page | US-2.3-FE | Done | [../../components/equipment](../../components/equipment) |
| FE-TASK-23 | ProblemDetails → React Hook Form field error helper | US-2.1-FE | Done | [../../lib/api-client.ts](../../lib/api-client.ts) |

## Sprint 3 — Account, Community, Admin Foundations

| Task ID | Description | Story | Status | Evidence |
|---------|-------------|-------|--------|----------|
| FE-TASK-24 | `CommentForm`, `CommentList` | US-2.4-FE | Done | [../../components/feed](../../components/feed) |
| FE-TASK-25 | `CompanyResponseForm`, `CompanyResponseBlock` with role gating | US-2.5-FE | Done | [../../components/feed](../../components/feed) |
| FE-TASK-26 | `/account/reviews` + `MyReviewsList` with status badges | US-2.7-FE | Done | [../../app/account](../../app/account), [../../components/account](../../components/account) |
| FE-TASK-27 | `lib/admin-guard.ts` + `app/admin/layout.tsx` + `AdminShell` | US-3.1-FE | Done | [../../lib/admin-guard.ts](../../lib/admin-guard.ts), [../../components/admin](../../components/admin) |
| FE-TASK-28 | `AdminToolForm` create mode + multipart submit | US-3.2-FE | Done | [../../components/admin](../../components/admin) |
| FE-TASK-29 | `AdminToolForm` edit mode | US-3.3-FE | Done | same component, edit branch |
| FE-TASK-30 | Admin tool list (RSC) + filters | US-3.2-FE | Done | [../../app/admin](../../app/admin) |

## Sprint 4 — Moderation, Media, Dashboard, Polish

| Task ID | Description | Story | Status | Evidence |
|---------|-------------|-------|--------|----------|
| FE-TASK-31 | `AdminImageManager` with last-image guard and drag reorder | US-3.4-FE | Done | [../../components/admin](../../components/admin) |
| FE-TASK-32 | `AdminToolStatusToggle` | US-3.5-FE | Done | [../../components/admin](../../components/admin) |
| FE-TASK-33 | `AdminModerationQueue` + `RejectionReasonDialog` with optimistic update | US-3.6-FE | Done | [../../components/admin](../../components/admin) |
| FE-TASK-34 | `AdminCategoriesTable`, `AdminCategoryForm` with 409 surfacing | US-3.7-FE | Done | [../../components/admin](../../components/admin) |
| FE-TASK-35 | `AdminDashboardCards` + `AdminDashboardCharts` (Recharts) | US-3.8-FE | Done | [../../components/admin](../../components/admin) |
| FE-TASK-36 | Admin `loading.tsx` + `error.tsx` for every admin route | US-3.9-FE | Done | per-route files |
| FE-TASK-37 | Responsive audit at 375/768/1280/1920px | US-1.7-FE | Done | Tailwind responsive utilities |
| FE-TASK-38 | Toast wiring with `sonner` in root layout | NFR-FE-21 | Done | [../../app/layout.tsx](../../app/layout.tsx) |
| FE-TASK-39 | `next.config.ts` headers (CSP / HSTS / X-Frame-Options / etc.) | NFR-FE-13 | In Progress | [../../next.config.ts](../../next.config.ts) — final CSP pending |
| FE-TASK-40 | Lighthouse + axe-core evidence capture | NFR-FE-01..05, NFR-FE-22 | Open | Pending; see [../GAP-ANALYSIS.md](../GAP-ANALYSIS.md) |
| FE-TASK-41 | Playwright suite for the three critical journeys | TEST plan §5.1 | Open | Pending; see [../TESTING-STRATEGY.md](../TESTING-STRATEGY.md) |
| FE-TASK-42 | `npm audit --production` review documented | NFR-FE-15 | Open | Pending; see [../security/](../security/) |
| FE-TASK-43 | CI publishes Jest coverage artefact | NFR-FE-41 | Open | Pending |

---

## Status Roll-Up

| Sprint | Tasks Done | Tasks In Progress | Tasks Open |
|--------|------------|-------------------|------------|
| 1 | 12 | 0 | 0 |
| 2 | 11 | 0 | 0 |
| 3 | 7 | 0 | 0 |
| 4 | 6 | 1 | 4 |

The four open and one in-progress task in Sprint 4 are evidence-capture items, not functional gaps. See [../GAP-ANALYSIS.md](../GAP-ANALYSIS.md) for the full list of remaining items before final sign-off.
