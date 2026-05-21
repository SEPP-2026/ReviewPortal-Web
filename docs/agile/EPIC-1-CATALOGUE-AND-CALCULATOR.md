# Epic 1 — Tool/Service Catalogue & Rental Calculator (Web Client)

> Backend counterpart: [../../../ReviewPortal-API/docs/agile/EPIC-1-CATALOGUE-AND-CALCULATOR.md](../../../ReviewPortal-API/docs/agile/EPIC-1-CATALOGUE-AND-CALCULATOR.md).
>
> This document holds the frontend-owned stories and tasks for Epic 1. Backend stories live in the API repo; this epic depends on those endpoints being available.

**Epic statement** — As a customer, I want to browse Shelton's range of hire equipment, find what I need quickly, and work out exactly how much it will cost before I commit to booking.

---

## User Stories (Frontend-Owned)

### US-1.1-FE — Homepage with featured categories

**As a** first-time visitor, **I want** to see the main categories on the homepage, **so that** I can quickly find the type of equipment I am looking for.

**Acceptance Criteria**
- The homepage renders every active featured category returned by `GET /api/categories/featured` with name and image.
- Each card is a link to `/equipment/[categoryId]`.
- Largest Contentful Paint completes within 2.5s on a 10 Mbps connection.
- The grid is usable at 375px and above with no horizontal scroll.
- Alt text is set on every image and every card is reachable by keyboard.

**Story Points:** 5 · **Priority:** Must · **Sprint:** 1

**Tasks**
| # | Task |
|---|------|
| 1 | RSC fetch in [app/page.tsx](../../app/page.tsx) loads featured categories via `lib/server-api.ts` |
| 2 | `FeaturedCategories` section renders responsive cards from `components/sections/` |
| 3 | `CategoryCard` primitive in `components/equipment/` displays image + name |
| 4 | Add link prefetch on hover; verify keyboard tab order |
| 5 | Jest test for `CategoryCard` (render branches) and snapshot of `FeaturedCategories` |

---

### US-1.2-FE — Category browsing page

**As a** customer, **I want** to see all tools within a category, **so that** I can compare options.

**Acceptance Criteria**
- `/equipment/[categoryId]` renders 12 tools per page using `GET /api/categories/{id}/tools`.
- Sort controls update `sortBy` / `sortOrder` in the URL without a full reload.
- Empty state renders when the API returns zero items.
- Pagination is keyboard accessible and announces page changes.

**Story Points:** 5 · **Priority:** Must · **Sprint:** 1

**Tasks**
| # | Task |
|---|------|
| 1 | RSC fetch in the category page loads paged tools |
| 2 | `ToolGrid` + `ToolCard` from `components/equipment/` |
| 3 | `SortControls` bound to URL search params |
| 4 | Pagination component with `aria-current="page"` |
| 5 | Empty state component with CTA back to all categories |
| 6 | Jest tests for `SortControls` URL binding and `ToolCard` rendering |

---

### US-1.3-FE — Tool/service detail page

**As a** customer, **I want** to see full details including images and hire rates, **so that** I can make an informed decision.

**Acceptance Criteria**
- Detail page renders name, full description, gallery, three-tier rates, special notes, deposit info.
- Image gallery is keyboard navigable (left/right arrow).
- Calculator section is present (see US-1.5-FE).
- If the tool has approved reviews, average and count are shown; otherwise "Not enough reviews to rate" is rendered.

**Story Points:** 5 · **Priority:** Must · **Sprint:** 1

**Tasks**
| # | Task |
|---|------|
| 1 | RSC fetch for `GET /api/tools/{id}` |
| 2 | `ToolGallery` with arrow key navigation |
| 3 | `RateTable` rendering currency with `Intl.NumberFormat` |
| 4 | Show deposit chip when `depositRequired` is true |
| 5 | Embed `RentalCalculator` and review feed slots |
| 6 | Jest tests for `RateTable` formatting and gallery key handling |

---

### US-1.4-FE — Search for tools/services

**As a** customer, **I want** to type a search term and get relevant results, **so that** I do not have to browse manually.

**Acceptance Criteria**
- Search bar is present in the header on every public page.
- Typing debounces (300ms) before issuing a request via `GET /api/tools/search?q=...`.
- Results page reuses `ToolCard` and shows category alongside the tool name.
- Empty state shows "No results found — try a different term or browse our categories".
- Search is case-insensitive (backend behaviour; frontend just submits the literal query).

**Story Points:** 5 · **Priority:** Must · **Sprint:** 2

**Tasks**
| # | Task |
|---|------|
| 1 | Search input in `SiteHeader` with `useDebounce` |
| 2 | Search results route (RSC) consuming `GET /api/tools/search` |
| 3 | Empty state with link to `/equipment` |
| 4 | Mobile-friendly behaviour (modal sheet on < 640px) |
| 5 | Jest tests for `useDebounce` and the empty-results branch |

---

### US-1.5-FE — Rental cost calculator

**As a** customer, **I want** to enter the dates I need a tool for and see the total, **so that** I can budget properly.

**Acceptance Criteria**
- Calculator on the detail page accepts start and end date-time.
- On submit, POSTs to `/api/tools/{id}/rental-calculation` and renders the breakdown returned by the API.
- Breakdown lists tier × quantity × rate per line plus a final total.
- End ≤ start blocks submission with an inline error; no request is sent.
- Date-time inputs are keyboard operable and screen-reader friendly.

**Story Points:** 8 · **Priority:** Must · **Sprint:** 2

**Tasks**
| # | Task |
|---|------|
| 1 | `RentalCalculator` client component using React Hook Form + zod |
| 2 | `react-day-picker` integration with a time control |
| 3 | Render breakdown via shared `RateTable`-style component |
| 4 | Inline error region wired to React Hook Form |
| 5 | Jest tests for the schema and the end-before-start guard |

---

### US-1.6-FE — Filter by price range

**As a** budget-conscious customer, **I want** to filter by a price range, **so that** I only see tools within my budget.

**Acceptance Criteria**
- `PriceFilter` on the category page updates `minPrice` / `maxPrice` in the URL.
- Results re-fetch without a full reload.
- A "Clear" action resets the filter.

**Story Points:** 3 · **Priority:** Should · **Sprint:** 2

**Tasks**
| # | Task |
|---|------|
| 1 | `PriceFilter` component bound to URL params |
| 2 | RSC re-renders the grid on param change |
| 3 | "Clear" button removes `minPrice` / `maxPrice` from the URL |
| 4 | Jest tests for the URL binding and the clear branch |

---

### US-1.7-FE — Responsive mobile layout for catalogue

**As a** customer browsing on a phone, **I want** every catalogue page to work on a small screen, **so that** I can look things up on-site.

**Acceptance Criteria**
- All public routes are usable from 375px wide and above.
- Images stay inside their containers at 375/390/414px viewports.
- The search bar is reachable from the mobile menu.
- The primary nav opens without overlapping page content.

**Story Points:** 5 · **Priority:** Should · **Sprint:** 2

**Tasks**
| # | Task |
|---|------|
| 1 | Audit homepage, category, detail, search pages at 375/390/414px |
| 2 | Mobile-friendly `SiteHeader` and `MobileNav` (Radix Sheet) |
| 3 | Confirm touch targets meet WCAG 2.1 minimum size |
| 4 | Playwright responsive snapshot at three viewports |

---

### US-1.8-FE — Type definitions and API client wiring

*[Technical]* **As a** frontend developer, **I want** typed wrappers for catalogue endpoints, **so that** components consume DTOs safely.

**Acceptance Criteria**
- DTOs for `Category`, `ToolListItem`, `ToolDetail`, `RentalCalculation` live in [types/api.ts](../../types/api.ts).
- `lib/server-api.ts` exposes typed loaders: `getFeaturedCategories`, `getCategoryWithTools`, `getToolById`, `searchTools`, `calculateRental`.
- Errors are returned as typed `Result` shapes; 400 surfaces ProblemDetails.
- Unit tests cover the success / 400 / 500 paths via `msw`.

**Story Points:** 5 · **Priority:** Must · **Sprint:** 1

---

### US-1.9-FE — Loading and error boundaries

*[Technical]* **As a** frontend developer, **I want** every catalogue route to have loading and error UI, **so that** users never see blank pages.

**Acceptance Criteria**
- `loading.tsx` and `error.tsx` exist for each top-level route under `app/equipment/`.
- Errors include a retry CTA.
- Lighthouse "stable layout while loading" passes.

**Story Points:** 3 · **Priority:** Should · **Sprint:** 1

---

## Implementation Status

Updated: 2026-05-21

| Story | Status | Evidence |
|-------|--------|----------|
| US-1.1-FE | Implemented | `app/page.tsx`, Jest tests for `CategoryCard` |
| US-1.2-FE | Implemented | `app/equipment/[categoryId]/page.tsx`, Jest tests |
| US-1.3-FE | Implemented | `app/equipment/[categoryId]/[toolId]/page.tsx`, Jest tests |
| US-1.4-FE | Implemented | Header search + search results route, `useDebounce` tests |
| US-1.5-FE | Implemented | `RentalCalculator`, schema + guard Jest tests |
| US-1.6-FE | Implemented | `PriceFilter`, URL binding Jest test |
| US-1.7-FE | Implemented | Tailwind responsive utilities; Playwright snapshots pending |
| US-1.8-FE | Implemented | `lib/server-api.ts`, `types/api.ts`, msw-based tests |
| US-1.9-FE | Implemented | Per-route `loading.tsx` and `error.tsx` |

## Summary for Sprint Planning

| Sprint | Stories | Total Points |
|--------|---------|--------------|
| Sprint 1 | US-1.1-FE, US-1.2-FE, US-1.3-FE, US-1.8-FE, US-1.9-FE | 23 |
| Sprint 2 | US-1.4-FE, US-1.5-FE, US-1.6-FE, US-1.7-FE | 21 |
