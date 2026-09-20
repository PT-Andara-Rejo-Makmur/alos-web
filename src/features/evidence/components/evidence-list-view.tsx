"use client";

import { useMemo } from "react";

import type { EvidenceRef } from "@/lib/contracts";

import { projectEvidenceRef } from "../models";
import { EvidenceItemView } from "./evidence-item-view";

export interface EvidenceListViewProps {
  readonly evidenceRefs?: readonly EvidenceRef[];
  readonly title?: string;
}

export function EvidenceListView({
  evidenceRefs = [],
  title = "Evidence & Rujukan Sumber Backend",
}: EvidenceListViewProps) {
  const projectedItems = useMemo(() => {
    return evidenceRefs.map(projectEvidenceRef);
  }, [evidenceRefs]);

  const summary = useMemo(() => {
    const total = projectedItems.length;
    const internalCount = projectedItems.filter((i) => i.sourceType === "INTERNAL").length;
    const externalCount = projectedItems.filter((i) => i.sourceType === "EXTERNAL").length;
    const unknownCount = projectedItems.filter((i) => i.sourceType === "UNKNOWN").length;
    return { total, internalCount, externalCount, unknownCount };
  }, [projectedItems]);

  return (
    <section className="evidence-list-view" aria-label={title}>
      <div className="evidence-list-view__header">
        <h3 className="evidence-list-view__title">{title}</h3>
        <div className="evidence-list-view__summary">
          <span className="status-pill status-pill--muted">
            Total: {summary.total}
          </span>
          <span className="status-pill status-pill--success">
            Internal: {summary.internalCount}
          </span>
          <span className="status-pill status-pill--warning">
            Eksternal: {summary.externalCount}
          </span>
          <span className="status-pill status-pill--muted">
            Unknown: {summary.unknownCount}
          </span>
        </div>
      </div>

      {projectedItems.length === 0 ? (
        <p className="evidence-list-view__empty" role="status">
          Belum ada evidence atau rujukan yang diterbitkan oleh ALOS Backend untuk konteks ini.
        </p>
      ) : (
        <div className="evidence-list-view__items">
          {projectedItems.map((item) => (
            <EvidenceItemView key={item.evidenceId} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
