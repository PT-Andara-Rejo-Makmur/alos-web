export class ApiConfigurationError extends Error {
  constructor(message = "ALOS Backend belum dikonfigurasi.") {
    super(message);
    this.name = "ApiConfigurationError";
  }
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly correlationId?: string;

  constructor(message: string, status: number, correlationId?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.correlationId = correlationId;
  }
}
