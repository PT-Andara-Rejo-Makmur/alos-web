"use client";

import {
  researchDomains,
  type ResearchDomainId,
  type ResearchDomainPermissionState,
} from "./models";

export interface RdPermissionPanelProps {
  readonly domainPermissions: Record<ResearchDomainId, ResearchDomainPermissionState>;
  readonly selectedDomain: ResearchDomainId;
  readonly onSelectDomain?: (domain: ResearchDomainId) => void;
}

export function RdPermissionPanel({
  domainPermissions,
  selectedDomain,
  onSelectDomain,
}: RdPermissionPanelProps) {
  return (
    <div
      className="rd-permission-panel"
      aria-labelledby="rd-permission-title"
      data-testid="rd-permission-panel"
    >
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">R&D DOMAIN GOVERNANCE</p>
          <h3 id="rd-permission-title">Empat Domain R&D & Status Otoritas Backend</h3>
        </div>
        <span className="status-pill status-pill--muted">Authority: Backend</span>
      </div>

      <div className="callout-banner callout-banner--governed" role="note">
        <strong>Aturan Batasan Otoritas:</strong>
        <p>
          Memilih atau membuka domain di frontend TIDAK PERNAH menambah permission, mengubah wewenang, atau memperluas scope. Status akses di bawah ini diproyeksikan murni berdasarkan wewenang yang diberikan oleh ALOS Backend.
        </p>
      </div>

      <div className="rd-domain-grid" role="list">
        {researchDomains.map((option) => {
          const perm = domainPermissions[option.id];
          const isSelected = selectedDomain === option.id;
          const status = perm?.status ?? "UNAVAILABLE";

          return (
            <div
              key={option.id}
              className={`rd-domain-card ${
                isSelected ? "rd-domain-card--selected" : ""
              } rd-domain-card--${status.toLowerCase()}`}
              role="listitem"
              data-testid={`rd-domain-card-${option.id}`}
            >
              <div className="rd-domain-card__header">
                <h4 className="rd-domain-card__title">{option.label}</h4>
                <span
                  className={`status-pill ${
                    status === "AUTHORIZED"
                      ? "status-pill--success"
                      : status === "DENIED"
                        ? "status-pill--danger"
                        : "status-pill--muted"
                  }`}
                >
                  {status === "AUTHORIZED"
                    ? "AUTHORIZED"
                    : status === "DENIED"
                      ? "DENIED"
                      : "UNAVAILABLE"}
                </span>
              </div>

              <p className="rd-domain-card__desc">
                Cakupan riset domain {option.label}.
              </p>

              <div className="rd-domain-card__footer">
                {perm?.requiredScope ? (
                  <span className="rd-domain-card__scope">
                    <strong>Scope Diperlukan:</strong> <code>{perm.requiredScope}</code>
                  </span>
                ) : null}
                <p className="rd-domain-card__reason">{perm?.reason}</p>

                {onSelectDomain ? (
                  <button
                    className={`button ${
                      isSelected ? "button--primary" : "button--secondary"
                    } button--small`}
                    type="button"
                    onClick={() => onSelectDomain(option.id)}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? "Dipilih untuk Request" : "Pilih Domain"}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
