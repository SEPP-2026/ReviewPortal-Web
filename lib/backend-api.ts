const BACKEND_PROXY_BASE = "/api/backend";

export interface BackendPagedList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface BackendCategory {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  toolCount: number;
}

export interface BackendToolSummary {
  id: number;
  name: string;
  categoryName: string;
  startingPrice: number;
  startingPriceUnit: string;
  dailyRate: number;
  overallRating: number | null;
  reviewCount: number;
  hasEnoughReviewsToRate: boolean;
  ratingMessage: string | null;
  thumbnailUrl: string | null;
}

export interface BackendToolImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

export interface BackendTool {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  specialNotes: string | null;
  depositRequired: boolean;
  depositAmount: number | null;
  isActive: boolean;
  overallRating: number | null;
  reviewCount: number;
  hasEnoughReviewsToRate: boolean;
  ratingMessage: string | null;
  images: BackendToolImage[];
  createdDate: string;
  updatedDate: string;
}

export interface BackendAdminToolSummary {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  isActive: boolean;
  overallRating: number | null;
  reviewCount: number;
  hasEnoughReviewsToRate: boolean;
  ratingMessage: string | null;
  thumbnailUrl: string | null;
  updatedDate: string;
}

export interface BackendReviewComment {
  id: number;
  commenterName: string;
  commentText: string;
  status: string;
  createdDate: string;
}

export interface BackendCompanyResponse {
  id: number;
  responseText: string;
  staffName: string;
  createdDate: string;
  updatedDate: string;
}

export interface BackendReview {
  id: number;
  toolId: number;
  toolName: string;
  reviewerName: string;
  reviewText: string;
  equipmentRating: number;
  customerServiceRating: number;
  technicalSupportRating: number;
  afterSalesRating: number;
  valueForMoneyRating: number;
  overallRating: number;
  status: string;
  rejectionReason: string | null;
  createdDate: string;
  comments: BackendReviewComment[];
  companyResponse: BackendCompanyResponse | null;
}

export interface BackendToolReviews {
  toolId: number;
  averageOverallRating: number | null;
  totalApprovedReviews: number;
  emptyStateMessage: string | null;
  reviews: BackendPagedList<BackendReview>;
}

export interface BackendRentalCalculationRequest {
  startDateTime: string;
  endDateTime: string;
}

export interface BackendRentalCalculationResponse {
  toolName: string;
  startDateTime: string;
  endDateTime: string;
  breakdown: string;
  totalCost: number;
}

export interface BackendDashboardStats {
  totalActiveTools: number;
  totalInactiveTools: number;
  pendingModerationCount: number;
  reviewsPublishedThisMonth: number;
  topRatedTools: BackendToolRanking[];
  mostReviewedTools: BackendToolRanking[];
}

export interface BackendToolRanking {
  toolId: number;
  toolName: string;
  overallRating: number | null;
  reviewCount: number;
}

export interface BackendModerationItem {
  itemType: string;
  itemId: number;
  reviewId: number;
  toolId: number;
  toolName: string;
  authorName: string;
  text: string;
  submittedDate: string;
  status: string;
  equipmentRating: number | null;
  customerServiceRating: number | null;
  technicalSupportRating: number | null;
  afterSalesRating: number | null;
  valueForMoneyRating: number | null;
  overallRating: number | null;
}

export interface BackendReviewSummary {
  id: number;
  toolId: number;
  toolName: string;
  reviewTextSnippet: string;
  overallRating: number;
  status: string;
  rejectionReason: string | null;
  createdDate: string;
  hasCompanyResponse: boolean;
}

export interface CreateReviewPayload {
  reviewerName: string;
  reviewerEmail: string;
  reviewText: string;
  equipmentRating: number;
  customerServiceRating: number;
  technicalSupportRating: number;
  afterSalesRating: number;
  valueForMoneyRating: number;
}

export interface CreateCommentPayload {
  commenterName: string;
  commentText: string;
}

export interface CreateCompanyResponsePayload {
  responseText: string;
}

export interface ModerateReviewPayload {
  approved: boolean;
  rejectionReason?: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCategoryPayload {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface CreateToolPayload {
  categoryId: number;
  name: string;
  description: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  specialNotes?: string;
  depositRequired: boolean;
  depositAmount?: number;
}

export interface UpdateToolPayload {
  categoryId: number;
  name: string;
  description: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  specialNotes?: string;
  depositRequired: boolean;
  depositAmount?: number;
}

interface BackendProblemDetails {
  detail?: string;
  title?: string;
}

const buildQuery = (params: Record<string, string | number | undefined | null>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const getErrorMessage = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const details = value as BackendProblemDetails;
    return details.detail || details.title || "Request failed";
  }
  return "Request failed";
};

async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_PROXY_BASE}${path}`, init);

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    throw new Error(getErrorMessage(errorBody));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return undefined as T;
  }
}

const jsonBody = (payload: unknown): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

export const toCategorySlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ===== Categories =====
export const getCategories = () => backendFetch<BackendCategory[]>("/categories");

export const getFeaturedCategories = () =>
  backendFetch<BackendCategory[]>("/categories/featured");

export const getCategoryById = (id: number) =>
  backendFetch<BackendCategory>(`/categories/${id}`);

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
) => {
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

// ===== Tools =====
export const searchTools = (
  query: string,
  options: { page?: number; pageSize?: number } = {}
) => {
  const search = buildQuery({
    q: query,
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 24,
  });

  return backendFetch<BackendPagedList<BackendToolSummary>>(`/tools/search${search}`);
};

export const getToolById = (id: number) => backendFetch<BackendTool>(`/tools/${id}`);

export const calculateRental = (
  toolId: number,
  payload: BackendRentalCalculationRequest
) =>
  backendFetch<BackendRentalCalculationResponse>(
    `/tools/${toolId}/rental-calculation`,
    {
      method: "POST",
      ...jsonBody(payload),
    }
  );

// ===== Reviews =====
export const getToolReviews = (
  toolId: number,
  options: { page?: number; pageSize?: number } = {}
) => {
  const query = buildQuery({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 10,
  });

  return backendFetch<BackendToolReviews>(`/tools/${toolId}/reviews${query}`);
};

export const createToolReview = (toolId: number, payload: CreateReviewPayload) =>
  backendFetch<BackendReview>(`/tools/${toolId}/reviews`, {
    method: "POST",
    ...jsonBody(payload),
  });

// ===== Review comments =====
export const getReviewComments = (reviewId: number) =>
  backendFetch<BackendReviewComment[]>(`/reviews/${reviewId}/comments`);

export const createReviewComment = (
  reviewId: number,
  payload: CreateCommentPayload
) =>
  backendFetch<BackendReviewComment>(`/reviews/${reviewId}/comments`, {
    method: "POST",
    ...jsonBody(payload),
  });

// ===== Company response =====
export const createCompanyResponse = (
  reviewId: number,
  payload: CreateCompanyResponsePayload
) =>
  backendFetch<BackendCompanyResponse>(`/reviews/${reviewId}/response`, {
    method: "POST",
    ...jsonBody(payload),
  });

export const updateCompanyResponse = (
  reviewId: number,
  payload: CreateCompanyResponsePayload
) =>
  backendFetch<BackendCompanyResponse>(`/reviews/${reviewId}/response`, {
    method: "PUT",
    ...jsonBody(payload),
  });

export const deleteCompanyResponse = (reviewId: number) =>
  backendFetch<void>(`/reviews/${reviewId}/response`, { method: "DELETE" });

// ===== User reviews =====
export const getMyReviews = (
  options: { page?: number; pageSize?: number } = {}
) => {
  const query = buildQuery({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 10,
  });

  return backendFetch<BackendPagedList<BackendReviewSummary>>(`/users/me/reviews${query}`);
};

// ===== Admin: Dashboard =====
export const getDashboardStats = () =>
  backendFetch<BackendDashboardStats>("/admin/dashboard/stats");

// ===== Admin: Moderation =====
export const getPendingModerationReviews = (
  options: { page?: number; pageSize?: number } = {}
) => {
  const query = buildQuery({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
  });

  return backendFetch<BackendPagedList<BackendModerationItem>>(
    `/admin/moderation/pending${query}`
  );
};

export const moderateReview = (id: number, payload: ModerateReviewPayload) =>
  backendFetch<BackendReview>(`/admin/moderation/reviews/${id}`, {
    method: "PUT",
    ...jsonBody(payload),
  });

export const moderateComment = (id: number, payload: ModerateReviewPayload) =>
  backendFetch<BackendReviewComment>(`/admin/moderation/comments/${id}`, {
    method: "PUT",
    ...jsonBody(payload),
  });

// ===== Admin: Categories =====
export const createCategory = (payload: CreateCategoryPayload) =>
  backendFetch<BackendCategory>(`/admin/categories`, {
    method: "POST",
    ...jsonBody(payload),
  });

export const updateCategory = (id: number, payload: UpdateCategoryPayload) =>
  backendFetch<BackendCategory>(`/admin/categories/${id}`, {
    method: "PUT",
    ...jsonBody(payload),
  });

export const deleteCategory = (id: number) =>
  backendFetch<void>(`/admin/categories/${id}`, { method: "DELETE" });

// ===== Admin: Tools =====
export const getAdminTools = (
  options: {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    categoryId?: number;
    status?: string;
    sortBy?: string;
  } = {}
) => {
  const query = buildQuery({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
    searchTerm: options.searchTerm,
    categoryId: options.categoryId,
    status: options.status,
    sortBy: options.sortBy,
  });

  return backendFetch<BackendPagedList<BackendAdminToolSummary>>(
    `/admin/tools${query}`
  );
};

export const getAdminToolById = (id: number) =>
  backendFetch<BackendTool>(`/admin/tools/${id}`);

export const createTool = async (payload: CreateToolPayload, imageFile: File) => {
  const formData = new FormData();
  formData.append("CategoryId", String(payload.categoryId));
  formData.append("Name", payload.name);
  formData.append("Description", payload.description);
  formData.append("HourlyRate", String(payload.hourlyRate));
  formData.append("DailyRate", String(payload.dailyRate));
  formData.append("WeeklyRate", String(payload.weeklyRate));
  if (payload.specialNotes !== undefined && payload.specialNotes !== "") {
    formData.append("SpecialNotes", payload.specialNotes);
  }
  formData.append("DepositRequired", String(payload.depositRequired));
  if (payload.depositAmount !== undefined && payload.depositAmount !== null) {
    formData.append("DepositAmount", String(payload.depositAmount));
  }
  formData.append("file", imageFile);

  return backendFetch<BackendTool>(`/admin/tools`, {
    method: "POST",
    body: formData,
  });
};

export const updateTool = (id: number, payload: UpdateToolPayload) =>
  backendFetch<BackendTool>(`/admin/tools/${id}`, {
    method: "PUT",
    ...jsonBody(payload),
  });

export const setToolStatus = (id: number, isActive: boolean) =>
  backendFetch<BackendTool>(`/admin/tools/${id}/status`, {
    method: "PATCH",
    ...jsonBody({ isActive }),
  });

export const uploadToolImage = (id: number, imageFile: File) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  return backendFetch<BackendToolImage>(`/admin/tools/${id}/images`, {
    method: "POST",
    body: formData,
  });
};

export const deleteToolImage = (toolId: number, imageId: number) =>
  backendFetch<void>(`/admin/tools/${toolId}/images/${imageId}`, {
    method: "DELETE",
  });

// ===== Auth (password mgmt) =====
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface PasswordActionResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken: string | null;
  resetTokenExpiresAtUtc: string | null;
}

export const changePassword = (payload: ChangePasswordPayload) =>
  backendFetch<PasswordActionResponse>(`/auth/change-password`, {
    method: "POST",
    ...jsonBody(payload),
  });

export const forgotPassword = (payload: ForgotPasswordPayload) =>
  backendFetch<ForgotPasswordResponse>(`/auth/forgot-password`, {
    method: "POST",
    ...jsonBody(payload),
  });

export const resetPassword = (payload: ResetPasswordPayload) =>
  backendFetch<PasswordActionResponse>(`/auth/reset-password`, {
    method: "POST",
    ...jsonBody(payload),
  });
