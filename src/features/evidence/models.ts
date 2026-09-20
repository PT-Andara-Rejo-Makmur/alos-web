import { ApiRequestError } from "@/lib/api/errors";
import type {
  ContentTrust,
  DataClassification,
  EvidenceRef,
  EvidenceValidationStatus,
  FreshnessStatus,
  SourceReliability,
  SourceType,
} from "@/lib/contracts";

export type SafeErrorKind =
  | "BLOCKED_SOURCE"
  | "UNAVAILABLE_EVIDENCE"
  | "GENESIS_TIMEOUT"
  | "DENIED_SCOPE"
  | "UNAVAILABLE_SERVICE";

export interface SafeErrorDetails {
  readonly kind: SafeErrorKind;
  readonly title: string;
  readonly message: string;
  readonly nextAction: string;
  readonly correlationId: string | null;
  readonly isRetryable: boolean;
}

export interface SanitizedEvidenceItem {
  readonly evidenceId: string;
  readonly sourceId: string;
  readonly sourceType: SourceType | "UNKNOWN";
  readonly dataClassification: DataClassification | "UNKNOWN";
  readonly freshness: FreshnessStatus;
  readonly validationStatus: EvidenceValidationStatus | "UNKNOWN";
  readonly reliability: SourceReliability;
  readonly contentTrust: ContentTrust | "UNKNOWN";
  readonly anchor: string | null;
  readonly excerpt: string | null;
  readonly safeCitation: string;
  readonly capturedAt: string;
}

const SENSITIVE_PATTERNS = [
  /bearer\s+[a-zA-Z0-9._-]+/gi,
  /(?:token|secret|password|key|auth|credential)[=:]\s*['"]?[a-zA-Z0-9._-]+['"]?/gi,
  /https?:\/\/(?:localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|alos-backend|genesis-ai|otel-collector)[^"'\s]*/gi,
  /(?:Traceback\s+\(most\s+recent\s+call\s+last\):|^\s*at\s+[\w.<>]+\s+\(.*?\))/gim,
  /[A-Za-z]:\\[\w.-]+\\[\w.-]+/g,
  /\/(?:etc|var|tmp|home|usr|root)\/[\w.-]+/g,
];

export function sanitizeExcerpt(text?: string | null): string {
  if (!text) return "";
  let clean = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    clean = clean.replaceAll(pattern, "[TERLINDUNGI]");
  }
  return clean.trim();
}

export function sanitizeCitationLocator(locator?: string | null): string {
  if (!locator) return "Rujukan Backend";
  const trimmed = locator.trim();

  // If it is a clean web URL or identifier, parse and sanitize
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(trimmed);
      // Check if internal hostname or IP
      if (
        /(?:localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|alos-backend|genesis-ai|otel-collector)/i.test(
          url.hostname,
        )
      ) {
        return "Rujukan Terproteksi (Internal Backend)";
      }

      // Remove any sensitive query search parameters
      const sanitizedSearch = new URLSearchParams();
      for (const [key, val] of url.searchParams.entries()) {
        if (/token|secret|auth|key|password|credential/i.test(key)) {
          sanitizedSearch.set(key, "REDACTED");
        } else {
          sanitizedSearch.set(key, val);
        }
      }
      url.search = sanitizedSearch.toString();
      return url.hostname + url.pathname + (url.search ? url.search : "");
    }
  } catch {
    // If not a standard URL, fall through
  }

  // If locator is an internal or raw private URL, return masked reference
  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(trimmed)) {
      return "Rujukan Terproteksi (Internal Backend)";
    }
  }

  return trimmed;
}

export function projectEvidenceRef(ref: EvidenceRef): SanitizedEvidenceItem {
  const sourceType = ref.source_type ?? "UNKNOWN";
  const classification = ref.data_classification ?? "UNKNOWN";
  const freshness = ref.freshness ?? "UNKNOWN";
  const validationStatus = ref.validation_status ?? "UNKNOWN";
  const reliability = ref.reliability ?? "UNVERIFIED";
  const contentTrust = ref.content_trust ?? "UNKNOWN";

  return {
    evidenceId: ref.evidence_id,
    sourceId: ref.source_id,
    sourceType,
    dataClassification: classification,
    freshness,
    validationStatus,
    reliability,
    contentTrust,
    anchor: ref.anchor ? sanitizeExcerpt(ref.anchor) : null,
    excerpt: ref.excerpt ? sanitizeExcerpt(ref.excerpt) : null,
    safeCitation: sanitizeCitationLocator(ref.uri),
    capturedAt: ref.captured_at,
  };
}

export function classifySafeError(
  error: unknown,
  fallbackCorrelationId: string | null = null,
): SafeErrorDetails {
  let status: number | undefined;
  let code: string | undefined;
  let correlationId: string | null = fallbackCorrelationId;

  if (error instanceof ApiRequestError) {
    status = error.status;
    code = error.code;
    correlationId = error.correlationId ?? fallbackCorrelationId;
  } else if (error && typeof error === "object") {
    if ("status" in error && typeof error.status === "number") status = error.status;
    if ("code" in error && typeof error.code === "string") code = error.code;
    if ("correlation_id" in error && typeof error.correlation_id === "string") {
      correlationId = error.correlation_id;
    }
  }

  const normalizedCode = (code ?? "").toUpperCase();

  // 1. BLOCKED_SOURCE
  if (
    normalizedCode.includes("SOURCE_BLOCKED") ||
    normalizedCode.includes("EGRESS_BLOCKED") ||
    normalizedCode.includes("UNTRUSTED_SOURCE") ||
    normalizedCode.includes("PROHIBITED_SOURCE")
  ) {
    return {
      kind: "BLOCKED_SOURCE",
      title: "Sumber Data Diblokir",
      message:
        "Sumber data ini diblokir oleh kebijakan keamanan dan tata kelola ALOS Backend.",
      nextAction:
        "Gunakan sumber internal yang telah disetujui atau ajukan peninjauan whitelist domain kepada Administrator IT.",
      correlationId,
      isRetryable: false,
    };
  }

  // 2. UNAVAILABLE_EVIDENCE
  if (
    normalizedCode.includes("EVIDENCE_NOT_FOUND") ||
    normalizedCode.includes("EVIDENCE_UNAVAILABLE") ||
    normalizedCode.includes("EVIDENCE_EXPIRED") ||
    status === 404
  ) {
    return {
      kind: "UNAVAILABLE_EVIDENCE",
      title: "Evidence Tidak Tersedia",
      message:
        "Evidence atau artefak rujukan yang diminta tidak ditemukan atau telah kedaluwarsa pada Backend.",
      nextAction:
        "Muat ulang konteks aktif atau lakukan pendaftaran ulang sumber pengetahuan melalui antarmuka resmi.",
      correlationId,
      isRetryable: false,
    };
  }

  // 3. GENESIS_TIMEOUT
  if (
    normalizedCode.includes("GENESIS_TIMEOUT") ||
    normalizedCode.includes("GENESIS_UNAVAILABLE") ||
    status === 504 ||
    status === 503
  ) {
    return {
      kind: "GENESIS_TIMEOUT",
      title: "Batas Waktu Layanan AI (GENESIS)",
      message:
        "Layanan penalaran GENESIS mengalami timeout atau sedang tidak dapat dijangkau oleh Backend.",
      nextAction:
        "Tunggu beberapa saat dan ulangi permintaan Anda. Jika kendala terus berlanjut, hubungi tim dukungan.",
      correlationId,
      isRetryable: true,
    };
  }

  // 4. DENIED_SCOPE
  if (
    normalizedCode.includes("SCOPE_DENIED") ||
    normalizedCode.includes("CAPABILITY_NOT_AUTHORIZED") ||
    normalizedCode.includes("PERMISSION_DENIED") ||
    normalizedCode.includes("FORBIDDEN") ||
    status === 403
  ) {
    return {
      kind: "DENIED_SCOPE",
      title: "Akses Scope Ditolak",
      message:
        "Principal Anda tidak memiliki scope atau wewenang yang diizinkan oleh Backend untuk konteks ini.",
      nextAction:
        "Hubungi Pemilik Workspace atau Penanggung Jawab Divisi untuk meminta penambahan hak akses yang sesuai.",
      correlationId,
      isRetryable: false,
    };
  }

  // Fallback: UNAVAILABLE_SERVICE
  return {
    kind: "UNAVAILABLE_SERVICE",
    title: "Layanan Backend Tidak Tersedia",
    message:
      "Terjadi kendala saat berkomunikasi dengan ALOS Backend. Sistem tidak dapat memproses permintaan.",
    nextAction:
      "Periksa koneksi jaringan atau coba beberapa saat lagi.",
    correlationId,
    isRetryable: true,
  };
}
