# Frontend Security Scan — 2026-05-21

> Backend counterpart: [../../../ReviewPortal-API/docs/security/BACKEND-SECURITY-SCAN-2026-05-07.md](../../../ReviewPortal-API/docs/security/BACKEND-SECURITY-SCAN-2026-05-07.md).
>
> Scope: the Next.js web client only. Backend findings are tracked in the API repository.
>
> Scan date: 2026-05-21
> Run by: SEC-FE template owner (Sadish)

---

## 1. Methodology

Three checks were performed:

1. **Dependency audit** — `npm audit --omit=dev` against the lock file.
2. **Source review** — manual review of every code path that handles secrets, auth, user input rendering, and outbound URLs.
3. **Header check** — `curl -I` against a local production build (`npm run build && npm run start`).

---

## 2. Findings Summary

| ID | Severity | Status | Area |
|----|----------|--------|------|
| SEC-FE-01 | Medium | Open | Final CSP not yet enforced |
| SEC-FE-02 | Low | Open | `npm audit` advisories not yet documented per package |
| SEC-FE-03 | Low | Open | `next/image` allow-list lacks the CDN host (only the blob host is listed) |
| SEC-FE-04 | Info | Accepted | Vendor JS bundle includes Radix primitives — these are first-class dependencies and are reviewed at upgrade time |
| SEC-FE-05 | Info | Accepted | The `sonner` toast library can render HTML when the caller passes JSX; codebase only passes strings |

No critical or high findings.

---

## 3. Findings Detail

### SEC-FE-01 — Final CSP not yet enforced (Medium)

**Description.** [../../next.config.ts](../../next.config.ts) currently sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`. The `Content-Security-Policy` is in `Report-Only` mode while the production policy is agreed.

**Risk.** Without an enforced CSP, an undetected XSS would not be contained by the policy. The risk is low because user-generated content is rendered as text (no `dangerouslySetInnerHTML`), but a defence-in-depth header is required for sign-off.

**Recommendation.** Agree the production CSP with the backend security owner and switch from `Report-Only` to `Content-Security-Policy`. A starting point:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://*.blob.core.windows.net https://reviewportal.azureedge.net;
font-src 'self' data:;
connect-src 'self' https://<api-host>;
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
```

`unsafe-inline` is required by Next.js for hydration scripts until [the strict-dynamic migration](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy) is adopted post-submission.

**Owner.** Frontend lead.
**Target.** Before submission.

---

### SEC-FE-02 — npm audit advisories not yet documented (Low)

**Description.** `npm audit --omit=dev` finds the small set of transitive advisories typical of a Next.js 15 project. None are flagged High or Critical at this snapshot, but the dispositions are not documented.

**Recommendation.** Record the output and the per-advisory disposition (accepted / fix scheduled) in [./NPM-AUDIT-2026-05-21.md](./NPM-AUDIT-2026-05-21.md). Re-run before final submission.

**Owner.** Frontend lead.
**Target.** Before submission.

---

### SEC-FE-03 — Missing CDN host on the image allow-list (Low)

**Description.** [../../next.config.ts](../../next.config.ts) allow-lists `*.blob.core.windows.net` but not the CDN host the API can optionally front Blob Storage with.

**Risk.** When the API switches to the CDN, image rendering will silently fail on the client.

**Recommendation.** Add `reviewportal.azureedge.net` (or the agreed CDN host) to `images.remotePatterns` before the API enables the CDN.

**Owner.** Frontend lead.
**Target.** Before the API CDN switch.

---

### SEC-FE-04 — Radix vendor footprint (Info, accepted)

Radix UI primitives are intentionally included to provide accessible, headless components. They are reviewed at every major version bump.

---

### SEC-FE-05 — `sonner` HTML rendering (Info, accepted)

`sonner` toasts can include JSX, which is rendered as React nodes. The codebase only calls `toast.success(string)` / `toast.error(string)`, so no untrusted HTML is ever rendered.

---

## 4. Source Review Checklist

| Area | Result |
|------|--------|
| `dangerouslySetInnerHTML` usage | None found in user-content paths |
| `localStorage` / `document.cookie` access to the JWT | None found |
| Token logged to console | None found |
| Bypass of the `/api/backend` proxy | None found |
| URL parameter rendered without escaping | None found (React escapes by default) |
| Outbound `fetch` to non-API hosts | None found |
| Hard-coded credentials | None found |
| `NEXT_PUBLIC_*` env var holding a secret | None found |

---

## 5. Header Check

Run after `npm run build && npm run start`:

```bash
curl -sI http://localhost:3000/ | sort
```

Expected headers (when SEC-FE-01 is closed):

```
content-security-policy: default-src 'self'; ...
referrer-policy: strict-origin-when-cross-origin
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: DENY
permissions-policy: camera=(), microphone=(), geolocation=()
```

`Strict-Transport-Security` is set only on HTTPS deployments — `npm run start` over HTTP omits it.

---

## 6. Re-Scan Cadence

- Every Friday during the build phase.
- On every dependency bump that updates `next`, `react`, `react-dom`, or any Radix package.
- Before tagging a submission build.
