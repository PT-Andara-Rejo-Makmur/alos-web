import { readCorrelationId, rememberCorrelationId } from "@/lib/correlation/store";
import type { IntegrationDiagnostic } from "@/lib/contracts";

import { requireBackendBaseUrl } from "./config";
import { ApiError } from "./errors";

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  readonly body?: unknown;
}

interface ContractErrorProjection {
  readonly code?: unknown;
  readonly message?: unknown;
  readonly correlation_id?: unknown;
}

async function requestJson<T>(url: string, options: ApiRequestOptions): Promise<T> {
  const body = options.body;
  const isFormData = body instanceof FormData;
  const isSerializedBody = typeof body === "string";
  const response = await fetch(url, {
    ...options,
    body:
      body === undefined
        ? undefined
        : isFormData || isSerializedBody
          ? body
          : JSON.stringify(body),
    cache: options.cache ?? "no-store",
    credentials: options.credentials ?? "same-origin",
    headers: {
      Accept: "application/json",
      ...(body === undefined || isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const correlationId = readCorrelationId(response.headers);
  rememberCorrelationId(correlationId);

  if (!response.ok) {
    let problem: ContractErrorProjection = {};
    try {
      problem = (await response.json()) as ContractErrorProjection;
    } catch {
      // Preserve a structured client error even when an intermediary returns non-JSON.
    }
    const problemCorrelationId =
      typeof problem.correlation_id === "string" ? problem.correlation_id : correlationId;
    const detail = apiErrorDetail(problem);
    throw new ApiError(
      response.status,
      detail ?? `ALOS Backend menolak request dengan status ${response.status}.`,
      problemCorrelationId ?? null,
      problem,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!path.startsWith("/")) {
    throw new TypeError("ALOS Backend request path harus diawali dengan '/'.");
  }
  return requestJson<T>(`${requireBackendBaseUrl()}${path}`, options);
}

export async function authenticatedApiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new TypeError("Authenticated Backend path harus berupa absolute path lokal.");
  }
  return requestJson<T>(`/api/backend${path}`, options);
}

export async function sessionApiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new TypeError("Session path harus berupa absolute path lokal.");
  }
  return requestJson<T>(`/api/session${path}`, options);
}

type QueryValue = string | number | boolean | null | undefined;

export function withQuery(path: string, query: Record<string, QueryValue>): string {
  if (!path.startsWith("/")) throw new TypeError("ALOS Backend query path harus diawali dengan '/'.");
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `${path}?${encoded}` : path;
}

export function apiMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.correlationId
      ? `${error.detail} Referensi: ${error.correlationId}`
      : error.detail;
  }
  return error instanceof Error ? error.message : "Terjadi kegagalan yang tidak diketahui.";
}

export function apiErrorDetail(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  if ("message" in payload && typeof payload.message === "string") return payload.message;
  if (!("detail" in payload)) return undefined;
  const detail = payload.detail;
  if (typeof detail === "string") return detail;
  if (!Array.isArray(detail)) return undefined;
  return detail
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      return "msg" in item && typeof item.msg === "string" ? item.msg : null;
    })
    .filter((item): item is string => Boolean(item))
    .join("; ");
}

export interface BackendHealthProjection {
  readonly status: string;
}

export function getBackendHealth(signal?: AbortSignal): Promise<BackendHealthProjection> {
  return apiRequest<BackendHealthProjection>("/health", { signal, cache: "no-store" });
}

export function getIntegrationDiagnostic(signal?: AbortSignal): Promise<IntegrationDiagnostic> {
  return apiRequest<IntegrationDiagnostic>("/api/v1/system/integration", {
    signal,
    cache: "no-store",
  });
}
