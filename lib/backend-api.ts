// Backward-compatibility barrel.
// All types and functions have been moved to:
//   - types/backend.ts  (BackendXxx interfaces & payload types)
//   - lib/api/          (domain API functions, split by resource)
//
// New code should import directly from those locations:
//   import { getToolById, getToolReviews } from "@/lib/api"
//   import type { BackendTool } from "@/types/backend"
//
// Existing imports from "@/lib/backend-api" continue to work unchanged.

export * from "@/types/backend";
export * from "@/lib/api";
