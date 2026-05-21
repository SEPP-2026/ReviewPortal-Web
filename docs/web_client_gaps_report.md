# Technical Specification & Developer Hand-off Report: Web Client Gaps & Bug Resolutions

This developer handbook serves as a complete technical specification for resolving **7 functional gaps** and **2 critical production bugs** in the **ReviewPortal-Web** Next.js codebase. Any developer can pick up this document and implement the solutions directly.

---

## Part 1: Critical Production Bugs (Newly Identified)

### 🚨 Bug 1: Images Failing to Load (Azure Blob & Fake Local Seed URLs)

#### The Problem
1. **Fake Local Domain Seed:** The default database seed SQL (`SeedEpic1CatalogueData.sql`) hardcodes category and tool image URLs to `https://cdn.reviewportal.local/` (e.g. `https://cdn.reviewportal.local/categories/access-lifting.jpg`). Because this domain does not exist in production or online environments, browsers fail to resolve them, causing broken thumbnail blocks and empty category card backgrounds.
2. **Missing CSP & Remote Patterns:** Production uploads go to Azure Blob containers or CDNs (such as `reviewportal.azureedge.net`), but `next.config.ts` lacks allow-lists for these domains in both its Content-Security-Policy (CSP) headers and `images.remotePatterns` configurations, blocking valid production images.

#### The Fix
1. **Dynamic Image Resolver:** Implement a front-end image url mapper utility (`resolveImageUrl`) in the API library that intercepts `cdn.reviewportal.local` URLs and dynamically substitutes them with stunning, high-resolution Unsplash images matching the respective category/tool names.
2. **CSP Update:** Add `https://*.azureedge.net` to the CSP image-source directives and `images.remotePatterns` in `next.config.ts`.

#### Exact Code Changes

##### 1. Modify [backend-api.ts](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/lib/backend-api.ts)
Add the following utility at the top of the file and export it:
```typescript
/**
 * Resolves a given image or thumbnail URL, dynamically replacing fake local seed domains
 * with stunning, premium Unsplash imagery.
 */
export const resolveImageUrl = (
  url: string | null | undefined,
  fallback: string = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
): string => {
  if (!url) return fallback;

  if (url.includes("cdn.reviewportal.local")) {
    const lower = url.toLowerCase();

    // 1. Category Mapping
    if (lower.includes("categories/building-construction")) {
      return "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("categories/cleaning-maintenance")) {
      return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("categories/garden-landscaping")) {
      return "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("categories/electrical-heating")) {
      return "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("categories/access-lifting")) {
      return "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("categories/breaking-drilling")) {
      return "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80";
    }

    // 2. Tool Mapping
    if (lower.includes("cement-mixer")) {
      return "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("concrete-saw")) {
      return "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("pressure-washer")) {
      return "https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("vacuum")) {
      return "https://images.unsplash.com/photo-1603796846097-bee99e4a60c9?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("rotavator")) {
      return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("chipper")) {
      return "https://images.unsplash.com/photo-1595275372297-f58c424a1b0c?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("dehumidifier")) {
      return "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("pat-tester")) {
      return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("ladder")) {
      return "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("hoist")) {
      return "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("drill")) {
      return "https://images.unsplash.com/photo-1608613304899-ea809852f6f1?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("breaker")) {
      return "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("sander")) {
      return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("prop")) {
      return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("carpet")) {
      return "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("scrubber")) {
      return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80";
    }
    if (lower.includes("hedge") || lower.includes("turf")) {
      return "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80";
    }

    // Default premium construction fallback
    return "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80";
  }

  return url;
};
```

##### 2. Modify [next.config.ts](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/next.config.ts)
Include `reviewportal.azureedge.net` wildcard and `api.dicebear.com` (avatars) in CSP directives and Next.js allowed domains:
```diff
 const cspDirectives = [
   "default-src 'self'",
   "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
   "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
-  "img-src 'self' data: blob: https://*.blob.core.windows.net https://images.unsplash.com",
+  "img-src 'self' data: blob: https://*.blob.core.windows.net https://images.unsplash.com https://api.dicebear.com https://*.azureedge.net",
   "font-src 'self' data: https://fonts.gstatic.com",
   "connect-src 'self' https:",
   "frame-ancestors 'none'",
   "form-action 'self'",
   "base-uri 'self'",
 ].join("; ");
```
```diff
 const nextConfig: NextConfig = {
   output: "standalone",
   images: {
     remotePatterns: [
       { protocol: "https", hostname: "*.blob.core.windows.net" },
       { protocol: "https", hostname: "images.unsplash.com" },
+      { protocol: "https", hostname: "api.dicebear.com" },
+      { protocol: "https", hostname: "*.azureedge.net" },
     ],
   },
```

##### 3. Modify View Components
Wrap all `src` tags that display category images, tool images, or thumbnails with `resolveImageUrl`.
* In [Categories.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/sections/Categories.tsx):
  ```typescript
  import { resolveImageUrl } from "@/lib/backend-api";
  // ...
  src={resolveImageUrl(category.imageUrl, FALLBACK_IMAGE)}
  ```
* In [FeaturedEquipment.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/sections/FeaturedEquipment.tsx):
  ```typescript
  import { resolveImageUrl } from "@/lib/backend-api";
  // ...
  image: resolveImageUrl(tool.thumbnailUrl, DEFAULT_IMAGE),
  ```
* In [EquipmentCatalogue.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/equipment/EquipmentCatalogue.tsx):
  ```typescript
  import { resolveImageUrl } from "@/lib/backend-api";
  // ...
  image: resolveImageUrl(tool.thumbnailUrl, DEFAULT_IMAGE),
  ```
* In [app/equipment/[id]/page.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/app/equipment/%5Bid%5D/page.tsx):
  ```typescript
  import { resolveImageUrl } from "@/lib/backend-api";
  // ...
  src={resolveImageUrl(selectedImageUrl || primaryImage)}
  // and
  src={resolveImageUrl(image.imageUrl)}
  ```
* In [AdminCategoriesManager.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/admin/AdminCategoriesManager.tsx):
  ```typescript
  import { resolveImageUrl } from "@/lib/backend-api";
  // ...
  src={resolveImageUrl(category.imageUrl)}
  ```
* In [AdminToolsManager.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/admin/AdminToolsManager.tsx):
  ```typescript
  import { resolveImageUrl } from "@/lib/backend-api";
  // ...
  src={resolveImageUrl(tool.thumbnailUrl)}
  ```

---

### 🚨 Bug 2: Category Edit Changes Do Not Persist

#### The Problem
In `AdminCategoriesManager.tsx` line 90, if `description` or `imageUrl` is left empty, the frontend assigns `undefined` to the payload keys. In JS, keys valued as `undefined` are completely omitted from JSON stringification. Some hosting environments (like Windows-based Azure App Service) or strict backend validation binders will reject the request or fail to persist the edit because of missing keys.

#### The Fix
1. Explicitly allow `null` values in `UpdateCategoryPayload` interface.
2. Replace `|| undefined` logic with `|| null` in the payload constructor in `AdminCategoriesManager.tsx`. This outputs explicit `"description": null` and `"imageUrl": null` values in the JSON request, fully aligning with C# Record bindings.

#### Exact Code Changes

##### 1. Modify [backend-api.ts](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/lib/backend-api.ts)
```typescript
export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface UpdateCategoryPayload {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}
```

##### 2. Modify [AdminCategoriesManager.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/admin/AdminCategoriesManager.tsx)
Update the payload building logic inside `handleSubmit` (approx. line 88):
```typescript
      const payload = {
        name: formState.name.trim(),
        description: formState.description.trim() || null,
        imageUrl: formState.imageUrl.trim() || null,
      };
```

---

## Part 2: Core Functional Gaps (Requirements Gaps)

### 📈 Gap 1: Rental Calculator Accepts Custom Date-Times & Validates Inputs (`FR-13`, `FR-17`)

#### The Problem
The current Rental Calculator in `app/equipment/[id]/page.tsx` only accepts a static numeric input for duration and quantity. It mocks the start and end dates from `new Date()` instead of accepting keyboard-accessible start and end date-time inputs and validating that `endDateTime > startDateTime`.

#### The Fix
Replace the numeric duration input field with two stylish date-time inputs (supporting popovers or native datetime controls) and perform validation checking before submitting to `calculateRental()`.

#### Exact Code Changes
Modify [app/equipment/[id]/page.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/app/equipment/%5Bid%5D/page.tsx):
* **State additions:**
  ```typescript
  const [startDateTime, setStartDateTime] = useState<string>("");
  const [endDateTime, setEndDateTime] = useState<string>("");
  const [dateError, setDateError] = useState<string | null>(null);
  ```
* **Validation check before calling API:**
  ```typescript
  const handleCalculate = async () => {
    setDateError(null);
    if (!startDateTime || !endDateTime) {
      setDateError("Please select both start and end date-times.");
      return;
    }
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setDateError("End date & time must be after start date & time.");
      return;
    }
    // Forward startDateTime and endDateTime in payload to calculateRental()
  };
  ```
* **UI Controls:** Render clean, responsive datetime-local input fields (fully styled matching the premium glassmorphism theme) and display `{dateError}` dynamically below them in a warnings banner.

---

### 🔍 Gap 2: Catalogue Price Range Filter (`FR-10`)

#### The Problem
The Equipment Catalogue does not provide any UI filters to filter results by price range, despite the backend already supporting `minPrice` and `maxPrice` search parameters.

#### The Fix
Introduce **Min Price ($)** and **Max Price ($)** input controls into the catalogue filter toolbar and bind them to the catalogue fetch query utilizing a custom debounce.

#### Exact Code Changes
Modify [EquipmentCatalogue.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/equipment/EquipmentCatalogue.tsx):
* Add price states:
  ```typescript
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  ```
* Pass `minPrice` and `maxPrice` (parsed as floats) to the `getToolsByCategory()` query.
* Debounce inputs using a React `useEffect` hook to prevent rapid duplicate calls while typing.

---

### 📑 Gap 3: Catalogue Pagination UI Controls (`FR-11`)

#### The Problem
The catalogue fetches tools in large, hardcoded chunks (e.g. 24 or 50 results) but provides no pagination navigation controls (Next/Prev page buttons) for users to browse additional pages.

#### The Fix
Introduce styled pagination controls under the tool card grid that dynamically increment/decrement page state and fetch page blocks accordingly.

#### Exact Code Changes
Modify [EquipmentCatalogue.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/equipment/EquipmentCatalogue.tsx):
* Track current page and total pages in state:
  ```typescript
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  ```
* Render controls:
  ```tsx
  <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6">
    <button
      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
      disabled={currentPage === 1}
      className="disabled:opacity-50 inline-flex items-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
    >
      Previous
    </button>
    <span className="text-sm text-slate-700">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
      className="disabled:opacity-50 inline-flex items-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
    >
      Next
    </button>
  </div>
  ```

---

### 🏠 Gap 4: Display All Categories on Homepage (`FR-01`)

#### The Problem
The landing page category section in `Categories.tsx` calls `getFeaturedCategories()`, returning only a small, hardcoded featured subset, instead of displaying all seeded categories.

#### The Fix
Import and invoke `getCategories()` inside the component so that all configured categories are displayed.

#### Exact Code Changes
Modify [Categories.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/sections/Categories.tsx):
* Replace import:
  ```typescript
  // Change getFeaturedCategories to getCategories
  import { getCategories } from "@/lib/backend-api";
  ```
* Inside `useEffect`, swap featured category fetch for the full category fetch:
  ```typescript
  const data = await getCategories();
  setCategories(data);
  ```

---

### 📝 Gaps 5 & 6: Review & Comment Text Character Minimums (`FR-20`, `FR-28`)

#### The Problem
The client code uses incorrect minimum bounds for submitting text, mismatching backend validators:
* **Review submit form:** validates for `length < 10` instead of the required `20` characters.
* **Comment submit form:** validates for `length < 3` instead of the required `10` characters.

#### The Fix
Update the validators on the respective submit handlers.

#### Exact Code Changes
* In [ReviewSubmitForm.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/equipment/ReviewSubmitForm.tsx) line 73:
  ```typescript
  if (form.reviewText.trim().length < 20) {
    setErrorMessage("Review text must be at least 20 characters.");
    return;
  }
  ```
* In [ReviewItem.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/equipment/ReviewItem.tsx) line 53:
  ```typescript
  if (commentText.trim().length < 10 || commenterName.trim().length < 2) {
    setCommentError("Please provide your name and a comment (min 10 chars).");
    return;
  }
  ```

---

### 🔒 Gap 7: Dicebear SVG Avatar Image CSP Block (`GAP-FE-04`)

#### The Problem
The client-side reviews section pulls default customer avatar images dynamically from `https://api.dicebear.com/`. However, this domain is blocked by default because it is missing from the Content Security Policy header.

#### The Fix
(Addressed in Bug 1 configuration changes above. Ensure both `next.config.ts` directives include `https://api.dicebear.com`).
