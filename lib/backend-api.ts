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

interface BackendProblemDetails {
  detail?: string;
  title?: string;
}

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
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

  return response.json() as Promise<T>;
}

export const toCategorySlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getCategories = () => backendFetch<BackendCategory[]>("/categories");

export const getToolsByCategory = (
  categoryId: number,
  options: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}
) => {
  const query = buildQuery({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 12,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
  });

  return backendFetch<BackendPagedList<BackendToolSummary>>(
    `/categories/${categoryId}/tools${query}`
  );
};

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

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

export const getPendingModerationReviews = (
  options: { page?: number; pageSize?: number } = {}
) => {
  const query = buildQuery({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
  });

  return backendFetch<BackendPagedList<BackendReview>>(
    `/admin/moderation/pending${query}`
  );
};