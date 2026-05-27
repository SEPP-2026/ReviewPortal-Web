// Internal HTTP client used by all API modules.
// Not exported from the public barrel — consumers use the domain functions.

const BACKEND_PROXY_BASE = "/api/backend";

interface BackendProblemDetails {
  detail?: string;
  title?: string;
}

function getErrorMessage(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const details = value as BackendProblemDetails;
    return details.detail || details.title || "Request failed";
  }
  return "Request failed";
}

export function buildQuery(
  params: Record<string, string | number | undefined | null>
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function jsonBody(payload: unknown): RequestInit {
  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

export async function backendFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
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
