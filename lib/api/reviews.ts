import { backendFetch, buildQuery, jsonBody } from "./_client";
import type {
  BackendCompanyResponse,
  BackendPagedList,
  BackendReview,
  BackendReviewComment,
  BackendReviewSummary,
  BackendToolReviews,
  CreateCommentPayload,
  CreateCompanyResponsePayload,
  CreateReviewPayload,
} from "@/types/backend";

// ─── Tool reviews ─────────────────────────────────────────────────────────────

/** GET /api/tools/:toolId/reviews */
export const getToolReviews = (
  toolId: number,
  options: { page?: number; pageSize?: number } = {}
): Promise<BackendToolReviews> => {
  const qs = buildQuery({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 10,
  });
  return backendFetch<BackendToolReviews>(`/tools/${toolId}/reviews${qs}`);
};

/** POST /api/tools/:toolId/reviews */
export const createToolReview = (
  toolId: number,
  payload: CreateReviewPayload
): Promise<BackendReview> =>
  backendFetch<BackendReview>(`/tools/${toolId}/reviews`, {
    method: "POST",
    ...jsonBody(payload),
  });

// ─── Review comments ──────────────────────────────────────────────────────────

/** GET /api/reviews/:reviewId/comments */
export const getReviewComments = (reviewId: number): Promise<BackendReviewComment[]> =>
  backendFetch<BackendReviewComment[]>(`/reviews/${reviewId}/comments`);

/** POST /api/reviews/:reviewId/comments */
export const createReviewComment = (
  reviewId: number,
  payload: CreateCommentPayload
): Promise<BackendReviewComment> =>
  backendFetch<BackendReviewComment>(`/reviews/${reviewId}/comments`, {
    method: "POST",
    ...jsonBody(payload),
  });

// ─── Company responses ────────────────────────────────────────────────────────

/** POST /api/reviews/:reviewId/response */
export const createCompanyResponse = (
  reviewId: number,
  payload: CreateCompanyResponsePayload
): Promise<BackendCompanyResponse> =>
  backendFetch<BackendCompanyResponse>(`/reviews/${reviewId}/response`, {
    method: "POST",
    ...jsonBody(payload),
  });

/** PUT /api/reviews/:reviewId/response */
export const updateCompanyResponse = (
  reviewId: number,
  payload: CreateCompanyResponsePayload
): Promise<BackendCompanyResponse> =>
  backendFetch<BackendCompanyResponse>(`/reviews/${reviewId}/response`, {
    method: "PUT",
    ...jsonBody(payload),
  });

/** DELETE /api/reviews/:reviewId/response */
export const deleteCompanyResponse = (reviewId: number): Promise<void> =>
  backendFetch<void>(`/reviews/${reviewId}/response`, { method: "DELETE" });

// ─── Authenticated user reviews ───────────────────────────────────────────────

/** GET /api/users/me/reviews  (requires auth) */
export const getMyReviews = (
  options: { page?: number; pageSize?: number } = {}
): Promise<BackendPagedList<BackendReviewSummary>> => {
  const qs = buildQuery({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 10,
  });
  return backendFetch<BackendPagedList<BackendReviewSummary>>(
    `/users/me/reviews${qs}`
  );
};
