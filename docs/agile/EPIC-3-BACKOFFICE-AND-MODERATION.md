# Epic 3 — Back-Office & Moderation (Web Client)

> Backend counterpart: [../../../ReviewPortal-API/docs/agile/EPIC-3-BACKOFFICE-AND-MODERATION.md](../../../ReviewPortal-API/docs/agile/EPIC-3-BACKOFFICE-AND-MODERATION.md).

**Epic statement** — As Shelton staff (Admin / Moderator), I want a secure back-office that lets me manage the catalogue, moderate customer content, and see operational statistics.

---

## User Stories (Frontend-Owned)

### US-3.1-FE — Admin login and route guard

**As a** staff user, **I want** the back-office to refuse access to anyone without the right role, **so that** customer data is protected.

**Acceptance Criteria**
- `/admin/*` is rendered only when [lib/admin-guard.ts](../../lib/admin-guard.ts) confirms the user has role `Admin` or `Moderator`.
- Anonymous users are redirected to `/login?next=/admin`.
- Customers receive a 403-style redirect to `/`.
- The admin shell is visually distinct from the public site (sidebar, dense layout).

**Story Points:** 5 · **Priority:** Must · **Sprint:** 3

**Tasks**
| # | Task |
|---|------|
| 1 | `lib/admin-guard.ts` calls `/api/auth/me` server-side |
| 2 | `app/admin/layout.tsx` runs the guard and renders `AdminShell` |
| 3 | Jest tests for the redirect paths |

---

### US-3.2-FE — Add a new tool/service

**As an** Admin, **I want** to add a new tool with name, description, category, rates, and at least one image, **so that** it appears in the catalogue.

**Acceptance Criteria**
- `AdminToolForm` accepts every required field plus a single image upload.
- Submits a multipart request to `POST /api/admin/tools`.
- API validation errors (rates ≤ 0, missing image, unsupported MIME) surface inline.
- On 201, redirect to the new tool's edit page with a success toast.

**Story Points:** 8 · **Priority:** Must · **Sprint:** 3

**Tasks**
| # | Task |
|---|------|
| 1 | `AdminToolForm` (create + edit mode) |
| 2 | File input with client-side MIME + size check |
| 3 | Multipart submission helper in `lib/api-client.ts` |
| 4 | Inline error mapping for `errors.<field>` |
| 5 | Jest tests for the schema and MIME check |

---

### US-3.3-FE — Edit tool details and pricing

**As an** Admin, **I want** to update an existing tool's details and rates, **so that** the catalogue stays accurate.

**Acceptance Criteria**
- `AdminToolForm` in edit mode pre-fills from `GET /api/admin/tools/{id}`.
- Submit calls `PUT /api/admin/tools/{id}` and surfaces field errors inline.

**Story Points:** 3 · **Priority:** Must · **Sprint:** 3

---

### US-3.4-FE — Manage tool images

**As an** Admin, **I want** to add, reorder, and delete images, **so that** customers see accurate pictures.

**Acceptance Criteria**
- `AdminImageManager` lets staff upload new images, drag to reorder, and delete.
- Deleting the last remaining image is blocked in the UI (the API also enforces this).
- Reorder PATCHes the affected images' `displayOrder`.

**Story Points:** 5 · **Priority:** Must · **Sprint:** 4

**Tasks**
| # | Task |
|---|------|
| 1 | `AdminImageManager` component with drag handles |
| 2 | "Cannot delete last image" guard in the UI |
| 3 | API calls for upload/delete/reorder |
| 4 | Jest test for the guard branch |

---

### US-3.5-FE — Activate or deactivate a tool

**As an** Admin, **I want** to toggle a tool's active state, **so that** out-of-service items are hidden without losing review history.

**Acceptance Criteria**
- `AdminToolStatusToggle` calls `PATCH /api/admin/tools/{id}/status`.
- The status badge updates without a full reload.
- Deactivated tools immediately disappear from the public catalogue.

**Story Points:** 3 · **Priority:** Must · **Sprint:** 4

---

### US-3.6-FE — Moderation queue

**As a** Moderator, **I want** a single queue of pending reviews and comments, **so that** I can decide quickly.

**Acceptance Criteria**
- `/admin/moderation` renders the queue from `GET /api/admin/moderation/pending`, oldest first.
- Each row shows the body, source, reviewer/commenter name, and created date.
- Approve and Reject controls call `PUT /api/admin/moderation/(reviews|comments)/{id}`.
- Rejection requires a reason captured in `RejectionReasonDialog` (1–500 chars).
- Optimistic update reconciles with the server response; failures roll back and toast an error.

**Story Points:** 8 · **Priority:** Must · **Sprint:** 4

**Tasks**
| # | Task |
|---|------|
| 1 | `AdminModerationQueue` component |
| 2 | `RejectionReasonDialog` with zod schema |
| 3 | Optimistic store and reconcile logic |
| 4 | Jest tests for approve / reject paths |

---

### US-3.7-FE — Category management

**As an** Admin, **I want** to add, rename, and delete categories, **so that** the catalogue stays organised.

**Acceptance Criteria**
- `AdminCategoriesTable` lists categories.
- `AdminCategoryForm` creates and renames.
- Delete shows a confirmation and surfaces the API's 409 (category not empty) inline.

**Story Points:** 3 · **Priority:** Should · **Sprint:** 4

---

### US-3.8-FE — Admin dashboard

**As an** Admin, **I want** a dashboard summary, **so that** I can see operational health at a glance.

**Acceptance Criteria**
- `/admin/dashboard` consumes `GET /api/admin/dashboard/stats`.
- Renders cards for active/inactive tools, pending reviews/comments, reviews this month.
- Two Recharts visualisations: top-rated tools and most-reviewed tools.

**Story Points:** 5 · **Priority:** Could · **Sprint:** 4

---

### US-3.9-FE — Error and loading discipline for admin routes

*[Technical]* **As a** staff user, **I want** every admin route to show clear loading and error UI, **so that** I never see a blank back-office page.

**Acceptance Criteria**
- Each admin route has `loading.tsx` and `error.tsx`.
- Errors include a retry CTA.
- The shell remains visible during route transitions.

**Story Points:** 3 · **Priority:** Should · **Sprint:** 4

---

## Implementation Status

Updated: 2026-05-21

| Story | Status | Evidence |
|-------|--------|----------|
| US-3.1-FE | Implemented | `lib/admin-guard.ts`, `AdminShell`, Jest tests |
| US-3.2-FE | Implemented | `AdminToolForm` create mode |
| US-3.3-FE | Implemented | `AdminToolForm` edit mode |
| US-3.4-FE | Implemented | `AdminImageManager` |
| US-3.5-FE | Implemented | `AdminToolStatusToggle` |
| US-3.6-FE | Implemented | `AdminModerationQueue`, `RejectionReasonDialog` |
| US-3.7-FE | Implemented | `AdminCategoriesTable`, `AdminCategoryForm` |
| US-3.8-FE | Implemented | `AdminDashboardCards`, `AdminDashboardCharts` |
| US-3.9-FE | Implemented | Per-admin-route `loading.tsx` and `error.tsx` |

## Summary for Sprint Planning

| Sprint | Stories | Total Points |
|--------|---------|--------------|
| Sprint 3 | US-3.1-FE, US-3.2-FE, US-3.3-FE | 16 |
| Sprint 4 | US-3.4-FE, US-3.5-FE, US-3.6-FE, US-3.7-FE, US-3.8-FE, US-3.9-FE | 27 |
