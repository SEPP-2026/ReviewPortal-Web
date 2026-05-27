import { backendFetch, buildQuery } from "./_client";
import type {
  BackendCategory,
  BackendPagedList,
  BackendToolSummary,
} from "@/types/backend";

/** Convert a category display name to a URL-safe slug. */
export const toCategorySlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** GET /api/categories */
export const getCategories = (): Promise<BackendCategory[]> =>
  backendFetch<BackendCategory[]>("/categories");

/** GET /api/categories/featured */
export const getFeaturedCategories = (): Promise<BackendCategory[]> =>
  backendFetch<BackendCategory[]>("/categories/featured");

/** GET /api/categories/:id */
export const getCategoryById = (id: number): Promise<BackendCategory> =>
  backendFetch<BackendCategory>(`/categories/${id}`);

/** GET /api/categories/:id/tools */
export const getToolsByCategory = (
  categoryId: number,
  options: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    minPrice?: number;
    maxPrice?: number;
  } = {}
): Promise<BackendPagedList<BackendToolSummary>> => {
  const query = buildQuery({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 12,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    minPrice: options.minPrice,
    maxPrice: options.maxPrice,
  });
  return backendFetch<BackendPagedList<BackendToolSummary>>(
    `/categories/${categoryId}/tools${query}`
  );
};
