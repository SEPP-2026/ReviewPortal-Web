// Shared pagination shape + helper for the in-memory prototype stores
// (bookings, contact messages). Mirrors the backend PagedList contract so the
// frontend can treat all paged responses the same way.

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const MAX_PAGE_SIZE = 100;

/** Slice an in-memory array into a server-style paged result. */
export const paginate = <T>(
  all: readonly T[],
  page?: number,
  pageSize?: number,
): PagedResult<T> => {
  const safePage = Math.max(1, Math.floor(page ?? 1));
  const safeSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize ?? 10)),
  );
  const totalCount = all.length;
  const start = (safePage - 1) * safeSize;
  return {
    items: all.slice(start, start + safeSize),
    page: safePage,
    pageSize: safeSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / safeSize)),
  };
};
