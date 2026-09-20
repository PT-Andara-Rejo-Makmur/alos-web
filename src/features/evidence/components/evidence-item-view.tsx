"use client";

import type { SanitizedEvidenceItem } from "../models";

export interface EvidenceItemViewProps {
  readonly item: SanitizedEvidenceItem;
}

export function EvidenceItemView({ item }: EvidenceItemViewProps) {
  const isInternal = item.sourceType === "INTERNAL";
  const isExternal = item.sourceType === "EXTERNAL";

  return (
    <article
      className={`evidence-item ${
        isInternal
          ? "evidence-item--internal"
          : isExternal
            ? "evidence-item--external"
            : "evidence-item--unknown"
      }`}
      aria-labelledby={`evidence-heading-${item.evidenceId}`}
      data-testid="evidence-item"
    >
      <header className="evidence-item__header">
        <div className="evidence-item__badges">
          <span
            className={`status-pill ${
              isInternal
                ? "status-pill--success"
                : isExternal
                  ? "status-pill--warning"
                  : "status-pill--muted"
            }`}
          >
            {isInternal
              ? "INTERNAL (Tergovernansi)"
              : isExternal
                ? "EXTERNAL (Untrusted Input)"
                : "SOURCE UNKNOWN (Metadata tidak tersedia)"}
          </span>
          <span
            className={`status-pill ${
              item.freshness === "CURRENT"
                ? "status-pill--success"
                : item.freshness === "STALE"
                  ? "status-pill--warning"
                  : "status-pill--muted"
            }`}
          >
            Freshness: {item.freshness}
          </span>
          <span
            className={`status-pill ${
              item.validationStatus === "VALID"
                ? "status-pill--success"
                : item.validationStatus === "INVALID"
                  ? "status-pill--danger"
                  : "status-pill--muted"
            }`}
          >
            Status: {item.validationStatus}
          </span>
          <span className="status-pill status-pill--muted">
            {item.dataClassification}
          </span>
        </div>
        <h4 id={`evidence-heading-${item.evidenceId}`} className="evidence-item__title">
          {item.sourceId}
        </h4>
      </header>

      {item.excerpt ? (
        <blockquote className="evidence-item__excerpt">
          &ldquo;{item.excerpt}&rdquo;
        </blockquote>
      ) : null}

      <footer className="evidence-item__footer">
        <div className="evidence-item__meta">
          {item.anchor ? (
            <span className="evidence-item__anchor">
              <strong>Anchor:</strong> {item.anchor}
            </span>
          ) : null}
          <span className="evidence-item__citation">
            <strong>Rujukan:</strong> {item.safeCitation}
          </span>
          <span className="evidence-item__trust">
            <strong>Kepercayaan:</strong> {item.contentTrust} ({item.reliability})
          </span>
        </div>
      </footer>
    </article>
  );
}
