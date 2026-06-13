// Backend entity types — mirror the shapes returned by the ReviewPortal API.
// These are kept separate from the generic API utilities in types/api.ts.

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

export interface BackendToolImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
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
  /** Server-computed helpfulness score (approved comments + rating weight). */
  helpfulCount: number;
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

// ─── Request payload types ────────────────────────────────────────────────────

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
