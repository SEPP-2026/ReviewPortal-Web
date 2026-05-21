# Non-Functional Requirements — Shelton Tool-Hire Review Portal (Web Client)

This document captures the quality attributes that the Next.js web client must satisfy beyond its functional capabilities. It mirrors the structure of the API's [NON-FUNCTIONAL-REQUIREMENTS.md](../../ReviewPortal-API/docs/NON-FUNCTIONAL-REQUIREMENTS.md) and is grouped by ISO 25010 quality characteristics. Numbering uses an `NFR-FE-*` prefix to avoid collisions with backend NFRs.

---

## 1. Performance

| ID | Requirement | Target | Verification |
|----|-------------|--------|--------------|
| NFR-FE-01 | First Contentful Paint on the homepage shall complete within 1.5s on a 10 Mbps connection | < 1.5s | Lighthouse CI report |
| NFR-FE-02 | Largest Contentful Paint on category and detail pages shall be under 2.5s | < 2.5s | Lighthouse CI |
| NFR-FE-03 | Cumulative Layout Shift across public pages shall stay below 0.1 | < 0.1 | Lighthouse CI |
| NFR-FE-04 | Server Components and `fetch` requests with appropriate cache hints shall avoid duplicate API calls on the same render | No duplicates | Network panel audit, server log inspection |
| NFR-FE-05 | All catalogue and image-heavy pages shall use Next.js `<Image>` with explicit `sizes` to deliver responsive, optimised images | `next/image` used | Code review |
| NFR-FE-06 | Initial JS payload (homepage) shall stay under 200 KB gzipped | < 200 KB | `next build` analysis |
| NFR-FE-07 | Client-side calculator interactions shall feel instant once API rates are loaded | Input → result < 100ms | Manual timing |

---

## 2. Security

| ID | Requirement | Target | Verification |
|----|-------------|--------|--------------|
| NFR-FE-08 | JWTs returned by the backend shall be stored in an httpOnly, Secure, SameSite=Lax cookie set by the Next.js route handler — never in `localStorage` or `document.cookie` | httpOnly cookie | Code review of [app/api/auth](../app/api/auth) |
| NFR-FE-09 | All browser-to-backend calls shall go through the [/api/backend](../app/api) proxy so the JWT is attached server-side | Proxy used | Code review of [lib/backend-api.ts](../lib/backend-api.ts) |
| NFR-FE-10 | The admin shell shall be guarded by [lib/admin-guard.ts](../lib/admin-guard.ts) before rendering; unauthenticated users get redirected and customers get a 403 page | Guard executed pre-render | Manual test, integration test |
| NFR-FE-11 | User-generated content (review text, comments, response text, names) shall be rendered as text — never injected as HTML — to prevent XSS | No `dangerouslySetInnerHTML` for user content | Code review, ESLint rule |
| NFR-FE-12 | Forms shall validate on the client with `zod` schemas as defence-in-depth in addition to backend validation | zod schema present | Code review, Jest tests |
| NFR-FE-13 | The production build shall set the Next.js security headers (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) via [next.config.ts](../next.config.ts) | Headers present | Response header inspection |
| NFR-FE-14 | Image domains shall be explicitly allow-listed in `next.config.ts` `images.remotePatterns` — no wildcard remote sources | Explicit allow-list | Code review |
| NFR-FE-15 | Secrets shall never be read with `NEXT_PUBLIC_*` env vars; sensitive values are only readable in server components / route handlers | No secret in `NEXT_PUBLIC_*` | `.env.example` review |

---

## 3. Usability

| ID | Requirement | Target | Verification |
|----|-------------|--------|--------------|
| NFR-FE-16 | The portal shall be fully usable on screens from 375px wide up to 1920px | Responsive 375px+ | Manual testing, Playwright responsive viewports |
| NFR-FE-17 | Navigation shall be consistent across all public pages and the admin shell shall use a visually distinct layout | Consistent nav | Manual review of [components/layout](../components/layout) and [components/admin](../components/admin) |
| NFR-FE-18 | Form validation errors shall appear inline next to the relevant field with clear, human-readable messages | Inline errors | Manual testing, Jest tests |
| NFR-FE-19 | Empty states shall display helpful messages and an action (e.g. "Browse all categories") instead of blank pages | Friendly empty states | Manual testing |
| NFR-FE-20 | Long-running actions (submit, upload, moderate) shall show a disabled state with a loading indicator until the API returns | Pending indicator | Manual testing |
| NFR-FE-21 | Toast notifications via `sonner` shall confirm every mutating action (submit, approve, reject, save) with an explicit message | Toast per mutation | Manual testing |

---

## 4. Accessibility

| ID | Requirement | Target | Verification |
|----|-------------|--------|--------------|
| NFR-FE-22 | The portal shall target WCAG 2.1 Level AA compliance | AA compliant | Lighthouse + axe-core audit |
| NFR-FE-23 | All meaningful images shall have descriptive `alt` text; decorative images shall use `alt=""` | Alt text present | HTML validation, axe scan |
| NFR-FE-24 | All interactive controls shall be reachable and operable using the keyboard alone, with a visible focus ring | Tab/Enter/Space supported | Manual testing |
| NFR-FE-25 | Colour contrast shall meet WCAG AA (4.5:1 for normal text, 3:1 for large text) | AA contrast | Lighthouse audit |
| NFR-FE-26 | Star rating inputs shall be operable without a mouse (arrow keys, radio semantics) | Keyboard operable | Manual testing |
| NFR-FE-27 | Dialogs (review form, rejection reason, image manager) shall use Radix Dialog primitives so focus is trapped and ESC closes them | Radix Dialog | Code review |
| NFR-FE-28 | The page shall expose a unique `<h1>` per route and a sensible heading hierarchy | One h1 per page | Axe scan |

---

## 5. Reliability and Availability

| ID | Requirement | Target | Verification |
|----|-------------|--------|--------------|
| NFR-FE-29 | Each route shall implement an App Router `error.tsx` boundary so a render failure shows a recoverable UI instead of a blank screen | error.tsx present | Code review |
| NFR-FE-30 | Network failures from the API shall surface as toast messages plus inline retry where possible | Retry surfaced | Manual testing |
| NFR-FE-31 | The backend proxy shall map non-2xx responses into structured client errors and never leak raw stack traces | Structured errors | Code review of [lib/backend-api.ts](../lib/backend-api.ts) |
| NFR-FE-32 | Optimistic UI updates (e.g. moderation actions) shall reconcile with server state and roll back on failure | Rollback on failure | Manual testing |

---

## 6. Scalability and Caching

| ID | Requirement | Target | Verification |
|----|-------------|--------|--------------|
| NFR-FE-33 | Public catalogue routes shall be statically generated where possible and revalidated using Next.js ISR with sensible TTLs | ISR configured | Code review |
| NFR-FE-34 | Server `fetch` calls shall use explicit `next: { revalidate: N, tags: [...] }` and shall be invalidated via `revalidateTag` after admin mutations | Tag-based revalidation | Code review |
| NFR-FE-35 | All list endpoints shall request page sizes that match the API's pagination contract | 12 items per page | Code review |

---

## 7. Maintainability

| ID | Requirement | Target | Verification |
|----|-------------|--------|--------------|
| NFR-FE-36 | Code shall be organised by feature: routes in [app/](../app/), domain components in [components/](../components/), shared logic in [lib/](../lib/), client state in [store/](../store/), types in [types/](../types/), hooks in [hooks/](../hooks/) | Feature-aligned structure | Code review |
| NFR-FE-37 | API DTO types shall live in [types/api.ts](../types/api.ts) and shall be the single source of truth for response shapes consumed by components | DTOs centralised | Code review |
| NFR-FE-38 | UI primitives shall follow the shadcn/ui pattern in [components/ui/](../components/ui/) and shall be styled with Tailwind utility classes — no per-component CSS modules | shadcn/ui + Tailwind | Code review |
| NFR-FE-39 | ESLint and Prettier shall run via `npm run lint` and `npm run format`; CI shall fail on lint errors | CI lint gate | GitHub Actions workflow |
| NFR-FE-40 | TypeScript shall be configured in `strict` mode in [tsconfig.json](../tsconfig.json); `any` shall be avoided except at clearly justified boundaries | strict mode | Code review |
| NFR-FE-41 | The CI pipeline shall build the project and run `npm test` on every push to any branch | Automated CI | GitHub Actions workflow |

---

## 8. Data Integrity (Client Side)

| ID | Requirement | Target | Verification |
|----|-------------|--------|--------------|
| NFR-FE-42 | Forms shall not submit until the `zod` schema passes; star ratings are required, text fields enforce minimum lengths matching the API | Schema enforced | Jest tests |
| NFR-FE-43 | Currency values shall be formatted with `Intl.NumberFormat` (GBP) and never via ad-hoc string concatenation | Intl used | Code review |
| NFR-FE-44 | Date-time values shall be parsed and formatted with `date-fns`; the client shall always send ISO-8601 strings to the API | date-fns used | Code review |
| NFR-FE-45 | Optimistic Zustand store updates shall be reset from the canonical API response after each request | Store reconciled | Code review |

---

## 9. Observability

| ID | Requirement | Target | Verification |
|----|-------------|--------|--------------|
| NFR-FE-46 | Client-side errors caught by an `error.tsx` boundary shall be logged with `console.error` so they surface in the host's runtime logs | Errors logged | Code review |
| NFR-FE-47 | Backend proxy route handlers shall log the status, path, and duration of upstream calls in non-production builds | Server logs present | Code review |
| NFR-FE-48 | Toast messages for failed mutations shall include the request id when present in the ProblemDetails payload | Request id surfaced | Code review |

---

## 10. Non-Functional Completion and Gap Status

| Area | Requirement IDs | Current Status | Remaining Evidence |
|------|-----------------|----------------|--------------------|
| Performance | NFR-FE-01 to NFR-FE-07 | Public routes use server components, ISR, and `next/image` | Capture Lighthouse CI reports for homepage, category, detail, search |
| Security | NFR-FE-08 to NFR-FE-15 | Cookie-based JWT, server-side proxy, allow-listed image domains, zod validation | Verify headers in `next.config.ts`, run `npm audit` and document residual findings |
| Usability | NFR-FE-16 to NFR-FE-21 | Responsive layout and consistent shell are in place | Capture screenshots at 375/768/1280px |
| Accessibility | NFR-FE-22 to NFR-FE-28 | Radix primitives and semantic HTML used throughout | Capture axe-core and Lighthouse accessibility reports |
| Reliability | NFR-FE-29 to NFR-FE-32 | App Router error boundaries and proxy error mapping in place | Verify reset/recovery on simulated 500 from API |
| Scalability | NFR-FE-33 to NFR-FE-35 | Public routes use ISR with revalidation tags | Document tag invalidation after admin mutations |
| Maintainability | NFR-FE-36 to NFR-FE-41 | Feature-aligned structure, strict TS, ESLint, Jest, CI in place | Add coverage publishing to CI |
| Data integrity (client) | NFR-FE-42 to NFR-FE-45 | zod schemas, `Intl`, and `date-fns` used | Add Jest cases for currency/date formatting helpers |
| Observability | NFR-FE-46 to NFR-FE-48 | Console-level logging in dev; toast messages on failure | Add request-id propagation from ProblemDetails |

### 10.1 Sign-Off Gates

| Gate | Required Before Final Sign-Off |
|------|--------------------------------|
| Build and tests | `npm run build` and `npm test` pass on a clean checkout |
| Lighthouse | Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95 on the public homepage in production mode |
| Security headers | `curl -I` against the production URL confirms CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| Auth flow | Login → cookie set → protected admin route → logout cycle verified end-to-end |
| Deployment | Smoke test against the production URL after each deploy as documented in [DEPLOYMENT.md](DEPLOYMENT.md) |
