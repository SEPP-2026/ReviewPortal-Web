# Frontend Image Handling

> Backend counterpart: [../../../ReviewPortal-API/docs/azure-blob-storage/README.md](../../../ReviewPortal-API/docs/azure-blob-storage/README.md).
>
> The API owns image storage (Azure Blob Storage). The Next.js client renders images via `next/image` against the blob URLs returned in DTOs. This document describes the client-side rules for ingesting, displaying, and uploading those images.

---

## 1. Source of Truth

All image URLs returned to the client come from the API:

- `Category.imageUrl`
- `ToolListItem.thumbnailUrl`
- `ToolDetail.images[].imageUrl`
- `AdminToolDetail.images[].imageUrl`

The URLs are absolute, stable, and HTTPS. The client must not rewrite them.

---

## 2. `next.config.ts` Allow-list

Remote image hosts must be explicitly allow-listed. See [../../next.config.ts](../../next.config.ts):

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.blob.core.windows.net' },
    { protocol: 'https', hostname: 'reviewportal.azureedge.net' }, // CDN if enabled
  ],
}
```

Rules:

- No wildcard `**` host. Each hostname is listed.
- Local development against an emulator (Azurite) uses `http://127.0.0.1` and is added only via a dev-only branch.
- When the API switches to a CDN, add the new hostname before deploying the change.

---

## 3. Using `<Image>` in Components

Every image rendered from API data uses `next/image`:

```tsx
import Image from 'next/image';

<Image
  src={tool.thumbnailUrl}
  alt={tool.name}
  width={480}
  height={320}
  sizes="(max-width: 768px) 100vw, 480px"
  className="rounded-md object-cover"
/>
```

Rules:

- Always pass `width` + `height`, or use `fill` inside a container with `relative` positioning.
- Always set `sizes` for responsive layouts to let Next.js pick the right candidate.
- `alt` is required and meaningful — the tool/category name, not "image".
- Decorative images use `alt=""` and `aria-hidden="true"` on a parent if needed.
- Use `priority` only on the hero/LCP image of a page.

---

## 4. Image Sizing Strategy

| Surface | Rendered size | `sizes` hint | Notes |
|---------|----------------|--------------|-------|
| Homepage `CategoryCard` | 320×200 desktop, full-width mobile | `(max-width: 640px) 100vw, 320px` | Six-up grid on desktop |
| `ToolCard` thumbnail | 360×240 desktop, full-width mobile | `(max-width: 768px) 100vw, 360px` | Three-up grid on desktop |
| `ToolGallery` main image | 800×600 desktop | `(max-width: 1024px) 100vw, 800px` | `priority` set when above-the-fold |
| `ToolGallery` thumbnail strip | 96×72 | `96px` | Tiny static size |
| Admin tools table | 64×64 | `64px` | Always served at native size |

---

## 5. Uploading Images (Admin Flow)

Image uploads always go through the backend proxy.

### 5.1 Create Tool (first image)

```ts
const formData = new FormData();
formData.append('name', values.name);
formData.append('description', values.description);
// ... other fields ...
formData.append('file', firstImage);

await apiClient.postMultipart('/admin/tools', formData);
```

The proxy forwards the multipart body to `POST /api/admin/tools` and attaches the auth cookie as a Bearer token server-side.

### 5.2 Additional Images

```ts
const formData = new FormData();
formData.append('file', file);
await apiClient.postMultipart(`/admin/tools/${toolId}/images`, formData);
```

### 5.3 Delete Image

```ts
await apiClient.delete(`/admin/tools/${toolId}/images/${imageId}`);
```

The UI must block the request when only one image remains (`AdminImageManager` enforces this before calling the API; the API also enforces it as a backstop).

---

## 6. Client-Side Validation

Before submitting a file, validate MIME type and size in the browser:

| Rule | Value | Reason |
|------|-------|--------|
| Allowed MIME | `image/jpeg`, `image/png`, `image/webp` | Matches the API's allow-list |
| Max size | 5 MB | Matches the API limit; prevents wasted upload bandwidth |
| Min dimensions | 320×240 | Avoids unusable thumbnails (UI guard only) |

Surface failures inline next to the file input; do not let the form submit until they pass.

---

## 7. Image Performance Tips

- Use `priority` only on the LCP candidate image of a route.
- For grids, set `loading="lazy"` (the default for non-priority images).
- Use `placeholder="blur"` + `blurDataURL` only when a low-quality placeholder is supplied by the API; never base64-encode a large preview client-side.
- When prefetching a category page on hover, do not prefetch its images — let `next/image` lazy-load them.

---

## 8. Failure Modes

| Failure | Handling |
|---------|----------|
| Image URL returns 404 | `<Image>` renders the broken-image icon; we set a fallback `onError` on hero images to swap to a placeholder asset in [../../public/](../../public/) |
| Image fails CSP | Add the host to `remotePatterns`; the failure shows up as a network error in the console |
| Upload fails with 413 (too large) | Surface the inline message and ask the user to resize |
| Upload fails with 415 (unsupported type) | Surface the inline message with the allowed types |
| Network failure | Toast + retry CTA |

---

## 9. Related Documents

- API blob storage configuration: [../../../ReviewPortal-API/docs/azure-blob-storage/README.md](../../../ReviewPortal-API/docs/azure-blob-storage/README.md)
- Image-related component code: [../../components/equipment](../../components/equipment), [../../components/admin](../../components/admin)
- Image fields in DTOs: [../STATE-AND-DATA-MODEL.md §2.1](../STATE-AND-DATA-MODEL.md#21-catalogue)
- Frontend security considerations for image hosts: [../security/](../security/)
