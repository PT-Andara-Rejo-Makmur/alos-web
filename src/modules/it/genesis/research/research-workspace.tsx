"use client";

import { useEffect, useState, type FormEvent } from "react";
import { SearchCheck, ShieldCheck } from "lucide-react";
import { apiMessage } from "@/lib/api";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  backendResearchAdapter,
  projectBackendDomainAccess,
  researchDomains,
  type ResearchDomainId,
  type ResearchDomainPermissionState,
  type ResearchRequestReceipt,
  type ResearchSourceMode,
} from "@/features/research";
import {
  ItDataTable,
  ItEmptyState,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusBadge,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./research.module.css";

const SOURCE_MODES: readonly { id: ResearchSourceMode; label: string; description: string }[] = [
  {
    id: "INTERNAL",
    label: "Internal",
    description: "Dibatasi tenant, workspace, permission, classification, dan evidence policy Backend.",
  },
  {
    id: "EXTERNAL",
    label: "External",
    description: "Untrusted input. Backend menentukan permission, egress, source policy, dan audit.",
  },
];

export function ResearchWorkspace() {
  const readiness = getModuleReadiness("research");

  const [domainAccess, setDomainAccess] = useState<
    Record<ResearchDomainId, ResearchDomainPermissionState>
  >(() => projectBackendDomainAccess());
  const [selectedDomain, setSelectedDomain] = useState<ResearchDomainId>("TECHNOLOGY");
  const [sourceMode, setSourceMode] = useState<ResearchSourceMode>("INTERNAL");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ResearchRequestReceipt | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await backendResearchAdapter.loadDomainAccess(controller.signal);
        setDomainAccess(projectBackendDomainAccess(res.domains));
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(apiMessage(cause));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  const currentPermission = domainAccess[selectedDomain];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim() || submitting) return;

    if (!currentPermission?.isAllowed) {
      setError(`Akses ke domain ${currentPermission?.label ?? selectedDomain} ditolak oleh backend.`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const result = await backendResearchAdapter.request({
        domain: selectedDomain,
        sourceMode,
        question: question.trim(),
      });
      setReceipt(result);
      setQuestion("");
    } catch (cause) {
      setError(apiMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.researchWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / GENESIS / RESEARCH"
        description="Controlled domain access, empirical research verification, and research evidence receipts."
        title="Research"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={SearchCheck}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Research Access Source Status */}
      <section aria-label="Research access status">
        <ItStatusRow
          detail={loading ? "VERIFYING" : currentPermission?.status ?? "UNAVAILABLE"}
          helper="Authority domain policy diproyeksikan langsung dari Backend research service."
          icon={ShieldCheck}
          label="Domain Authorization Source"
          status={
            loading
              ? "PARTIAL"
              : currentPermission?.status === "AUTHORIZED"
                ? "AVAILABLE"
                : "BLOCKED"
          }
        />
      </section>

      {error ? (
        <section aria-label="Error message">
          <ItNotice
            title="Terjadi kesalahan komunikasi dengan server"
            variant="warning"
          >
            {error}
          </ItNotice>
        </section>
      ) : null}

      {/* Domain Access Table */}
      <section aria-labelledby="domain-access-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Otoritas & Cakupan"
          id="domain-access-title"
          subtitle="Daftar domain riset berizin sesuai kebijakan keamanan Backend"
          title="Domain Access Control"
        />

        <ItDataTable
          ariaLabel="Tabel Otoritas Domain Riset"
          columns={["Domain", "Description", "Access Status", "Required Scope", "Reason"]}
          minWidth={880}
        >
          {researchDomains.map((domain) => {
            const perm = domainAccess[domain.id];
            const statusType =
              perm?.status === "AUTHORIZED"
                ? "AVAILABLE"
                : perm?.status === "DENIED"
                  ? "BLOCKED"
                  : "NOT_CONNECTED";

            return (
              <tr key={domain.id}>
                <td>
                  <strong>{domain.label}</strong>
                  <div className={styles.codeTag}>{domain.id}</div>
                </td>
                <td className={styles.descCell}>{domain.description}</td>
                <td>
                  <ItStatusBadge
                    label={perm?.status ?? "UNAVAILABLE"}
                    status={statusType}
                  />
                </td>
                <td>
                  {perm?.requiredScope ? (
                    <code className={styles.codeTag}>{perm.requiredScope}</code>
                  ) : (
                    <span className={styles.textMuted}>—</span>
                  )}
                </td>
                <td className={styles.reasonCell}>
                  {perm?.reason || "Menunggu verifikasi backend"}
                </td>
              </tr>
            );
          })}
        </ItDataTable>
      </section>

      {/* Research Request Form */}
      <section aria-labelledby="research-request-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Permintaan Riset"
          id="research-request-title"
          subtitle="Kirimkan pertanyaan riset untuk diproses oleh pipeline verifikasi GENESIS"
          title="Research Request"
        />

        <form className={styles.requestForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.fieldGroup}>
              <label htmlFor="domain-select">Domain Riset</label>
              <select
                id="domain-select"
                onChange={(e) => setSelectedDomain(e.target.value as ResearchDomainId)}
                value={selectedDomain}
              >
                {researchDomains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label} ({domainAccess[d.id]?.status ?? "UNAVAILABLE"})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="source-mode-select">Mode Sumber</label>
              <select
                id="source-mode-select"
                onChange={(e) => setSourceMode(e.target.value as ResearchSourceMode)}
                value={sourceMode}
              >
                {SOURCE_MODES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="question-input">Pertanyaan Riset Teknis</label>
            <textarea
              id="question-input"
              minLength={10}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Masukkan instruksi atau pertanyaan riset teknis yang ingin diverifikasi…"
              rows={4}
              value={question}
            />
          </div>

          <div className={styles.formActions}>
            <button
              className={styles.submitBtn}
              disabled={submitting || !question.trim() || !currentPermission?.isAllowed}
              type="submit"
            >
              {submitting ? "Memproses Riset…" : "Kirim Permintaan Riset"}
            </button>
            {!currentPermission?.isAllowed && !loading ? (
              <span className={styles.deniedNotice}>
                Domain {currentPermission?.label ?? selectedDomain} berstatus {currentPermission?.status ?? "DENIED"}. Pengiriman dinonaktifkan.
              </span>
            ) : null}
          </div>
        </form>
      </section>

      {/* Request Receipt / Evidence */}
      <section aria-labelledby="research-receipt-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Tanda Terima & Bukti"
          id="research-receipt-title"
          subtitle="Bukti tanda terima eksekusi riset yang diterbitkan oleh Backend"
          title="Request Receipt / Evidence"
        />

        {receipt ? (
          <div className={styles.receiptCard}>
            <div className={styles.receiptHeader}>
              <strong>Request #{receipt.request_id}</strong>
              <ItStatusBadge label={receipt.state} status="AVAILABLE" />
            </div>
            <div className={styles.receiptDetails}>
              <div>
                <span className={styles.receiptLabel}>Decision:</span>
                <code>{receipt.decision}</code>
              </div>
              <div>
                <span className={styles.receiptLabel}>Correlation Ref:</span>
                <code>{receipt.correlation_id}</code>
              </div>
            </div>
          </div>
        ) : (
          <ItEmptyState
            description="Belum ada tanda terima riset pada sesi ini. Kirimkan pertanyaan riset untuk menerbitkan bukti eksekusi."
            title="Tidak Ada Tanda Terima"
          />
        )}
      </section>
    </div>
  );
}
