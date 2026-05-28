import { backendFetch, buildQuery, jsonBody } from "./_client";
import type {
  BackendPagedList,
  BackendRentalCalculationRequest,
  BackendRentalCalculationResponse,
  BackendTool,
  BackendToolSummary,
} from "@/types/backend";

/** GET /api/tools/search */
export const searchTools = (
  query: string,
  options: { page?: number; pageSize?: number } = {}
): Promise<BackendPagedList<BackendToolSummary>> => {
  const qs = buildQuery({
    q: query,
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 24,
  });
  return backendFetch<BackendPagedList<BackendToolSummary>>(`/tools/search${qs}`);
};

/** GET /api/tools/:id */
export const getToolById = (id: number): Promise<BackendTool> =>
  backendFetch<BackendTool>(`/tools/${id}`);

/** POST /api/tools/:id/rental-calculation */
export const calculateRental = (
  toolId: number,
  payload: BackendRentalCalculationRequest
): Promise<BackendRentalCalculationResponse> =>
  backendFetch<BackendRentalCalculationResponse>(
    `/tools/${toolId}/rental-calculation`,
    { method: "POST", ...jsonBody(payload) }
  );
