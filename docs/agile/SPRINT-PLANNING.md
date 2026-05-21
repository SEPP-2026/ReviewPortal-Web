# Sprint Planning — Web Client

> Backend counterpart: [../../../ReviewPortal-API/docs/agile/SPRINT-PLANNING.md](../../../ReviewPortal-API/docs/agile/SPRINT-PLANNING.md).
>
> Four two-week sprints across an eight-week delivery window. Each sprint pairs a frontend slice with the matching backend slice in the API repository.

---

## Sprint Cadence

- **Length:** 2 weeks
- **Working agreement:** PRs reviewed within 24 hours, merged once Jest + lint + build pass on CI
- **Demo:** end of every sprint, against a deployed preview build
- **Retrospective:** immediately after demo

---

## Sprint 1 — Foundation (Weeks 1–2)

**Goal:** stand up the Next.js project, render the homepage and a basic catalogue, and prove the API integration end-to-end with typed DTOs.

| Stories | Points |
|---------|--------|
| US-1.1-FE Homepage with featured categories | 5 |
| US-1.2-FE Category browsing page | 5 |
| US-1.3-FE Tool/service detail page | 5 |
| US-1.8-FE Type definitions and API client wiring | 5 |
| US-1.9-FE Loading and error boundaries | 3 |

**Total:** 23 points

**Definition of Done**
- `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build` green
- Public routes render real API data
- `types/api.ts` is the only source for DTOs

---

## Sprint 2 — Search, Calculator, Auth (Weeks 3–4)

**Goal:** ship search, the rental calculator, and the customer authentication flow with a secure httpOnly cookie session.

| Stories | Points |
|---------|--------|
| US-1.4-FE Search for tools/services | 5 |
| US-1.5-FE Rental cost calculator | 8 |
| US-1.6-FE Filter by price range | 3 |
| US-1.7-FE Responsive mobile layout | 5 |
| US-2.1-FE Submit a review | 5 |
| US-2.2-FE Display approved reviews | 3 |
| US-2.3-FE Overall rating display | 3 |
| US-2.6-FE Account registration and login | 8 |

**Total:** 40 points (planned 36; +4 absorbed from carry-over)

**Definition of Done**
- Auth round trip works against a real backend
- All forms validate with zod and surface ProblemDetails inline
- Mobile audit completed at 375/390/414/768/1280px

---

## Sprint 3 — Account, Community, Admin Foundations (Weeks 5–6)

**Goal:** complete the account area, ship comments and company responses, and stand up the back-office shell with role-based guarding.

| Stories | Points |
|---------|--------|
| US-2.4-FE Comment on an approved review | 3 |
| US-2.5-FE Company response | 5 |
| US-2.7-FE My Reviews page | 3 |
| US-2.8-FE Password reset flow | 3 |
| US-3.1-FE Admin login and route guard | 5 |
| US-3.2-FE Add a new tool/service | 8 |

**Total:** 27 points

**Definition of Done**
- Customers can comment and view their own reviews
- Admins can sign in and create a tool with one image
- Customers redirected when attempting `/admin/*`

---

## Sprint 4 — Moderation, Media, Dashboard, Polish (Weeks 7–8)

**Goal:** finish admin tooling (image manager, moderation queue, categories, dashboard), capture evidence, and prepare for submission.

| Stories | Points |
|---------|--------|
| US-3.3-FE Edit tool details and pricing | 3 |
| US-3.4-FE Manage tool images | 5 |
| US-3.5-FE Activate or deactivate a tool | 3 |
| US-3.6-FE Moderation queue | 8 |
| US-3.7-FE Category management | 3 |
| US-3.8-FE Admin dashboard | 5 |
| US-3.9-FE Admin loading and error discipline | 3 |

**Total:** 30 points (planned 34, including time for evidence capture)

**Sprint 4 Evidence Tasks (parallel)**
- Lighthouse + axe-core capture (FE-TASK-40)
- Playwright critical journeys (FE-TASK-41)
- npm audit documentation (FE-TASK-42)
- CI coverage publishing (FE-TASK-43)
- Final security headers (FE-TASK-39)

**Definition of Done for submission**
- Every item in [../SUBMISSION-GAP-CHECKLIST.md](../SUBMISSION-GAP-CHECKLIST.md) is ticked or formally accepted
- A tagged release commit exists (e.g. `v1.0.0-submission`)

---

## Capacity and Risks

| Risk | Mitigation |
|------|------------|
| Backend contract drift between sprints | Match every DTO change in [../../types/api.ts](../../types/api.ts) in the same PR; the GAP matrix in [../GAP-ANALYSIS.md §5](../GAP-ANALYSIS.md#5-backend-dependency-watch) catches missing endpoints |
| Image upload regressions | Cover the multipart flow in Jest and add a Playwright happy path in Sprint 4 |
| Lighthouse regressions before submission | Run Lighthouse locally before merging anything that changes the public shell |
| Accessibility regressions | Use Radix primitives by default; rerun axe before submission |
| Cookie / CSRF surprises in production | Smoke-test the auth round trip immediately after each deploy per [../DEPLOYMENT.md §6](../DEPLOYMENT.md#6-post-deploy-smoke-checklist) |

## Definition of Ready (frontend stories)

A frontend story can be pulled into a sprint when:

- The matching backend endpoint exists (or is committed for the same sprint).
- DTO shape is documented in [../STATE-AND-DATA-MODEL.md](../STATE-AND-DATA-MODEL.md).
- Acceptance criteria are testable as either a Jest case or a manual smoke step.
- A rough wireframe / UX direction is agreed (verbal is fine for prototype scope).
