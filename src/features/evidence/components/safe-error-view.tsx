"use client";

import { classifySafeError, type SafeErrorDetails } from "../models";

export interface SafeErrorViewProps {
  readonly error?: unknown;
  readonly safeDetails?: SafeErrorDetails;
  readonly fallbackCorrelationId?: string | null;
  readonly onRetry?: () => void;
}

export function SafeErrorView({
  error,
  safeDetails,
  fallbackCorrelationId = null,
  onRetry,
}: SafeErrorViewProps) {
  const details = safeDetails ?? classifySafeError(error, fallbackCorrelationId);

  return (
    <div
      className={`safe-error-panel safe-error-panel--${details.kind.toLowerCase()}`}
      role="alert"
      data-testid="safe-error-panel"
    >
      <div className="safe-error-panel__badge-row">
        <span className="status-pill status-pill--danger">{details.title}</span>
        {details.correlationId ? (
          <span className="status-pill status-pill--muted">
            Ref: {details.correlationId}
          </span>
        ) : null}
      </div>

      <p className="safe-error-panel__message">{details.message}</p>

      <div className="safe-error-panel__next-action">
        <strong>Tindakan yang disarankan:</strong>
        <p>{details.nextAction}</p>
      </div>

      {details.isRetryable && onRetry ? (
        <button
          className="button button--secondary safe-error-panel__retry"
          onClick={onRetry}
          type="button"
        >
          Coba Lagi
        </button>
      ) : null}
    </div>
  );
}
