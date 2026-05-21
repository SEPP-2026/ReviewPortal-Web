# Implementation Sequence — Web Client

> Last updated: 2026-05-21
> Backend counterpart: [../../../ReviewPortal-API/docs/agile/IMPLEMENTATION-SEQUENCE.md](../../../ReviewPortal-API/docs/agile/IMPLEMENTATION-SEQUENCE.md).
>
> Scope: remaining frontend work for Epic 1, Epic 2, Epic 3, CI readiness, deployment readiness, and submission evidence.

## Goal

Use this file as the ordered frontend runbook before moving Jira items to Done.

It answers:

- which Jira epic items already have a working UI
- which frontend tasks are still missing
- which task to run next
- what to verify locally and on the deployed host
- which API endpoints the UI calls

## Current Frontend Status by Jira Epic

### Epic 1 — Catalogue & Calculator

| Jira item | UI status | Remaining frontend task |
|-----------|-----------|-------------------------|
| MP-3 Homepage with featured categories | Done — `app/page.tsx` + `FeaturedCategories` | — |
| MP-10 Category browsing | Done — `app/equipment/[categoryId]/page.tsx` | — |
| MP-13 Search | Done — header search + results route | — |
| MP-15 Filter by price | Done — `PriceFilter` | — |
| MP-11 Tool detail | Done — detail route + `ToolGallery` + `RateTable` | — |
| MP-14 Rental calculator | Done — `RentalCalculator` | — |

### Epic 2 — Reviews, Ratings & Account

| Jira item | UI status | Remaining frontend task |
|-----------|-----------|-------------------------|
| MP-24 Register / login | Done — `/login`, `/register`, route handlers | — |
| MP-18 Submit a review | Done — `ReviewForm` | — |
| MP-19 Display approved reviews | Done — `ReviewList` | — |
| MP-20 Overall rating | Done — `StarRating` + "not enough reviews" branch | — |
| MP-21 Comment on a review | Done — `CommentForm`, `CommentList` | — |
| MP-23 Company response | Done — staff-gated `CompanyResponseForm` | — |
| MP-25 My Reviews | Done — `/account/reviews` | — |

### Epic 3 — Back-Office & Moderation

| Jira item | UI status | Remaining frontend task |
|-----------|-----------|-------------------------|
| MP-26 Admin login / role gating | Done — `lib/admin-guard.ts` + `AdminShell` | — |
| MP-31 Moderation queue | Done — `AdminModerationQueue` | — |
| MP-72 Approve / Reject | Done — incl. `RejectionReasonDialog` | — |
| MP-27 Add equipment | Done — `AdminToolForm` create mode + multipart | — |
| MP-28 Edit equipment | Done — `AdminToolForm` edit mode | — |
| MP-29 Manage images | Done — `AdminImageManager` with last-image guard | — |
| MP-30 Activate / deactivate | Done — `AdminToolStatusToggle` | — |
| MP-32 Manage categories | Done — `AdminCategoriesTable`, `AdminCategoryForm` | — |
| MP-33 Dashboard | Done — `AdminDashboardCards`, `AdminDashboardCharts` | — |

## Still Open Frontend Tasks

Run these in order unless scope changes.

1. **Capture evidence:** Lighthouse + axe-core JSON for the homepage, a category page, and the tool detail page (gaps GAP-FE-01 and GAP-FE-02 from [../GAP-ANALYSIS.md](../GAP-ANALYSIS.md)).
2. **Promote E2E suite:** expand smoke flows into the three critical journeys in Playwright (GAP-FE-03).
3. **Lock in security headers:** finalise the CSP / HSTS / X-Frame-Options values in [next.config.ts](../../next.config.ts) (GAP-FE-04).
4. **Document `npm audit`:** record any remaining advisories and their disposition under [../security/](../security/) (GAP-FE-05).
5. **Publish coverage from CI:** add `--coverage` to `npm run test:ci` and upload the artefact (GAP-FE-06).
6. **Smoke deploy:** run the [../DEPLOYMENT.md §6](../DEPLOYMENT.md#6-post-deploy-smoke-checklist) checklist against the production host.

## Recommended One-By-One Run Sequence

### Step 1 — Lock evidence

- Run a production build (`npm run build && npm run start`).
- Run Lighthouse against `/`, a category page, and a tool detail page; save reports.
- Run axe via @axe-core/playwright on the same routes; save JSON.

### Step 2 — Expand E2E

- Implement the three Playwright journeys in `tests/e2e/`.
- Add a workflow that runs them against a freshly built production server.

### Step 3 — Security finalisation

- Configure `headers()` in [next.config.ts](../../next.config.ts) with the agreed CSP / HSTS / X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy.
- Run `npm audit --production` and record findings under `../security/`.

### Step 4 — Deployment dry run

- Provision the host per [../DEPLOYMENT.md](../DEPLOYMENT.md).
- Run the smoke checklist and attach screenshots to the submission pack.

## API Routes the Frontend Calls

The frontend never imports API source — it consumes the routes documented in the backend's [IMPLEMENTATION-SEQUENCE.md](../../../ReviewPortal-API/docs/agile/IMPLEMENTATION-SEQUENCE.md). The dependency table in [../GAP-ANALYSIS.md §5](../GAP-ANALYSIS.md#5-backend-dependency-watch) lists every endpoint and its consumer.

Public catalogue:

- `GET /api/categories`, `GET /api/categories/featured`
- `GET /api/categories/{id}/tools?page=&pageSize=&sortBy=&sortOrder=&minPrice=&maxPrice=`
- `GET /api/tools/search?q=&page=&pageSize=`
- `GET /api/tools/{id}`
- `POST /api/tools/{id}/rental-calculation`

Auth and user:

- `POST /api/auth/(register|login)`
- `GET /api/auth/me`
- `POST /api/auth/(change|forgot|reset)-password`
- `GET /api/users/me/reviews`

Reviews and community:

- `POST /api/tools/{toolId}/reviews`, `GET /api/tools/{toolId}/reviews`
- `POST /api/reviews/{reviewId}/comments`, `GET /api/reviews/{reviewId}/comments`
- `POST/PUT/DELETE /api/reviews/{reviewId}/response`

Admin:

- `GET /api/admin/tools`, `GET /api/admin/tools/{id}`
- `POST /api/admin/tools` (multipart with first image), `PUT /api/admin/tools/{id}`, `PATCH /api/admin/tools/{id}/status`
- `POST /api/admin/tools/{id}/images`, `DELETE /api/admin/tools/{id}/images/{imageId}`
- `POST /api/admin/categories`, `PUT /api/admin/categories/{id}`, `DELETE /api/admin/categories/{id}`
- `GET /api/admin/moderation/pending`, `PUT /api/admin/moderation/(reviews|comments)/{id}`
- `GET /api/admin/dashboard/stats`

## Command Checklist After Every Frontend Task

1. `npm run lint`
2. `npm run test:ci`
3. `npm run build`
4. If a page or admin flow changed, run the relevant manual smoke check from [../TEST-PLAN.md §5](../TEST-PLAN.md#5-black-box-test-plan).
5. If a DTO consumer changed, confirm the matching type exists in [../../types/api.ts](../../types/api.ts).

## Definition of Done for Frontend Jira Items

A frontend Jira item can be moved to Done when:

- The implementing route/component exists and is reachable from the navigation.
- Forms use React Hook Form + zod and mirror the backend validator rules.
- Jest tests cover the new render branches and validation paths.
- Loading and error UI exist for the route.
- The API contract is recorded in [../../types/api.ts](../../types/api.ts).
- Manual smoke from [../TEST-PLAN.md](../TEST-PLAN.md) passes against the configured API.
- No new ESLint errors and no `any` introduced outside justified boundaries.

## Related Files

- [IMPLEMENTATION-TASKS.md](./IMPLEMENTATION-TASKS.md)
- [EPIC-1-CATALOGUE-AND-CALCULATOR.md](./EPIC-1-CATALOGUE-AND-CALCULATOR.md)
- [EPIC-2-REVIEWS-AND-RATINGS.md](./EPIC-2-REVIEWS-AND-RATINGS.md)
- [EPIC-3-BACKOFFICE-AND-MODERATION.md](./EPIC-3-BACKOFFICE-AND-MODERATION.md)
- [../GAP-ANALYSIS.md](../GAP-ANALYSIS.md)
- [../DEPLOYMENT.md](../DEPLOYMENT.md)
- [../SUBMISSION-GAP-CHECKLIST.md](../SUBMISSION-GAP-CHECKLIST.md)
