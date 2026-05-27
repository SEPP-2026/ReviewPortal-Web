import { backendFetch, jsonBody } from "./_client";
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  PasswordActionResponse,
  ResetPasswordPayload,
} from "@/types/backend";

/** POST /api/auth/change-password  (requires auth) */
export const changePassword = (
  payload: ChangePasswordPayload
): Promise<PasswordActionResponse> =>
  backendFetch<PasswordActionResponse>("/auth/change-password", {
    method: "POST",
    ...jsonBody(payload),
  });

/** POST /api/auth/forgot-password */
export const forgotPassword = (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> =>
  backendFetch<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    ...jsonBody(payload),
  });

/** POST /api/auth/reset-password */
export const resetPassword = (
  payload: ResetPasswordPayload
): Promise<PasswordActionResponse> =>
  backendFetch<PasswordActionResponse>("/auth/reset-password", {
    method: "POST",
    ...jsonBody(payload),
  });
