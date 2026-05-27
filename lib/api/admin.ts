import { backendFetch, buildQuery, jsonBody } from "./_client";
import type {
  BackendAdminToolSummary,
  BackendCategory,
  BackendDashboardStats,
  BackendModerationItem,
  BackendPagedList,
  BackendReview,
  BackendReviewComment,
  BackendTool,
  BackendToolImage,
  CreateCategoryPayload,
  CreateToolPayload,
  ModerateReviewPayload,
  UpdateCategoryPayload,
  UpdateToolPayload,
} from "@/types/backend";

// ─── Dashboard ────────────────────────────────────────────────────────────────

/** GET /api/admin/dashboard/stats */
export const getDashboardStats = (): Promise<BackendDashboardStats> =>
  backendFetch<BackendDashboardStats>("/admin/dashboard/stats");

// ─── Moderation ───────────────────────────────────────────────────────────────

/** GET /api/admin/moderation/pending */
export const getPendingModerationReviews = (
  options: { page?: number; pageSize?: number } = {}
): Promise<BackendPagedList<BackendModerationItem>> => {
  const qs = buildQuery({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
  });
  return backendFetch<BackendPagedList<BackendModerationItem>>(
    `/admin/moderation/pending${qs}`
  );
};

/** PUT /api/admin/moderation/reviews/:id */
export const moderateReview = (
  id: number,
  payload: ModerateReviewPayload
): Promise<BackendReview> =>
  backendFetch<BackendReview>(`/admin/moderation/reviews/${id}`, {
    method: "PUT",
    ...jsonBody(payload),
  });

/** PUT /api/admin/moderation/comments/:id */
export const moderateComment = (
  id: number,
  payload: ModerateReviewPayload
): Promise<BackendReviewComment> =>
  backendFetch<BackendReviewComment>(`/admin/moderation/comments/${id}`, {
    method: "PUT",
    ...jsonBody(payload),
  });

// ─── Categories ───────────────────────────────────────────────────────────────

/** POST /api/admin/categories */
export const createCategory = (
  payload: CreateCategoryPayload
): Promise<BackendCategory> =>
  backendFetch<BackendCategory>("/admin/categories", {
    method: "POST",
    ...jsonBody(payload),
  });

/** PUT /api/admin/categories/:id */
export const updateCategory = (
  id: number,
  payload: UpdateCategoryPayload
): Promise<BackendCategory> =>
  backendFetch<BackendCategory>(`/admin/categories/${id}`, {
    method: "PUT",
    ...jsonBody(payload),
  });

/** DELETE /api/admin/categories/:id */
export const deleteCategory = (id: number): Promise<void> =>
  backendFetch<void>(`/admin/categories/${id}`, { method: "DELETE" });

// ─── Tools ────────────────────────────────────────────────────────────────────

/** GET /api/admin/tools */
export const getAdminTools = (
  options: {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    categoryId?: number;
    status?: string;
    sortBy?: string;
  } = {}
): Promise<BackendPagedList<BackendAdminToolSummary>> => {
  const qs = buildQuery({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
    searchTerm: options.searchTerm,
    categoryId: options.categoryId,
    status: options.status,
    sortBy: options.sortBy,
  });
  return backendFetch<BackendPagedList<BackendAdminToolSummary>>(`/admin/tools${qs}`);
};

/** GET /api/admin/tools/:id */
export const getAdminToolById = (id: number): Promise<BackendTool> =>
  backendFetch<BackendTool>(`/admin/tools/${id}`);

/** POST /api/admin/tools  (multipart form — includes primary image) */
export const createTool = (
  payload: CreateToolPayload,
  imageFile: File
): Promise<BackendTool> => {
  const formData = new FormData();
  formData.append("CategoryId", String(payload.categoryId));
  formData.append("Name", payload.name);
  formData.append("Description", payload.description);
  formData.append("HourlyRate", String(payload.hourlyRate));
  formData.append("DailyRate", String(payload.dailyRate));
  formData.append("WeeklyRate", String(payload.weeklyRate));
  if (payload.specialNotes) formData.append("SpecialNotes", payload.specialNotes);
  formData.append("DepositRequired", String(payload.depositRequired));
  if (payload.depositAmount != null)
    formData.append("DepositAmount", String(payload.depositAmount));
  formData.append("file", imageFile);

  return backendFetch<BackendTool>("/admin/tools", { method: "POST", body: formData });
};

/** PUT /api/admin/tools/:id */
export const updateTool = (
  id: number,
  payload: UpdateToolPayload
): Promise<BackendTool> =>
  backendFetch<BackendTool>(`/admin/tools/${id}`, {
    method: "PUT",
    ...jsonBody(payload),
  });

/** PATCH /api/admin/tools/:id/status */
export const setToolStatus = (id: number, isActive: boolean): Promise<BackendTool> =>
  backendFetch<BackendTool>(`/admin/tools/${id}/status`, {
    method: "PATCH",
    ...jsonBody({ isActive }),
  });

/** POST /api/admin/tools/:id/images */
export const uploadToolImage = (id: number, imageFile: File): Promise<BackendToolImage> => {
  const formData = new FormData();
  formData.append("file", imageFile);
  return backendFetch<BackendToolImage>(`/admin/tools/${id}/images`, {
    method: "POST",
    body: formData,
  });
};

/** DELETE /api/admin/tools/:toolId/images/:imageId */
export const deleteToolImage = (toolId: number, imageId: number): Promise<void> =>
  backendFetch<void>(`/admin/tools/${toolId}/images/${imageId}`, {
    method: "DELETE",
  });
