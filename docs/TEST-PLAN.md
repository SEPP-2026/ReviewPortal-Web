# Test Plan — Black-Box, Dry Run, and Usability Testing (Web Client)

> Backend counterpart: [../../ReviewPortal-API/docs/TEST-PLAN.md](../../ReviewPortal-API/docs/TEST-PLAN.md).
>
> Purpose: MSc submission test plan for the Next.js web client.
>
> Scope: every screen in the public shell, account area, and admin shell — covering catalogue, calculator, authentication, review workflow, moderation, image management, dashboard, accessibility, responsiveness, and security headers.

---

## 1. Test Objectives

The test plan verifies that the client:

- Satisfies the functional requirements in [REQUIREMENTS-SPECIFICATION.md](REQUIREMENTS-SPECIFICATION.md).
- Validates user input correctly and surfaces backend ProblemDetails as inline errors and toast messages.
- Allows visitors to browse, search, calculate cost, register, and review.
- Allows staff to log in, moderate, manage tools and categories, and view the dashboard.
- Keeps the JWT inside an httpOnly cookie and never exposes it to client JS.
- Renders correctly across mobile and desktop viewports and meets WCAG 2.1 Level AA.

---

## 2. Test Scope

### In Scope

| Area | Coverage |
|------|----------|
| Public shell | Homepage, equipment overview, category browse, tool detail, search results, marketing pages |
| Calculator | Date validation, breakdown rendering, totals formatting |
| Auth | Register, login, forgot/reset password, cookie handling, logout |
| Account | My profile, my reviews with status badges, change password |
| Reviews | Submit, list, rating display, "not enough reviews" branch |
| Comments | Submit, list, pending state |
| Company responses | Staff form, visual treatment, single-response rule |
| Admin shell | Guard behaviour, navigation, layouts |
| Admin tools | Create with first image, edit, status toggle, image manager |
| Admin categories | Create, rename, delete with non-empty guard |
| Admin moderation | Queue, approve, reject with reason, optimistic update + rollback |
| Admin dashboard | Cards + charts |
| Cross-cutting | Loading/error/empty states, accessibility, responsiveness, security headers |

### Out of Scope

| Area | Reason |
|------|--------|
| Backend persistence | Owned by the API |
| Real payments / booking | Out of brief |
| Multi-language | Not in scope |
| Email delivery | Backend concern only |

---

## 3. Test Environment

| Item | Test Environment |
|------|------------------|
| Web client | Next.js 15 on Node.js 20 |
| Browser | Chromium / Firefox / WebKit via Playwright; Safari + Chrome for manual smoke |
| API | Local API or staging API (`NEXT_PUBLIC_API_URL`) |
| Test users | Customer, Admin, Moderator seeded via the API |
| Seed data | Categories, tools, reviews, comments, company response, dashboard fixtures |
| Lighthouse | Chrome DevTools Lighthouse against the production build |
| Accessibility | axe DevTools / @axe-core/playwright |

---

## 4. Entry and Exit Criteria

### Entry Criteria

| Criterion | Required Evidence |
|-----------|-------------------|
| Clean install + build | `npm ci && npm run build` passes |
| Backend reachable | `GET /api/categories` returns 200 from the configured `NEXT_PUBLIC_API_URL` |
| Seed accounts available | Customer / Admin / Moderator credentials known |
| Seed data present | Categories with active tools, plus one approved review and one pending review |
| Dev server starts | `npm run dev` runs without error on `http://localhost:3000` |

### Exit Criteria

| Criterion | Required Evidence |
|-----------|-------------------|
| Black-box tests pass | Section 5 results recorded |
| Dry run completed | Dry run checklist signed off |
| Usability testing completed | Section 7 results recorded |
| No critical open defects | Critical and high defects fixed or formally accepted |

---

## 5. Black-Box Test Plan

### 5.1 Black-Box Test Cases

| ID | Area | Scenario | Action | Expected Result |
|----|------|----------|--------|-----------------|
| FE-BB-01 | Homepage | View featured categories | Open `/` | All active featured categories render with name + image |
| FE-BB-02 | Category | Browse | Click a category | Tools render in a 12-per-page grid |
| FE-BB-03 | Category | Sort | Choose "Price low → high" | Cards re-order; URL has `sortBy=price&sortOrder=asc` |
| FE-BB-04 | Category | Filter | Set min/max price | Only tools in the range render |
| FE-BB-05 | Category | Pagination | Click page 2 | URL has `page=2`; next 12 items render |
| FE-BB-06 | Search | Match | Type a known term | Results render with a thumbnail and price |
| FE-BB-07 | Search | Empty | Type a junk string | Friendly empty state rendered |
| FE-BB-08 | Tool detail | View | Open a tool | Gallery, description, rates, rating summary, calculator visible |
| FE-BB-09 | Calculator | Valid range | Pick valid start/end | Breakdown and total render |
| FE-BB-10 | Calculator | Invalid range | End ≤ start | Inline error; no API call |
| FE-BB-11 | Register | Success | Valid form | 200; redirected to home, logged in |
| FE-BB-12 | Register | Weak password | Password missing digit | Inline error; no API call |
| FE-BB-13 | Login | Success | Valid credentials | Cookie set, navigated to next or home |
| FE-BB-14 | Login | Failure | Wrong password | Generic error message |
| FE-BB-15 | Review | Submit | All five stars + 20 char text | Toast "Awaiting moderation"; form closes |
| FE-BB-16 | Review | Missing rating | One star missing | Inline error on the missing star |
| FE-BB-17 | Tool detail | Approved reviews only | View | Pending reviews not rendered |
| FE-BB-18 | Comment | Submit | 10+ chars + name | Toast "Pending moderation" |
| FE-BB-19 | Company response | Staff add | Logged in as Admin / Moderator | Form visible; response renders distinctly after submit |
| FE-BB-20 | Company response | Customer view | Logged in as Customer | Form not visible |
| FE-BB-21 | Moderation queue | Open | Logged in as Moderator | Pending items render oldest first |
| FE-BB-22 | Moderation | Approve | Click Approve | Item removed from queue; toast confirms |
| FE-BB-23 | Moderation | Reject | Provide reason | Item removed; rejection reason persisted |
| FE-BB-24 | Admin guard | Customer | Open `/admin` | Redirected to `/` |
| FE-BB-25 | Admin guard | Anonymous | Open `/admin` | Redirected to `/login?next=%2Fadmin` |
| FE-BB-26 | Admin tools | Create | Submit form with image | 201; new tool visible in list |
| FE-BB-27 | Admin tools | Edit | Update rates | 200; new rates render |
| FE-BB-28 | Admin tools | Activate/Deactivate | Toggle | Status badge updates without reload |
| FE-BB-29 | Admin images | Delete last | Try to remove the only image | UI blocks deletion |
| FE-BB-30 | Admin categories | Delete non-empty | Try to delete a category with tools | API 409 surfaced inline |
| FE-BB-31 | Dashboard | Render | Open `/admin/dashboard` | Cards and charts render |
| FE-BB-32 | Accessibility | Keyboard | Tab through the homepage | Every interactive element reachable; visible focus ring |
| FE-BB-33 | Responsiveness | 375px | Resize to 375 wide | No horizontal scroll on any public route |
| FE-BB-34 | Security headers | Production | `curl -I <prod-url>/` | CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy present |
| FE-BB-35 | Cookie | Login | Inspect cookie | `rp.auth` is HttpOnly, Secure, SameSite=Lax |
| FE-BB-36 | Error boundary | Force 500 | Simulate API 500 | `error.tsx` renders a recoverable UI |

### 5.2 Black-Box Test Result Template

| Test ID | Date | Tester | Build/Version | Result | Evidence | Defect ID |
|---------|------|--------|---------------|--------|----------|-----------|
| FE-BB-01 | | | | Pass / Fail | Screenshot, response body, or log | |

---

## 6. Dry Run Plan

### 6.1 Dry Run Checklist

| Step | Action | Expected Result | Evidence |
|------|--------|-----------------|----------|
| FE-DR-01 | Pull latest branch | Expected files present | Git status |
| FE-DR-02 | `npm ci` | Install succeeds | Terminal log |
| FE-DR-03 | `npm run lint` | Lint passes | Terminal log |
| FE-DR-04 | `npm run test:ci` | All tests pass | Jest summary |
| FE-DR-05 | `npm run build` | Production build succeeds | `.next` produced |
| FE-DR-06 | `npm run start` | Production server starts | `http://localhost:3000` responds |
| FE-DR-07 | Smoke `/` | Homepage renders | Screenshot |
| FE-DR-08 | Smoke `/equipment/<id>` | Category page renders | Screenshot |
| FE-DR-09 | Smoke `/equipment/<id>/<toolId>` | Detail page + calculator render | Screenshot |
| FE-DR-10 | Login as Customer | Cookie set | DevTools cookie panel |
| FE-DR-11 | Submit a review | Toast "Awaiting moderation" | Screenshot |
| FE-DR-12 | Login as Moderator | Approve a pending item | Screenshot |
| FE-DR-13 | Open `/admin/dashboard` | Cards + charts render | Screenshot |
| FE-DR-14 | `curl -I <local-prod>/` | Security headers present | Terminal log |
| FE-DR-15 | Lighthouse run | Scores meet targets | Lighthouse report |
| FE-DR-16 | axe scan | No critical violations | axe report |

### 6.2 Dry Run Defect Log

| Defect ID | Step | Description | Severity | Owner | Status | Resolution |
|-----------|------|-------------|----------|-------|--------|------------|
| FE-DR-DEF-001 | | | Critical / High / Medium / Low | | Open / Fixed / Accepted | |

### 6.3 Dry Run Sign-Off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Developer | | | Pass / Re-run required |
| Tester | | | Pass / Re-run required |
| Product reviewer | | | Pass / Re-run required |

---

## 7. Usability Testing Schema

### 7.1 Participant Groups

| Group | Target Participants | Rationale |
|-------|---------------------|-----------|
| DIY customer | 2–3 | Casual browsing and price checking |
| Trade / site user | 1–2 | Faster search and comparison |
| Staff / admin user | 1–2 | Moderation and catalogue management |

### 7.2 Usability Tasks

| Task ID | Group | Task | Success Criteria |
|---------|-------|------|------------------|
| FE-UT-01 | Customer | Find a tool from a category | Reaches detail page without assistance |
| FE-UT-02 | Customer | Search for a known tool | Finds result within 2 minutes |
| FE-UT-03 | Customer | Calculate a weekend hire | Valid breakdown shown |
| FE-UT-04 | Customer | Submit a review | Form completed; pending message understood |
| FE-UT-05 | Customer | Comment on a review | Comment submitted; pending status understood |
| FE-UT-06 | Registered user | Open My Reviews | Finds status badge / rejection reason |
| FE-UT-07 | Moderator | Approve a review | Completes without assistance |
| FE-UT-08 | Moderator | Reject with reason | Reason captured; outcome understood |
| FE-UT-09 | Admin | Add/edit a tool | Locates fields and saves successfully |
| FE-UT-10 | Admin | Deactivate / reactivate a tool | Understands the public visibility impact |

### 7.3 Usability Metrics

| Metric | Measurement | Target |
|--------|-------------|--------|
| Task completion | Pass/fail per task | ≥ 80% without assistance |
| Time on task | Stopwatch | Core customer tasks under 2 minutes |
| Error count | Click misses, invalid submissions | No critical task-blocking errors |
| Assistance required | Prompts given | Minimal for core tasks |
| Satisfaction | 1–5 post-task score | ≥ 4 average |
| Clarity of error messages | Participant explains the message | Most understand the cause and fix |

### 7.4 Usability Observation Sheet

| Participant ID | Role | Task ID | Completed? | Time | Errors | Assistance Given | Satisfaction 1–5 | Notes |
|----------------|------|---------|------------|------|--------|------------------|-------------------|-------|
| P01 | | | Yes / No | | | | | |

### 7.5 Post-Test Questions

| Question | Response Type |
|----------|---------------|
| What was easiest to do? | Free text |
| What was hardest to do? | Free text |
| Did the rental cost breakdown make sense? | Yes/No + comments |
| Did the review moderation message make sense? | Yes/No + comments |
| Were any labels or buttons confusing? | Free text |
| How confident would you feel using this system without help? | 1–5 |

### 7.6 Usability Issue Log

| Issue ID | Task ID | Observation | Severity | Recommended Improvement | Status |
|----------|---------|-------------|----------|-------------------------|--------|
| FE-UX-001 | | | Critical / High / Medium / Low | | Open / Fixed / Accepted |

---

## 8. Test Data

| Data Type | Required Examples |
|-----------|-------------------|
| Categories | Building & Construction, Cleaning & Maintenance, Garden & Landscaping, Services |
| Tools | At least one active tool per featured category with images and three-tier rates |
| Reviews | At least one approved review and one pending review |
| Comments | At least one approved comment and one pending comment |
| Company response | One response on an approved review |
| Users | Customer, Admin, Moderator |

---

## 9. Traceability

| Submission Area | Evidence in This Plan |
|-----------------|-----------------------|
| Black-box | §5 test cases and result template |
| Dry run | §6 checklist, defect log, sign-off |
| Usability schema | §7 groups, tasks, metrics, observation sheet, issue log |
| Functional coverage | §5 cases map to FE-01..FE-47 requirements |
| Security | FE-BB-34, FE-BB-35 |
| Accessibility | FE-BB-32, FE-DR-16 |
| Performance | FE-DR-15 |
