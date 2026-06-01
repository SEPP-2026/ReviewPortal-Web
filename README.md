# ReviewPortal Frontend

A modern Next.js 16 application for browsing, reviewing, and renting equipment, built with React 19, TypeScript, and TailwindCSS 4.

It pairs with the **ReviewPortal .NET API** and exposes an equipment catalogue, a review & rating system, a dynamic pricing calculator, bookings, and an admin moderation area.

## Tech Stack

### Core
- **Next.js** 16 (App Router, Turbopack dev server)
- **React** 19.2
- **TypeScript** 5
- **TailwindCSS** 4.1

### UI Components
- **Radix UI** — accessible component primitives (Alert Dialog, Avatar, Checkbox, Collapsible, Dialog, Dropdown Menu, Label, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Slot, Switch, Tabs, Tooltip)
- **Lucide React** & **Radix Icons** — icon libraries
- **cmdk** — command menu component
- **Sonner** — toast notifications
- **Recharts** — charts & data visualisation
- **react-quill-new** — rich text editor

### Forms & Validation
- **React Hook Form** 7
- **Zod** 3
- **@hookform/resolvers**
- **input-otp** — OTP input
- **react-day-picker** — date picker
- **libphonenumber-js** — phone number validation

### State & Utilities
- **Zustand** 5 — state management
- **date-fns** — date utilities
- **class-variance-authority**, **clsx**, **tailwind-merge** — styling utilities
- **react-hotkeys-hook** — keyboard shortcuts
- **tunnel-rat** — portal utilities
- **Sharp** — image optimization

### Tooling
- **Jest** + **Testing Library** (jsdom) — unit/component tests
- **ESLint** 9 + **eslint-config-next**
- **Prettier** 3
- **PostCSS**

## Project Structure

```
Review-Portal-Web/
├── app/                       # Next.js App Router
│   ├── api/                   # Route handlers (server-side)
│   │   ├── auth/              # login / logout / me / register
│   │   ├── backend/[...path]/ # Authenticated proxy to the .NET API
│   │   └── bookings/          # Booking endpoints
│   ├── account/              # User account (reviews, change-password)
│   ├── admin/                # Admin area (bookings, categories, moderation, tools)
│   ├── equipment/            # Equipment catalogue & detail pages ([id])
│   ├── reviews/              # Reviews listing
│   ├── calculator/           # Pricing calculator
│   ├── pricing/ services/ contact/   # Marketing/info pages
│   ├── login/ register/ forgot-password/ reset-password/  # Auth flows
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/                # React components (account, admin, equipment, feed, layout, sections, ui)
├── lib/                       # Application logic
│   ├── api/                   # Domain API layer (auth, categories, tools, reviews, admin)
│   ├── api-client.ts          # Low-level API client
│   ├── server-api.ts          # Server-side API helpers
│   ├── session.ts             # Auth/session helpers
│   ├── admin-guard.ts         # Admin route protection
│   ├── form-schemas.ts        # Zod schemas
│   └── utils.ts               # Utilities (cn, etc.)
├── hooks/                     # Custom hooks (use-current-user, use-debounce)
├── store/                     # Zustand stores
├── types/                     # TypeScript types (api.ts, backend.ts)
├── docs/                      # Design, requirements, testing & deployment docs
├── public/                    # Static assets
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── jest.config.mjs            # Jest configuration
└── package.json               # Dependencies & scripts
```

## Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm
- Access to the ReviewPortal .NET API (deployed, or running locally)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Configure `.env.local`:
   ```env
   # Client-side API base URL
   NEXT_PUBLIC_API_URL=https://reviewportal-api-escdb3f2epg8eeha.southeastasia-01.azurewebsites.net/api

   # Server-side API base URL (used by route handlers / proxy)
   API_URL=https://reviewportal-api-escdb3f2epg8eeha.southeastasia-01.azurewebsites.net/api

   # Name of the httpOnly auth cookie
   AUTH_COOKIE_NAME=rp_auth
   ```

   To point at a local backend, set both URLs to e.g. `http://localhost:5000/api`.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — build for production (runs `test:ci` first via `prebuild`)
- `npm run start` — start the production server
- `npm test` — run the Jest test suite
- `npm run test:watch` — run tests in watch mode
- `npm run test:ci` — run tests serially (CI)
- `npm run lint` — run ESLint
- `npm run typecheck` — type-check with `tsc --noEmit`
- `npm run format` — format with Prettier

## Authentication

Authentication is handled **server-side** to keep JWTs out of the browser. Auth route handlers set and read an httpOnly cookie (`rp_auth` by default):

- `POST /api/auth/login` — `{ email, password }`, sets the auth cookie
- `POST /api/auth/register` — create an account
- `POST /api/auth/logout` — clears the auth cookie
- `GET  /api/auth/me` — returns the current user
- `GET/POST/PATCH/PUT/DELETE /api/backend/[...path]` — authenticated proxy to the .NET API; attaches the cookie token on each request

The current user can be read on the client via the `use-current-user` hook, and admin-only routes are protected by `lib/admin-guard.ts`.

## API Integration

Domain calls live in `lib/api/` and are re-exported from a single barrel:

```typescript
import { getCategories, getToolById, getReviews } from "@/lib/api";
```

These modules call through the server-side proxy so requests are authenticated automatically. For lower-level needs, `lib/api-client.ts` and `lib/server-api.ts` are available.

## State Management

Zustand is used for client state:

```typescript
import { create } from "zustand";

interface Store {
  data: string;
  setData: (data: string) => void;
}

export const useStore = create<Store>((set) => ({
  data: "",
  setData: (data) => set({ data }),
}));
```

## Styling

The project uses **TailwindCSS 4** with CSS variables for theming and the **shadcn/ui** component pattern (Radix primitives styled with Tailwind, located in `components/ui/`).

### Using the `cn()` utility
```typescript
import { cn } from "@/lib/utils";

<div className={cn("base-class", condition && "conditional-class")} />
```

### Adding UI components
1. Create the component in `components/ui/`
2. Build on Radix UI primitives where applicable
3. Style with TailwindCSS and `class-variance-authority` variants
4. Export from the component file

## Testing

Tests use **Jest** with **Testing Library** in a jsdom environment.

```bash
npm test            # run all tests
npm run test:watch  # watch mode
```

The production build runs the suite first (`prebuild` → `test:ci`), so a failing test will block a build.

## Deployment

The app is deployed to **Azure App Service** via the GitHub Actions workflow in `.github/`. See `docs/DEPLOYMENT.md` for details.

```bash
npm run build
npm run start
```

## Documentation

Additional project documentation lives in [`docs/`](docs/), including design, requirements, testing strategy, and deployment guides.

## Contributing

1. Create a feature branch off `development`
2. Make your changes
3. Run `npm run lint`, `npm run typecheck`, and `npm test`
4. Submit a pull request

## License

This project is part of the ReviewPortal system.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
</content>
</invoke>
