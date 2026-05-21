# Epic 2 — Reviews, Ratings & Account (Web Client)

> Backend counterpart: [../../../ReviewPortal-API/docs/agile/EPIC-2-REVIEWS-AND-RATINGS.md](../../../ReviewPortal-API/docs/agile/EPIC-2-REVIEWS-AND-RATINGS.md).

**Epic statement** — As a customer, I want to register, log in, submit reviews with five rating categories, comment on existing reviews, and track my own review history.

---

## User Stories (Frontend-Owned)

### US-2.1-FE — Submit a review for a tool/service

**As a** customer, **I want** to write a review for a tool I have hired, **so that** I can share my experience.

**Acceptance Criteria**
- "Write a review" CTA on the tool detail page opens a `ReviewForm` dialog (Radix Dialog).
- The form requires five star ratings, ≥ 20-character text, and (for guests) name + email.
- A zod schema enforces all rules; inline errors are rendered per field.
- On submit, POST to `/api/backend/tools/{toolId}/reviews`. On 201, close the dialog and show a "Pending moderation" toast.
- On 400, map `ProblemDetails.errors` to React Hook Form field errors.

**Story Points:** 5 · **Priority:** Must · **Sprint:** 2

**Tasks**
| # | Task |
|---|------|
| 1 | `ReviewForm` + `StarInput` components |
| 2 | zod schema mirroring backend `CreateReviewRequestValidator` |
| 3 | Submit handler that uses `lib/api-client.ts` |
| 4 | Toast on success; field error mapping on 400 |
| 5 | Jest tests covering schema and `ProblemDetails` mapping |

---

### US-2.2-FE — Display approved reviews on the tool page

**As a** prospective customer, **I want** to read approved reviews on the tool page, **so that** I can make an informed choice.

**Acceptance Criteria**
- `ReviewList` renders approved reviews newest first.
- Each review shows reviewer name (sanitised), star breakdown, average, and creation date.
- Reviews from the current user have a "yours" badge when applicable.

**Story Points:** 3 · **Priority:** Must · **Sprint:** 2

**Tasks**
| # | Task |
|---|------|
| 1 | `ReviewList` + `ReviewItem` components |
| 2 | `StarRating` read-only display |
| 3 | Date formatting via `date-fns` |
| 4 | Jest tests for sort order and "yours" branch |

---

### US-2.3-FE — Overall rating display

**As a** customer, **I want** to see overall ratings on cards and detail pages, **so that** I can compare tools at a glance.

**Acceptance Criteria**
- `ToolCard` shows the cached overall rating and review count.
- Detail page shows the same numbers.
- Tools with fewer than 2 approved reviews render "Not enough reviews to rate" instead of a number.
- Catalogue sort by rating is supported via URL `sortBy=rating`.

**Story Points:** 3 · **Priority:** Must · **Sprint:** 2

**Tasks**
| # | Task |
|---|------|
| 1 | `StarRating` summary in `ToolCard` |
| 2 | "Not enough reviews" branch keyed off `hasEnoughReviews` |
| 3 | `SortControls` `rating` option |
| 4 | Jest tests for the "not enough" branch |

---

### US-2.4-FE — Comment on an approved review

**As a** customer, **I want** to comment on an existing review, **so that** I can add context or ask a question.

**Acceptance Criteria**
- Comment form requires name and ≥ 10 character text.
- On submit, POST to `/api/backend/reviews/{reviewId}/comments`; show a "Pending moderation" toast.
- Approved comments render under the review newest first.

**Story Points:** 3 · **Priority:** Must · **Sprint:** 3

**Tasks**
| # | Task |
|---|------|
| 1 | `CommentForm` + `CommentList` |
| 2 | zod schema mirroring backend |
| 3 | Toast + inline error handling |
| 4 | Jest tests |

---

### US-2.5-FE — Company response to a review

**As a** staff user, **I want** to post an official response to an approved review, **so that** customers see a clear response from Shelton.

**Acceptance Criteria**
- The response form is only rendered for users with role `Admin` or `Moderator`.
- Only approved reviews without an existing response show the form.
- Posted responses appear immediately and are visually distinct from customer content.
- Staff can edit or delete their response.

**Story Points:** 5 · **Priority:** Must · **Sprint:** 3

**Tasks**
| # | Task |
|---|------|
| 1 | `CompanyResponseForm` + `CompanyResponseBlock` |
| 2 | Role gating via `useCurrentUser` |
| 3 | Edit / delete affordances calling `PUT` / `DELETE` |
| 4 | Jest tests for the role-gated render |

---

### US-2.6-FE — Account registration and login

**As a** returning customer, **I want** to register an account and log in, **so that** I can track my reviews.

**Acceptance Criteria**
- `/register` and `/login` forms use zod schemas mirroring the backend.
- Login sets the httpOnly `rp.auth` cookie via the Next.js route handler.
- `useCurrentUser` hydrates from `/api/auth/me`.
- Failed login shows a generic error.

**Story Points:** 8 · **Priority:** Must · **Sprint:** 2

**Tasks**
| # | Task |
|---|------|
| 1 | `/login`, `/register` pages and forms |
| 2 | `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/me/route.ts` |
| 3 | `useCurrentUser` hook |
| 4 | Integration tests for the route handlers covering 200/401 |

---

### US-2.7-FE — My reviews page

**As a** registered user, **I want** to view all my submitted reviews and their statuses, **so that** I can track moderation.

**Acceptance Criteria**
- `/account/reviews` renders the signed-in user's reviews with status badges and rejection reason where present.
- Sortable by creation date.
- Empty state with CTA to browse the catalogue.

**Story Points:** 3 · **Priority:** Should · **Sprint:** 3

**Tasks**
| # | Task |
|---|------|
| 1 | RSC page calling `GET /api/users/me/reviews` |
| 2 | `MyReviewsList` table with status `Badge` variants |
| 3 | Empty state component |

---

### US-2.8-FE — Password reset flow

**As a** registered user who forgot my password, **I want** to request and complete a reset, **so that** I can sign back in.

**Acceptance Criteria**
- `/forgot-password` accepts email and submits to the backend.
- `/reset-password?token=...` accepts the new password and confirmation.
- Success and error toasts are surfaced.

**Story Points:** 3 · **Priority:** Should · **Sprint:** 3

---

## Implementation Status

Updated: 2026-05-21

| Story | Status | Evidence |
|-------|--------|----------|
| US-2.1-FE | Implemented | `ReviewForm` + tests |
| US-2.2-FE | Implemented | `ReviewList`, `ReviewItem`, `StarRating` |
| US-2.3-FE | Implemented | Conditional rendering in `ToolCard` + tests |
| US-2.4-FE | Implemented | `CommentForm`, `CommentList` |
| US-2.5-FE | Implemented | `CompanyResponseForm`, `CompanyResponseBlock` |
| US-2.6-FE | Implemented | Auth routes + `useCurrentUser` |
| US-2.7-FE | Implemented | `/account/reviews` + `MyReviewsList` |
| US-2.8-FE | Implemented | `/forgot-password`, `/reset-password` |

## Summary for Sprint Planning

| Sprint | Stories | Total Points |
|--------|---------|--------------|
| Sprint 2 | US-2.1-FE, US-2.2-FE, US-2.3-FE, US-2.6-FE | 19 |
| Sprint 3 | US-2.4-FE, US-2.5-FE, US-2.7-FE, US-2.8-FE | 14 |
