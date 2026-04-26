import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/server-api";

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

const forwardRequest = async (request: NextRequest, path: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const url = new URL(request.url);
  const targetUrl = `${API_BASE_URL}/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const shouldIncludeBody = !["GET", "HEAD"].includes(request.method);
  const body = shouldIncludeBody ? await request.text() : undefined;

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: body && body.length > 0 ? body : undefined,
  });

  const contentType = response.headers.get("content-type") || "text/plain";
  const responseBody = await response.arrayBuffer();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": contentType,
    },
  });
};

const resolvePath = async (context: {
  params: Promise<Record<string, string | string[]>>;
}) => {
  const params = await context.params;
  const rawPath = params.path;
  if (!rawPath) return "";
  return Array.isArray(rawPath) ? rawPath.join("/") : rawPath;
};

export const GET = async (
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) => forwardRequest(request, await resolvePath(context));

export const POST = async (
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) => forwardRequest(request, await resolvePath(context));

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) => forwardRequest(request, await resolvePath(context));

export const PATCH = async (
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) => forwardRequest(request, await resolvePath(context));

export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) => forwardRequest(request, await resolvePath(context));
