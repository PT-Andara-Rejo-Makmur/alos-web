import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export const BACKEND_SESSION_COOKIE = "alos_backend_session";

function backendBaseUrl(): string {
  const configured =
    process.env.ALOS_BACKEND_INTERNAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_ALOS_API_BASE_URL?.trim();
  if (!configured) throw new Error("ALOS_BACKEND_INTERNAL_URL is not configured.");
  const url = new URL(configured);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Backend internal URL must use HTTP or HTTPS.");
  }
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function correlationId(request: NextRequest): string {
  return request.headers.get("x-correlation-id") ?? `corr_web_${randomUUID()}`;
}

function safePath(path: readonly string[], search: string): string {
  if (path.length === 0 || path.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new TypeError("Backend proxy path is invalid.");
  }
  return `/${path.map(encodeURIComponent).join("/")}${search}`;
}

function responseHeaders(response: Response): Headers {
  const headers = new Headers();
  for (const name of ["content-type", "x-correlation-id", "cache-control"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("cache-control", "no-store");
  return headers;
}

function structuredError(status: number, code: string, message: string, id: string): NextResponse {
  return NextResponse.json(
    { code, message, correlation_id: id, retryable: false },
    { status, headers: { "x-correlation-id": id, "cache-control": "no-store" } },
  );
}

async function forward(
  request: NextRequest,
  path: string,
  authorization?: string,
): Promise<Response> {
  const id = correlationId(request);
  const headers = new Headers({ Accept: "application/json", "X-Correlation-ID": id });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  if (authorization) headers.set("Authorization", authorization);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  try {
    return await fetch(`${backendBaseUrl()}${path}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return structuredError(
      503,
      "BACKEND_UNAVAILABLE",
      "ALOS Backend is unavailable.",
      id,
    );
  }
}

export async function proxyAuthenticatedBackend(
  request: NextRequest,
  pathSegments: readonly string[],
): Promise<Response> {
  const id = correlationId(request);
  const token = (await cookies()).get(BACKEND_SESSION_COOKIE)?.value;
  if (!token) {
    return structuredError(
      401,
      "AUTHENTICATION_REQUIRED",
      "A Backend session is required.",
      id,
    );
  }
  let path: string;
  try {
    path = safePath(pathSegments, request.nextUrl.search);
  } catch {
    return structuredError(400, "BACKEND_PATH_INVALID", "Backend path is invalid.", id);
  }
  const response = await forward(request, path, `Bearer ${token}`);
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders(response),
  });
}

export async function createBackendSession(request: NextRequest): Promise<Response> {
  const response = await forward(request, "/api/v1/auth/login");
  const headers = responseHeaders(response);
  if (!response.ok) {
    return new Response(response.body, { status: response.status, headers });
  }
  let payload: Record<string, unknown>;
  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch {
    return structuredError(
      502,
      "BACKEND_AUTH_INVALID",
      "Backend returned an invalid authentication response.",
      correlationId(request),
    );
  }
  const token = payload.access_token;
  if (typeof token !== "string" || !token) {
    return structuredError(
      502,
      "BACKEND_AUTH_INVALID",
      "Backend returned an invalid authentication response.",
      correlationId(request),
    );
  }
  const result = NextResponse.json(
    { authenticated: true, principal: payload.principal ?? null },
    { status: 200, headers },
  );
  result.cookies.set({
    name: BACKEND_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return result;
}

export async function readBackendSession(request: NextRequest): Promise<Response> {
  const token = (await cookies()).get(BACKEND_SESSION_COOKIE)?.value;
  if (!token) {
    return structuredError(
      401,
      "AUTHENTICATION_REQUIRED",
      "A Backend session is required.",
      correlationId(request),
    );
  }
  const response = await forward(request, "/api/v1/auth/whoami", `Bearer ${token}`);
  if (!response.ok) {
    const result = new Response(response.body, {
      status: response.status,
      headers: responseHeaders(response),
    });
    if (response.status === 401) {
      result.headers.append(
        "set-cookie",
        `${BACKEND_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      );
    }
    return result;
  }
  const principal = await response.json();
  return NextResponse.json(
    { authenticated: true, principal },
    { headers: responseHeaders(response) },
  );
}

export function deleteBackendSession(): NextResponse {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set({
    name: BACKEND_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
