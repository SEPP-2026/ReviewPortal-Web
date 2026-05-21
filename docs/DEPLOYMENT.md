# Deployment — Shelton Tool-Hire Review Portal (Web Client)

> Backend counterpart: [../../ReviewPortal-API/docs/DEPLOYMENT-TO-AZURE-APP-SERVICE.md](../../ReviewPortal-API/docs/DEPLOYMENT-TO-AZURE-APP-SERVICE.md).
>
> This document covers deploying the Next.js web client. Two supported targets are documented: Vercel (recommended default) and Azure Static Web Apps (matches the existing Azure footprint).

---

## 1. Build Output

`npm run build` produces a hybrid `.next` output: prerendered HTML for static routes, server bundles for RSC and route handlers, and a client bundle for hydrated components. The host must support running the Node.js Next.js server (not "export"-style static hosting) because the app uses route handlers and Server Components.

| Output | Used at runtime by |
|--------|--------------------|
| `.next/server/app/...` | Server Components, route handlers |
| `.next/static/...` | Hashed JS/CSS assets served from the CDN |
| `public/` | Static assets passed through unchanged |

---

## 2. Required Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Build + runtime | Upstream API base URL (e.g. `https://reviewportal-api.azurewebsites.net/api`) |
| `NEXT_PUBLIC_APP_URL` | Build + runtime | Canonical site URL (used in metadata and redirects) |
| `BACKEND_INTERNAL_URL` | Server-only | Server-to-server backend URL when different from the public one |
| `AUTH_COOKIE_NAME` | Server-only | Default `rp.auth`; override only if multiple environments share a domain |
| `AUTH_COOKIE_SECURE` | Server-only | `true` in production; `false` only in local dev |
| `NODE_ENV` | Build + runtime | `production` in deployed environments |

`NEXT_PUBLIC_*` variables are inlined into the client bundle — never put a secret there.

The local `.env.local` template lives in `.env.example`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_INTERNAL_URL=http://localhost:5000/api
AUTH_COOKIE_NAME=rp.auth
AUTH_COOKIE_SECURE=false
```

---

## 3. Path A — Vercel (recommended default)

### 3.1 One-time setup
1. Connect the GitHub repo on https://vercel.com.
2. Pick the `Review-Portal-Web` directory as the project root.
3. Framework preset: **Next.js**.
4. Build command: `npm run build` (this triggers `prebuild` → `npm run test:ci`).
5. Output directory: leave blank — Vercel uses `.next` automatically.

### 3.2 Environment variables
Add the variables from §2 under Project → Settings → Environment Variables for **Production**, **Preview**, and **Development**.

### 3.3 Domains
Set the production domain (e.g. `app.shelton-toolhire.example`) and update the API's CORS allow-list to include it (see [../../ReviewPortal-API/docs/DEPLOYMENT-TO-AZURE-APP-SERVICE.md](../../ReviewPortal-API/docs/DEPLOYMENT-TO-AZURE-APP-SERVICE.md)).

### 3.4 Deploy
- Pushing to the configured production branch (default `main`) triggers a production deploy.
- Pull requests get preview deployments automatically.

### 3.5 Verification
After each deploy, run the smoke checklist in §6.

---

## 4. Path B — Azure Static Web Apps

Azure Static Web Apps (SWA) is the option that keeps everything within Azure alongside the API.

### 4.1 Prereqs
- An Azure subscription with permission to create Static Web Apps and Linked Backend.
- The backend already deployed to Azure App Service per the API's deployment doc.
- A GitHub repo connection (SWA wires up GitHub Actions automatically).

### 4.2 Provisioning (Azure CLI)
```bash
az staticwebapp create \
  --name rp-web-prod \
  --resource-group rp-prod \
  --source https://github.com/SEPP-2026/ReviewPortal-Web \
  --branch main \
  --app-location "/" \
  --output-location ".next" \
  --login-with-github
```

For Next.js with route handlers, deploy with the official `Azure/static-web-apps-deploy@v1` GitHub Action and the `next` build adapter.

### 4.3 Linked backend
Link the existing API App Service to the Static Web App so the SWA host attaches the backend URL automatically:

```bash
az staticwebapp backends link \
  --name rp-web-prod \
  --backend-resource-id <backend-app-service-resource-id> \
  --backend-region <region>
```

### 4.4 Environment variables
Set the §2 variables under SWA → Configuration → Application settings. Mark `AUTH_COOKIE_NAME`, `BACKEND_INTERNAL_URL`, and `AUTH_COOKIE_SECURE` as **server-only** values.

### 4.5 Custom domain
Add the production hostname via SWA → Custom domains and update the API CORS allow-list.

---

## 5. CI/CD Pipeline (GitHub Actions)

The CI workflow lives in [.github/workflows/](../.github/workflows/) and runs on every push:

1. Checkout
2. Setup Node.js 20
3. `npm ci`
4. `npm run lint`
5. `npm test -- --runInBand`
6. `npm run build`
7. On the production branch, trigger the host's deployment step (Vercel project sync or SWA action).

`npm run build` invokes `prebuild` which runs `npm run test:ci`, so a failing test blocks the build even when CI is bypassed.

---

## 6. Post-Deploy Smoke Checklist

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `<prod-url>/` | Homepage renders categories without console errors |
| 2 | Open `<prod-url>/equipment/<knownCategoryId>` | Category page renders, tools fetched from API |
| 3 | Search bar | Typing returns results within 1s |
| 4 | Calculator on a detail page | Posts to API and shows a breakdown |
| 5 | `POST /api/auth/login` via the form | Sets the `rp.auth` cookie (httpOnly) |
| 6 | Open `/admin` as a customer | Redirected to `/` |
| 7 | Open `/admin` as an admin | Admin shell renders, dashboard loads |
| 8 | Submit a review | "Awaiting moderation" toast appears |
| 9 | Approve the review as moderator | Review appears on the public page |
| 10 | `curl -I <prod-url>/` | Confirms CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |

---

## 7. Rollback

- **Vercel** — promote any previous deployment from the Deployments tab.
- **Azure SWA** — redeploy the previous successful workflow run from GitHub Actions, or revert the commit and let the workflow rebuild.

Never edit the live build artefacts. Always roll back via the host's deployment history.

---

## 8. Local Production Build

Reproduce the production build locally before debugging a host-specific failure:

```bash
npm ci
npm run build
npm run start
```

The local server runs on `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` to your local API to exercise the same flow.

---

## 9. Operational Notes

- Set `AUTH_COOKIE_SECURE=true` in every non-local environment; the cookie must be `Secure` for SameSite=Lax to be honoured over HTTPS.
- Make sure the production API CORS allow-list includes the production frontend origin or browser calls will fail with CORS errors.
- Rotate the JWT signing secret only via the backend's process — the frontend never sees or rotates the secret.
- When the API DTO contract changes, update [types/api.ts](../types/api.ts) and rebuild before deploying.
