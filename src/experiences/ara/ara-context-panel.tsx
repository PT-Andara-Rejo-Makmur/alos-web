"use client";

import { useEffect, useState } from "react";

import { EvidenceListView, SafeErrorView } from "@/features/evidence";

import {
  backendAraContextAdapter,
  type AraActiveContextProjection,
  type AraContextAdapter,
} from "./context-models";

export interface AraContextPanelProps {
  readonly adapter?: AraContextAdapter;
  readonly initialProjection?: AraActiveContextProjection;
}

export function AraContextPanel({
  adapter = backendAraContextAdapter,
  initialProjection,
}: AraContextPanelProps) {
  const [fetchedProjection, setFetchedProjection] =
    useState<AraActiveContextProjection | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialProjection);

  useEffect(() => {
    if (initialProjection) {
      return;
    }

    let active = true;
    const controller = new AbortController();

    adapter
      .loadContext(controller.signal)
      .then((data) => {
        if (active) {
          setFetchedProjection(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setFetchedProjection({ state: "UNAVAILABLE" });
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [adapter, initialProjection]);

  const projection = initialProjection ?? fetchedProjection;

  if (loading) {
    return (
      <section
        className="panel ara-context-panel ara-context-panel--loading"
        aria-label="ARA Context Panel"
        data-testid="ara-context-loading"
      >
        <div className="section-heading section-heading--compact">
          <div>
            <p className="eyebrow">ARA CONTEXT</p>
            <h3>Memuat Konteks Aktif dari Backend…</h3>
          </div>
          <span className="status-pill status-pill--muted">LOADING</span>
        </div>
        <p className="alos-loading-shell">
          Mengambil wewenang dan batasan konteks dari ALOS Backend…
        </p>
      </section>
    );
  }

  const state = projection?.state ?? "UNAVAILABLE";

  if (state === "DENIED") {
    return (
      <section
        className="panel ara-context-panel ara-context-panel--denied"
        aria-label="ARA Context Panel"
        data-testid="ara-context-denied"
      >
        <div className="section-heading section-heading--compact">
          <div>
            <p className="eyebrow">ARA CONTEXT</p>
            <h3>Akses Konteks Ditolak oleh Backend</h3>
          </div>
          <span className="status-pill status-pill--danger">DENIED</span>
        </div>
        <SafeErrorView
          fallbackCorrelationId={projection?.correlationId}
          safeDetails={{
            kind: "DENIED_SCOPE",
            title: "Otorisasi Konteks Ditolak",
            message:
              projection?.denialReason ??
              "Principal Anda tidak memiliki wewenang untuk membuka konteks aktif pada workspace ini.",
            nextAction:
              "Hubungi administrator atau workspace owner untuk memperoleh otorisasi yang sah.",
            correlationId: projection?.correlationId ?? null,
            isRetryable: false,
          }}
        />
      </section>
    );
  }

  if (state === "NEEDS_INFO") {
    return (
      <section
        className="panel ara-context-panel ara-context-panel--needs-info"
        aria-label="ARA Context Panel"
        data-testid="ara-context-needs-info"
      >
        <div className="section-heading section-heading--compact">
          <div>
            <p className="eyebrow">ARA CONTEXT</p>
            <h3>Informasi Tambahan Diperlukan</h3>
          </div>
          <span className="status-pill status-pill--warning">NEEDS_INFO</span>
        </div>
        <div className="ara-context-panel__needs-info-box">
          <p className="ara-context-panel__reason">
            {projection?.needsInfoReason ??
              "Backend memerlukan parameter tambahan sebelum konteks dapat diaktifkan."}
          </p>
          {projection?.workspaceId ? (
            <p className="ara-context-panel__meta">
              <strong>Workspace Target:</strong> {projection.workspaceId}
            </p>
          ) : null}
          <div className="safe-error-panel__next-action">
            <strong>Tindakan yang disarankan:</strong>
            <p>
              Tentukan parameter spesifik, batasan divisi, atau lingkup proyek
              yang diperlukan oleh Backend.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (state === "UNAVAILABLE") {
    return (
      <section
        className="panel ara-context-panel ara-context-panel--unavailable"
        aria-label="ARA Context Panel"
        data-testid="ara-context-unavailable"
      >
        <div className="section-heading section-heading--compact">
          <div>
            <p className="eyebrow">ARA CONTEXT</p>
            <h3>Konteks Backend Tidak Tersedia</h3>
          </div>
          <span className="status-pill status-pill--muted">UNAVAILABLE</span>
        </div>
        <SafeErrorView
          fallbackCorrelationId={projection?.correlationId}
          safeDetails={{
            kind: "UNAVAILABLE_SERVICE",
            title: "Konteks Server Tidak Tersedia",
            message:
              "Data konteks aktif tidak dapat diperoleh dari ALOS Backend. Sistem tidak mengklaim status aktif tanpa otorisasi server.",
            nextAction:
              "Periksa apakah service Backend sedang beroperasi dan terhubung dengan benar.",
            correlationId: projection?.correlationId ?? null,
            isRetryable: true,
          }}
        />
      </section>
    );
  }

  // ACTIVE STATE
  return (
    <section
      className="panel ara-context-panel ara-context-panel--active"
      aria-label="ARA Context Panel"
      data-testid="ara-context-active"
    >
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">ARA ACTIVE CONTEXT SUMMARY</p>
          <h3>Konteks Aktif Terverifikasi Server</h3>
        </div>
        <span className="status-pill status-pill--success">ACTIVE</span>
      </div>

      <div className="ara-context-summary-grid">
        <div className="ara-context-summary-grid__cell">
          <span className="label">Workspace</span>
          <span className="value">{projection?.workspaceId || "Default"}</span>
        </div>
        <div className="ara-context-summary-grid__cell">
          <span className="label">Tenant</span>
          <span className="value">{projection?.tenantId || "Default"}</span>
        </div>
        <div className="ara-context-summary-grid__cell">
          <span className="label">Klasifikasi Data</span>
          <span className="status-pill status-pill--muted">
            {projection?.dataClassification || "UNAVAILABLE"}
          </span>
        </div>
        <div className="ara-context-summary-grid__cell">
          <span className="label">Correlation ID</span>
          <span className="value-mono">
            {projection?.correlationId || "Tercatat di server"}
          </span>
        </div>
      </div>

      {projection?.scopeRefs && projection.scopeRefs.length > 0 ? (
        <div className="ara-context-panel__scopes">
          <span className="label">Scope Wewenang Backend:</span>
          <div className="pill-list">
            {projection.scopeRefs.map((scope) => (
              <span key={scope} className="status-pill status-pill--muted">
                {scope}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="ara-context-panel__evidence-section">
        <EvidenceListView
          evidenceRefs={projection?.evidenceRefs ?? []}
          title="Evidence & Rujukan Konteks"
        />
      </div>
    </section>
  );
}
