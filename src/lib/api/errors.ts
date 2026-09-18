export class ApiConfigurationError extends Error {
  constructor(message = "ALOS Backend belum dikonfigurasi.") {
    super(message);
    this.name = "ApiConfigurationError";
  }
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly correlationId: string | null;
  readonly code?: string;
  readonly detail: string;
  readonly payload: unknown;

  constructor(
    message: string,
    status: number,
    correlationId: string | null = null,
    code?: string,
    payload: unknown = null,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.correlationId = correlationId;
    this.code = code;
    this.detail = message;
    this.payload = payload;
  }
}

/** Compatibility error for migrated MVP-1 projections. */
export class ApiError extends ApiRequestError {
  constructor(status: number, detail: string, correlationId: string | null, payload: unknown = null) {
    const code =
      payload && typeof payload === "object" && "code" in payload && typeof payload.code === "string"
        ? payload.code
        : undefined;
    super(detail, status, correlationId, code, payload);
    this.name = "ApiError";
  }
}
