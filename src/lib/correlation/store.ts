const CORRELATION_HEADER = "x-correlation-id";
const SESSION_KEY = "alos:last-correlation-id";

export function readCorrelationId(headers: Headers): string | undefined {
  return headers.get(CORRELATION_HEADER) ?? undefined;
}

export function rememberCorrelationId(correlationId: string | undefined): void {
  if (!correlationId || typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, correlationId);
}

export function getLastCorrelationId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.sessionStorage.getItem(SESSION_KEY) ?? undefined;
}
