# Gap Analysis — Shelton Tool-Hire Review Portal (Web Client)

> Backend counterpart: [../../ReviewPortal-API/docs/GAP-ANALYSIS.md](../../ReviewPortal-API/docs/GAP-ANALYSIS.md).
>
> Purpose: map every brief requirement and frontend acceptance criterion to the implementing route/component and record any remaining gap before submission.

---

## 1. Method

For each brief requirement (R-series), the matching backlog story (US-x.y), the implementing route/component, and the verification evidence are listed. A row is "Implemented" only if all of the following are true:

- The route renders end-to-end against the live API.
- The acceptance criteria from the agile epic doc are satisfied.
- Jest tests cover the form/validation paths or a manual evidence note is attached.

---

## 2. Requirements Traceability Matrix

### 2.1 Catalogue & Calculator (Epic 1)

| Brief Ref | Backlog Story | UI Requirement | Implementing Route / Component | Status | Notes |
|-----------|---------------|----------------|--------------------------------|--------|-------|
| R2 — Homepage categories | US-1.1 | FE-01, FE-02 | [app/page.tsx](../app/page.tsx) + `FeaturedCategories` | Implemented | Uses `GET /api/categories/featured` |
| R2 — Category browse | US-1.2 | FE-03, FE-08, FE-10 | [app/equipment/[categoryId]/page.tsx](../app/equipment/) + `ToolGrid`, `ToolCard` | Implemented | Pagination via URL params |
| R2 — Sorting | US-1.2 | FE-04 | `SortControls` | Implemented | Bound to `sortBy`, `sortOrder` |
| R2 — Filtering | US-1.6 | FE-09 | `PriceFilter` | Implemented | Bound to `minPrice`, `maxPrice` |
| R3 / R24 — Search | US-1.4 | FE-06, FE-07 | `SiteHeader` search input + search results page | Implemented | Debounced 300ms via `useDebounce` |
| R5 — Tool detail | US-1.3 | FE-05 | [app/equipment/[categoryId]/[toolId]/page.tsx](../app/equipment/) + `ToolGallery`, `RateTable` | Implemented | |
| R6 — Calculator inputs | US-1.5 | FE-11, FE-14, FE-15 | `RentalCalculator` | Implemented | `react-day-picker` + time control |
| R7 — Cheapest combination | US-1.5 | FE-12, FE-13 | `RentalCalculator` | Implemented | Backend returns the breakdown |

### 2.2 Reviews, Comments, Responses, Account (Epic 2)

| Brief Ref | Backlog Story | UI Requirement | Implementing Route / Component | Status | Notes |
|-----------|---------------|----------------|--------------------------------|--------|-------|
| R4 — Register | US-2.7 | FE-27 | [app/register/page.tsx](../app/register/) | Implemented | zod schema mirrors backend |
| R4 — Login | US-2.7 | FE-28 | [app/login/page.tsx](../app/login/) + [app/api/auth/login/route.ts](../app/api/auth/login/) | Implemented | httpOnly cookie |
| R4 — Submit review | US-2.1 | FE-16 to FE-19 | `ReviewForm` + tool detail route | Implemented | "Awaiting moderation" toast |
| R4 — My reviews | US-2.8 | FE-29 | [app/account/reviews/page.tsx](../app/account/reviews/) + `MyReviewsList` | Implemented | Shows status + rejection reason |
| R13–R17 — Five rating categories | US-2.1 | FE-17, FE-18 | `StarInput` × 5 in `ReviewForm` | Implemented | Required by zod schema |
| R18 — Comments | US-2.4 | FE-23, FE-24 | `CommentForm`, `CommentList` | Implemented | |
| R19 — Company response | US-2.5 | FE-25, FE-26 | `CompanyResponseForm`, `CompanyResponseBlock` | Implemented | Visible only when user has `Admin` / `Moderator` role |
| R25 — Overall rating display | US-2.3 | FE-21, FE-22 | `StarRating` on cards and detail | Implemented | "Not enough reviews to rate" branch present |
| R26 — Pending visibility rules | US-2.1, US-2.4 | FE-19, FE-24 | Review feed renders only approved items | Implemented | Backend filters; UI never displays pending content |

### 2.3 Back-Office & Moderation (Epic 3)

| Brief Ref | Backlog Story | UI Requirement | Implementing Route / Component | Status | Notes |
|-----------|---------------|----------------|--------------------------------|--------|-------|
| R8 — Admin login + role enforcement | US-3.1 | FE-32, FE-33 | [lib/admin-guard.ts](../lib/admin-guard.ts) + [app/admin/layout.tsx](../app/admin/) + `AdminShell` | Implemented | Server-side guard runs before render |
| R8 — Add equipment | US-3.2 | FE-34 | `AdminToolForm` + [app/admin/tools/new/page.tsx](../app/admin/) | Implemented | Multipart submit with first image |
| R9 — Edit equipment | US-3.3 | FE-35 | `AdminToolForm` (edit mode) | Implemented | Field-level error mapping |
| R10 — Manage images | US-3.4 | FE-36 | `AdminImageManager` | Implemented | Blocks deleting the last image |
| R8 — Activate/deactivate | US-3.5 | FE-37 | `AdminToolStatusToggle` | Implemented | PATCH status |
| R2 — Manage categories | US-3.7 | FE-40 | `AdminCategoriesTable`, `AdminCategoryForm` | Implemented | Surfaces 409 on delete-with-tools |
| R11 — Moderation queue | US-3.6 | FE-38 | `AdminModerationQueue` + [app/admin/moderation/page.tsx](../app/admin/) | Implemented | Optimistic update + reconcile |
| R11 — Rejection reason | US-3.6 | FE-39 | `RejectionReasonDialog` | Implemented | 1–500 char schema |
| R8 — Dashboard | US-3.8 | FE-41 | `AdminDashboardCards`, `AdminDashboardCharts` | Implemented | Recharts visualisations |

### 2.4 Cross-Cutting

| Concern | UI Requirement | Implementing Module | Status |
|---------|----------------|---------------------|--------|
| ProblemDetails handling | FE-43 | `lib/api-client.ts` + form helper | Implemented |
| Backend proxy | FE-44 | `app/api/backend/[...path]/route.ts` | Implemented |
| Loading / error / empty states | FE-45 | Per-route `loading.tsx` / `error.tsx` | Implemented |
| Keyboard accessibility | FE-46, NFR-FE-24 | Radix primitives throughout | Implemented |
| Responsive layout | FE-47, NFR-FE-16 | Tailwind responsive utilities | Implemented |

---

## 3. Remaining Gaps

| ID | Gap | Severity | Owner | Action |
|----|-----|----------|-------|--------|
| GAP-FE-01 | Lighthouse CI report not yet captured for submission | Low | QA | Run Lighthouse on production build and attach to submission pack |
| GAP-FE-02 | Axe-core accessibility scan not yet captured per route | Low | QA | Add axe scan script and store JSON output per top-level route |
| GAP-FE-03 | Playwright E2E suite covers only the smoke flows | Medium | Dev | Add the three critical journeys from [TESTING-STRATEGY.md](TESTING-STRATEGY.md) |
| GAP-FE-04 | Security headers (`headers()` in `next.config.ts`) need final values agreed with backend security | Medium | Dev | Confirm CSP report-only first, then enforce |
| GAP-FE-05 | `npm audit` review not documented | Low | Dev | Record remaining advisories and disposition in [security/](security/) |
| GAP-FE-06 | Coverage reporting not published from CI | Low | Dev | Add `--coverage` to `test:ci` and publish artefact |

---

## 4. Completion Gate

| Gate | Status |
|------|--------|
| Functional UI coverage | Implemented for all Must/Should requirements |
| Build + lint + Jest | Passing |
| Lighthouse | Pending capture (GAP-FE-01) |
| Accessibility scan | Pending capture (GAP-FE-02) |
| E2E suite | Smoke only — full set pending (GAP-FE-03) |
| Security headers | Default `next.config.ts` headers in place; review pending (GAP-FE-04) |
| npm audit | Pending documentation (GAP-FE-05) |

---

## 5. Backend Dependency Watch

The frontend is correct only while the API contract matches [types/api.ts](../types/api.ts). The matrix below records the API endpoints the client depends on so a backend change that breaks them is caught early.

| Frontend touchpoint | Backend endpoint | Verified against API doc |
|---------------------|------------------|--------------------------|
| Featured categories | `GET /api/categories/featured` | [API IMPLEMENTATION-SEQUENCE.md](../../ReviewPortal-API/docs/agile/IMPLEMENTATION-SEQUENCE.md) |
| Category tools | `GET /api/categories/{id}/tools?...` | same |
| Tool detail | `GET /api/tools/{id}` | same |
| Search | `GET /api/tools/search?q=...` | same |
| Rental calculation | `POST /api/tools/{id}/rental-calculation` | same |
| Reviews | `GET/POST /api/tools/{toolId}/reviews` | same |
| Comments | `GET/POST /api/reviews/{reviewId}/comments` | same |
| Company response | `POST/PUT/DELETE /api/reviews/{reviewId}/response` | same |
| Auth | `POST /api/auth/(register\|login)`, `GET /api/auth/me`, `POST /api/auth/(change\|forgot\|reset)-password` | same |
| My reviews | `GET /api/users/me/reviews` | same |
| Admin tools | `GET/POST/PUT/PATCH /api/admin/tools[/{id}/status]` | same |
| Admin images | `POST/DELETE /api/admin/tools/{id}/images[/{imageId}]` | same |
| Admin categories | `POST/PUT/DELETE /api/admin/categories[/{id}]` | same |
| Admin moderation | `GET /api/admin/moderation/pending`, `PUT /api/admin/moderation/(reviews\|comments)/{id}` | same |
| Admin dashboard | `GET /api/admin/dashboard/stats` | same |

When any of these endpoints change shape, update the matching DTO in [types/api.ts](../types/api.ts) and the form schema in this repository in the same PR.
