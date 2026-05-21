# Submission Gap Checklist — Shelton Tool-Hire Review Portal (Web Client)

> Backend counterpart: [../../ReviewPortal-API/docs/SUBMISSION-GAP-CHECKLIST.md](../../ReviewPortal-API/docs/SUBMISSION-GAP-CHECKLIST.md).
>
> Purpose: a single page to walk before submitting the frontend deliverable. Each item is binary — done or open — and links to where the evidence lives.

---

## 1. Source Code

- [x] Repository builds on a clean checkout: `npm ci && npm run build`
- [x] Unit tests pass: `npm run test:ci`
- [x] Lint passes: `npm run lint`
- [x] Production start succeeds: `npm run start`
- [ ] CI status badge added to [../README.md](../README.md) (post-submission polish)

## 2. Documentation

- [x] [REQUIREMENTS-SPECIFICATION.md](REQUIREMENTS-SPECIFICATION.md)
- [x] [NON-FUNCTIONAL-REQUIREMENTS.md](NON-FUNCTIONAL-REQUIREMENTS.md)
- [x] [COMPONENT-DESIGN.md](COMPONENT-DESIGN.md)
- [x] [STATE-AND-DATA-MODEL.md](STATE-AND-DATA-MODEL.md)
- [x] [FUNCTIONAL-DESIGN-DIAGRAMS.md](FUNCTIONAL-DESIGN-DIAGRAMS.md)
- [x] [DEPLOYMENT.md](DEPLOYMENT.md)
- [x] [GAP-ANALYSIS.md](GAP-ANALYSIS.md)
- [x] [PROJECT-COMPLETION-REPORT.md](PROJECT-COMPLETION-REPORT.md)
- [x] [TESTING-STRATEGY.md](TESTING-STRATEGY.md)
- [x] [TEST-PLAN.md](TEST-PLAN.md)
- [x] Agile pack in [agile/](agile/)

## 3. Requirements Traceability

- [x] Every Must-priority UI requirement (FE-01 to FE-47) is mapped to a route/component in [GAP-ANALYSIS.md §2](GAP-ANALYSIS.md#2-requirements-traceability-matrix)
- [x] Every brief reference (R2–R26) appears at least once in the matrix
- [x] DTO usage table is up to date in [GAP-ANALYSIS.md §5](GAP-ANALYSIS.md#5-backend-dependency-watch)

## 4. Functional Evidence

- [x] Public homepage renders featured categories end-to-end
- [x] Category browse with sort, filter, pagination verified manually
- [x] Tool detail with calculator and review feed verified manually
- [x] Authentication round-trip: register, login, /api/auth/me, logout
- [x] Submit review → moderation queue → approve → public visibility
- [x] Admin create tool with first image upload
- [x] Admin image manager blocks deleting the last image
- [x] Admin moderation approve and reject (with reason)
- [x] Admin dashboard renders cards and charts

## 5. Non-Functional Evidence

- [ ] Lighthouse report for `/` (Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95) — GAP-FE-01
- [ ] Lighthouse report for `/equipment/[categoryId]` — GAP-FE-01
- [ ] Lighthouse report for `/equipment/[categoryId]/[toolId]` — GAP-FE-01
- [ ] axe-core JSON for the same routes — GAP-FE-02
- [ ] Mobile screenshots at 375px / 768px / 1280px / 1920px
- [ ] Response header capture (`curl -I <prod-url>/`) showing CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy — GAP-FE-04
- [ ] `npm audit` output and disposition — GAP-FE-05
- [ ] Full Playwright run for the three critical journeys — GAP-FE-03

## 6. Security

- [x] JWT lives only in an httpOnly cookie set by [app/api/auth/login/route.ts](../app/api/auth/login/)
- [x] No `localStorage`/`document.cookie` access to the token
- [x] Image remote patterns explicitly allow-listed in [next.config.ts](../next.config.ts)
- [x] User-generated content rendered as text (no `dangerouslySetInnerHTML`)
- [ ] Final security headers reviewed and enforced — GAP-FE-04
- [ ] Frontend security scan recorded under [security/](security/)

## 7. Deployment

- [x] Production build runs locally (`npm run build && npm run start`)
- [x] Environment variable table documented in [DEPLOYMENT.md §2](DEPLOYMENT.md#2-required-environment-variables)
- [ ] Production domain configured with the host
- [ ] Production API URL set in host env vars
- [ ] CORS allow-list on the API includes the production frontend origin
- [ ] Post-deploy smoke checklist from [DEPLOYMENT.md §6](DEPLOYMENT.md#6-post-deploy-smoke-checklist) executed once after go-live

## 8. Final Sign-Off

- [ ] All blocking items in §4–§7 either ticked or formally accepted
- [ ] Tag the commit (e.g. `v1.0.0-submission`) once the above is green
- [ ] Backend submission checklist also green: [../../ReviewPortal-API/docs/SUBMISSION-GAP-CHECKLIST.md](../../ReviewPortal-API/docs/SUBMISSION-GAP-CHECKLIST.md)
