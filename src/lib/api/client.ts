import { readCorrelationId, rememberCorrelationId } from "@/lib/correlation/store";
import type { IntegrationDiagnostic } from "@/lib/contracts";
import { userMessage } from "@/lib/presentation";

import { requireBackendBaseUrl } from "./config";
import { ApiError, ApiRequestError } from "./errors";

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
  const isBinary = body instanceof Blob;
  const isSerializedBody = typeof body === "string";
  const response = await fetch(url, {
    ...options,
    body:
      body === undefined
        ? undefined
        : isFormData || isSerializedBody || isBinary
          ? body
          : JSON.stringify(body),
    cache: options.cache ?? "no-store",
    credentials: options.credentials ?? "same-origin",
    headers: {
      Accept: "application/json",
      ...(body === undefined || isFormData || isBinary ? {} : { "Content-Type": "application/json" }),
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
  path: string = "",
  options: ApiRequestOptions = {},
): Promise<T> {
  if (path !== "" && (!path.startsWith("/") || path.startsWith("//"))) {
    throw new TypeError("Session path harus berupa absolute path lokal.");
  }
  const cleanPath = path === "/" ? "" : path;
  return requestJson<T>(`/api/session${cleanPath}`, options);
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
  const detail = error instanceof ApiRequestError ? error.detail : error instanceof Error ? error.message : "";
  if (["Tautan aktivasi tidak valid atau telah kedaluwarsa.", "Konfirmasi kata sandi tidak cocok.", "Kredensial tidak valid."].includes(detail)) return detail;
  if (error instanceof ApiRequestError) {
    if (error.status === 401) return "Sesi Anda sudah berakhir. Silakan masuk kembali.";
    if (error.status === 403) return "Anda tidak memiliki kewenangan untuk melakukan tindakan ini.";
    if (error.status === 409) return "Data atau status pengajuan sudah berubah. Buka ulang detail dan periksa tindakan yang masih tersedia.";
    if (error.status === 413) return "Berkas terlalu besar. Pilih berkas dengan ukuran maksimal 10 MB.";
    if (error.status === 415) return "Format berkas belum dapat diproses. Gunakan DOCX atau TXT.";
    if (error.status === 422) return "Periksa kelengkapan isian dan pilihan referensi sebelum mencoba kembali.";
    if (error.status >= 500) return "Layanan belum dapat memproses permintaan. Silakan coba kembali.";
    if (/[_A-Z]{4,}/.test(error.detail) || /scope|permission|authority|canonical|runtime|provider|correlation|hash|tool_id|run_id|workspace_id|actor|fetch|network|url|api\//i.test(error.detail)) return "Permintaan belum dapat diproses. Periksa isian dan akses ruang kerja Anda.";
    return userMessage(error.detail, "Permintaan belum dapat diproses. Periksa isian dan akses ruang kerja Anda.");
  }
  return error instanceof Error && /^(Sumber|Hubungan|Daftar|Berkas|Pilih|Data|Periksa|Nilai|Nama|Tanggal|Koneksi|Versi|Dokumen|Permintaan|Layanan|Anda)\b/.test(error.message)
    && !/fetch|network|TypeError|JSON|contract|backend|reference|api\/|url/i.test(error.message) && !/[_A-Z]{4,}/.test(error.message)
    ? error.message : "Koneksi belum dapat digunakan. Periksa koneksi lalu coba kembali.";
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
