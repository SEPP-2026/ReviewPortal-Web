import type { ApiError } from "@/types/api";

export const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME?.trim() || "rp_auth";

const DEFAULT_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";

const normalizeApiBase = (baseUrl: string) => {
  if (!baseUrl) {
    return "https://reviewportal-api-escdb3f2epg8eeha.southeastasia-01.azurewebsites.net/api";
  }

  const trimmed = baseUrl.replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiBase(DEFAULT_API_URL);

interface ServerRequestOptions extends RequestInit {
  token?: string;
}

const getErrorMessage = (errorData: unknown, fallback: string) => {
  if (typeof errorData === "string") return errorData;
  if (errorData && typeof errorData === "object") {
    const errorObj = errorData as { title?: string; detail?: string };
    return errorObj.detail || errorObj.title || fallback;
  }
  return fallback;
};

const shouldAttachJsonContentType = (options: ServerRequestOptions) => {
  if (!options.body) return false;
  if (!options.headers) return true;

  const headers = new Headers(options.headers);
  return !headers.has("Content-Type");
};

export const serverRequest = async <T>(
  endpoint: string,
  options: ServerRequestOptions = {}
): Promise<T> => {
  const { token, headers, ...rest } = options;

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const requestHeaders = new Headers(headers);
  if (shouldAttachJsonContentType(options)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
  });

  if (!response.ok) {
    let errorData: unknown = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    const apiError: ApiError = {
      message: getErrorMessage(errorData, "Request failed"),
      statusCode: response.status,
      errors:
        typeof errorData === "object" && errorData && "errors" in errorData
          ? (errorData as { errors?: Record<string, string[]> }).errors
          : undefined,
    };

    throw apiError;
  }

  return response.json() as Promise<T>;
};

export const serverGet = <T>(
  endpoint: string,
  options?: ServerRequestOptions
) => serverRequest<T>(endpoint, { ...options, method: "GET" });

export const serverPost = <T>(
  endpoint: string,
  data?: unknown,
  options?: ServerRequestOptions
) =>
  serverRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data ?? {}),
  });

export const serverPut = <T>(
  endpoint: string,
  data?: unknown,
  options?: ServerRequestOptions
) =>
  serverRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data ?? {}),
  });

export const serverPatch = <T>(
  endpoint: string,
  data?: unknown,
  options?: ServerRequestOptions
) =>
  serverRequest<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(data ?? {}),
  });

export const serverDelete = <T>(
  endpoint: string,
  options?: ServerRequestOptions
) => serverRequest<T>(endpoint, { ...options, method: "DELETE" });
