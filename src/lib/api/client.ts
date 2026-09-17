import { readCorrelationId, rememberCorrelationId } from "@/lib/correlation/store";

import { requireBackendBaseUrl } from "./config";
import { ApiRequestError } from "./errors";

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  readonly body?: unknown;
}

export async function apiRequest<T>(path: `/${string}`, options: ApiRequestOptions = {}): Promise<T> {
  const response = await fetch(`${requireBackendBaseUrl()}${path}`, {
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: {
      Accept: "application/json",
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const correlationId = readCorrelationId(response.headers);
  rememberCorrelationId(correlationId);

  if (!response.ok) {
    throw new ApiRequestError(
      `ALOS Backend menolak request dengan status ${response.status}.`,
      response.status,
      correlationId,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export interface BackendHealthProjection {
  readonly status: string;
}

export function getBackendHealth(signal?: AbortSignal): Promise<BackendHealthProjection> {
  return apiRequest<BackendHealthProjection>("/health", { signal, cache: "no-store" });
}
