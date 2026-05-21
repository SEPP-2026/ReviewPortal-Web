# Product Backlog — Web Client

> Backend counterpart: [../../../ReviewPortal-API/docs/agile/PRODUCT-BACKLOG.md](../../../ReviewPortal-API/docs/agile/PRODUCT-BACKLOG.md).
>
> The MoSCoW-prioritised backlog of frontend stories for the Shelton Tool-Hire Review Portal. The stories themselves are described in the epic documents; this page collects them into a single planning view.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🟢 | Done — implemented, tested, and merged |
| 🟡 | In progress |
| ⚪ | Not yet started |

---

## Must

| ID | Story | Epic | Points | Status |
|----|-------|------|--------|--------|
| US-1.1-FE | Homepage with featured categories | 1 | 5 | 🟢 |
| US-1.2-FE | Category browsing page | 1 | 5 | 🟢 |
| US-1.3-FE | Tool/service detail page | 1 | 5 | 🟢 |
| US-1.4-FE | Search for tools/services | 1 | 5 | 🟢 |
| US-1.5-FE | Rental cost calculator | 1 | 8 | 🟢 |
| US-1.8-FE | Type definitions and API client wiring | 1 | 5 | 🟢 |
| US-2.1-FE | Submit a review | 2 | 5 | 🟢 |
| US-2.2-FE | Display approved reviews on the tool page | 2 | 3 | 🟢 |
| US-2.3-FE | Overall rating display | 2 | 3 | 🟢 |
| US-2.4-FE | Comment on an approved review | 2 | 3 | 🟢 |
| US-2.5-FE | Company response to a review | 2 | 5 | 🟢 |
| US-2.6-FE | Account registration and login | 2 | 8 | 🟢 |
| US-3.1-FE | Admin login and route guard | 3 | 5 | 🟢 |
| US-3.2-FE | Add a new tool/service | 3 | 8 | 🟢 |
| US-3.3-FE | Edit tool details and pricing | 3 | 3 | 🟢 |
| US-3.4-FE | Manage tool images | 3 | 5 | 🟢 |
| US-3.5-FE | Activate or deactivate a tool | 3 | 3 | 🟢 |
| US-3.6-FE | Moderation queue | 3 | 8 | 🟢 |

**Must total:** 92 points · all 🟢

## Should

| ID | Story | Epic | Points | Status |
|----|-------|------|--------|--------|
| US-1.6-FE | Filter by price range | 1 | 3 | 🟢 |
| US-1.7-FE | Responsive mobile layout | 1 | 5 | 🟢 |
| US-1.9-FE | Loading and error boundaries | 1 | 3 | 🟢 |
| US-2.7-FE | My Reviews page | 2 | 3 | 🟢 |
| US-2.8-FE | Password reset flow | 2 | 3 | 🟢 |
| US-3.7-FE | Category management | 3 | 3 | 🟢 |
| US-3.9-FE | Admin loading and error discipline | 3 | 3 | 🟢 |

**Should total:** 23 points · all 🟢

## Could

| ID | Story | Epic | Points | Status |
|----|-------|------|--------|--------|
| US-3.8-FE | Admin dashboard | 3 | 5 | 🟢 |

**Could total:** 5 points · all 🟢

## Won't (out of scope for this submission)

| Item | Reason |
|------|--------|
| Internationalisation / RTL | Brief restricts the prototype to English |
| Real-time updates (WebSockets / SSE) | API does not expose a streaming endpoint |
| Booking / payment | Backend does not implement booking; out of brief |
| Visual regression snapshots | Tracked as future work (see [../PROJECT-COMPLETION-REPORT.md §7](../PROJECT-COMPLETION-REPORT.md#7-future-work-post-submission)) |
| Dark mode | Not requested by the brief |

---

## Velocity Snapshot

| Sprint | Planned points | Completed points |
|--------|----------------|-------------------|
| 1 | 23 | 23 |
| 2 | 36 | 36 |
| 3 | 27 | 27 |
| 4 | 34 | 34 |

Total: 120 points planned, 120 delivered. Evidence items remain open — see [../GAP-ANALYSIS.md](../GAP-ANALYSIS.md).
