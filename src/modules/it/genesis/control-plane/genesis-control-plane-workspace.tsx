"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BadgeCheck,
  Blocks,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Fingerprint,
  FlaskConical,
  Minus,
  Play,
  RotateCcw,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { apiMessage } from "@/lib/api";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  backendFactoryAdapter,
  type FactoryAnalysisProjection,
} from "@/features/factory";
import {
  backendReleaseAdapter,
  formatCanonicalReleaseState,
  getAllowedReleaseActions,
  projectLifecycleStages,
  CANONICAL_LIFECYCLE_STAGES,
  type CanonicalReleaseAction,
  type DecisionOutcome,
  type GovernedReleaseProjection,
  type LifecycleProjection,
} from "@/features/releases";
import type { SessionActor } from "@/features/session";
import {
  ItDataTable,
  ItEmptyState,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusBadge,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./genesis-control-plane.module.css";

interface RegistryItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly icon: LucideIcon;
}

const TECHNICAL_REGISTRY: readonly RegistryItem[] = [
  { id: "agents", title: "Agen", description: "Registri agen dan batas eksekusi", route: "/workspace/it/genesis/agents", icon: Bot },
  { id: "skills", title: "Kapabilitas", description: "Definisi kapabilitas dan akses tools terkendali", route: "/workspace/it/genesis/skills", icon: Blocks },
  { id: "research", title: "Riset", description: "Sumber riset, batas tinjauan, dan bukti", route: "/workspace/it/genesis/research", icon: SearchCheck },
  { id: "models-tools", title: "Model & Tools", description: "Route model dan antarmuka integrasi", route: "/workspace/it/genesis/models-tools", icon: BrainCircuit },
];

const GOVERNANCE_REFERENCES: readonly RegistryItem[] = [
  { id: "evidence", title: "Bukti", description: "Rangkaian bukti dan jejak audit", route: "/workspace/it/governance/evidence", icon: Fingerprint },
  { id: "uat", title: "UAT & Gerbang", description: "Gate verifikasi dan pemeriksaan rilis", route: "/workspace/it/governance/uat", icon: FlaskConical },
  { id: "decisions", title: "Keputusan", description: "Persetujuan dan keputusan sistem", route: "/workspace/it/governance/decisions", icon: BadgeCheck },
];

const CAPABILITY_TYPES = [
  "AGENT",
  "SKILL",
  "WORKFLOW",
  "RULE",
  "VALIDATOR",
  "REPORT",
  "HUMAN_TASK",
  "SCHEDULE",
  "EVENT_HANDLER",
  "CONNECTOR_REQUIREMENT",
  "TOOL_REQUIREMENT",
  "COMPOSITE",
] as const;

function RegistryRows({ items }: { readonly items: readonly RegistryItem[] }) {
  return items.map((item) => {
    const Icon = item.icon;
    const readiness = getModuleReadiness(item.id);
    return (
      <tr key={item.id}>
        <td>
          <div className={styles.registryIdentity}>
            <Icon aria-hidden={true} size={18} />
            <span>{item.title}</span>
          </div>
        </td>
        <td className={styles.descriptionCell}>{item.description}</td>
        <td>
          <div className={styles.readinessCell}>
            <ItStatusBadge status={readiness.availability} />
            {readiness.blockReason && <code>{readiness.blockReason}</code>}
          </div>
        </td>
        <td>
          <Link className={styles.routeLink} href={item.route}>
            {item.route}
          </Link>
        </td>
      </tr>
    );
  });
}

interface GenesisControlPlaneWorkspaceProps {
  readonly actor?: SessionActor | null;
}

export function GenesisControlPlaneWorkspace({ actor }: GenesisControlPlaneWorkspaceProps) {
  const controlPlaneReadiness = getModuleReadiness("control-plane");

  // Factory requirement form state
  const [statement, setStatement] = useState("");
  const [preferredType, setPreferredType] = useState<string>("SKILL");
  const [factorySubmitting, setFactorySubmitting] = useState(false);
  const [factoryResult, setFactoryResult] = useState<FactoryAnalysisProjection | null>(null);
  const [factoryError, setFactoryError] = useState("");

  // Governed Release inspector state
  const [lookupReleaseId, setLookupReleaseId] = useState("");
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [currentRelease, setCurrentRelease] = useState<GovernedReleaseProjection | null>(null);
  const [releaseMessage, setReleaseMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal / Prompt payload state for release actions
  const [actionReason, setActionReason] = useState("");
  const [actionTargetReleaseId, setActionTargetReleaseId] = useState("");
  const [actionProcessing, setActionProcessing] = useState(false);

  // Authoritative Lifecycle Projection
  const lifecycleProjection: LifecycleProjection = currentRelease
    ? projectLifecycleStages(
        currentRelease.state,
        currentRelease.materiality,
        currentRelease.kill_switch_active,
      )
    : {
        activeStageKey: factoryResult ? "DRAFT" : "REQUIREMENT",
        activeStageLabel: factoryResult
          ? "Draf Terdaftar (Factory Selesai)"
          : "Requirement (Masukan Kebutuhan)",
        stageStatuses: {
          REQUIREMENT: factoryResult ? "COMPLETED" : "CURRENT",
          FACTORY: factoryResult ? "COMPLETED" : "PENDING",
          DRAFT: factoryResult ? "CURRENT" : "PENDING",
          AUTOMATED_QA: "PENDING",
          GENESIS_REVIEW: "PENDING",
          IT_DECISION: "PENDING",
          DIRECTOR_DECISION: "PENDING",
          RELEASE: "PENDING",
          ACTIVE: "PENDING",
        },
        isTerminalOrDeviation: false,
      };

  // Allowed actions based strictly on Backend authority (role AND permission)
  const allowedActions = currentRelease
    ? getAllowedReleaseActions(currentRelease, {
        roles: actor?.roles ?? [],
        permissions: actor?.permissions ?? [],
      })
    : [];

  // Factory requirement handler
  async function handleFactorySubmit(e: FormEvent) {
    e.preventDefault();
    if (!statement.trim() || statement.trim().length < 20 || factorySubmitting) return;

    try {
      setFactorySubmitting(true);
      setFactoryError("");
      const result = await backendFactoryAdapter.analyze({
        requirement: statement.trim(),
        preferred_capability_type: preferredType as (typeof CAPABILITY_TYPES)[number],
      });
      setFactoryResult(result);
    } catch (cause) {
      setFactoryError(apiMessage(cause));
    } finally {
      setFactorySubmitting(false);
    }
  }

  // Release lookup handler
  async function handleReleaseLookup(e: FormEvent) {
    e.preventDefault();
    const id = lookupReleaseId.trim();
    if (!id || releaseLoading) return;

    try {
      setReleaseLoading(true);
      setReleaseMessage(null);
      const res = await backendReleaseAdapter.get(id);
      setCurrentRelease(res);
    } catch (cause) {
      setReleaseMessage({ type: "error", text: apiMessage(cause) });
      setCurrentRelease(null);
    } finally {
      setReleaseLoading(false);
    }
  }

  // Release action execution handler
  async function handleExecuteAction(
    action: CanonicalReleaseAction,
    outcome?: DecisionOutcome,
  ) {
    if (!currentRelease || actionProcessing) return;

    try {
      setActionProcessing(true);
      setReleaseMessage(null);

      let payload: Record<string, unknown> = {};

      const generateDecisionId = () =>
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `dec_${Date.now()}`;

      if (action === "it-decision" && outcome) {
        payload = {
          decision_id: generateDecisionId(),
          outcome,
          rationale: actionReason.trim() || `Keputusan IT: ${outcome}`,
        };
      } else if (action === "director-decision" && outcome) {
        payload = {
          decision_id: generateDecisionId(),
          outcome,
          rationale: actionReason.trim() || `Keputusan Direktur: ${outcome}`,
        };
      } else if (action === "suspend" || action === "kill" || action === "clear-kill") {
        if (!actionReason.trim()) {
          setReleaseMessage({
            type: "error",
            text: "Alasan tindakan wajib diisi sebelum mengeksekusi aksi ini.",
          });
          setActionProcessing(false);
          return;
        }
        payload = { reason: actionReason.trim() };
      } else if (action === "rollback") {
        if (!actionTargetReleaseId.trim() || !actionReason.trim()) {
          setReleaseMessage({
            type: "error",
            text: "Target release ID dan alasan rollback wajib diisi.",
          });
          setActionProcessing(false);
          return;
        }
        payload = {
          target_release_id: actionTargetReleaseId.trim(),
          reason: actionReason.trim(),
        };
      }

      const updated = await backendReleaseAdapter.executeAction(
        currentRelease.release_id,
        action,
        payload as never,
      );
      setCurrentRelease(updated);
      setActionReason("");
      setActionTargetReleaseId("");
      setReleaseMessage({
        type: "success",
        text: `Aksi '${action}' berhasil dieksekusi oleh Backend. State rilis diperbarui: ${formatCanonicalReleaseState(updated.state)}.`,
      });
    } catch (cause) {
      setReleaseMessage({ type: "error", text: apiMessage(cause) });
    } finally {
      setActionProcessing(false);
    }
  }

  return (
    <div className={styles.genesisWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / GENESIS"
        description="Operasi AI teknis, registri agen, kontrol kapabilitas, riset, model, tools, dan tata kelola."
        title="Pusat Kendali GENESIS"
      />

      {/* 1. Status Integrasi */}
      <section aria-label="Status Pusat Kendali">
        <ItStatusRow
          detail={controlPlaneReadiness.blockReason}
          helper="Factory dan sebagian lifecycle rilis telah terhubung. Projection materialitas dan transisi publik menuju persetujuan Direktur belum lengkap."
          icon={ShieldCheck}
          label="Status Pusat Kendali"
          status={controlPlaneReadiness.availability}
        />
        <p className={styles.fieldHint} style={{ margin: "4px 0 0", paddingLeft: "4px" }}>
          Permukaan kontrol frontend tersedia. Integrasi operasional Backend belum terhubung.
        </p>
      </section>

      {/* 2. Requirement & Factory */}
      <section aria-labelledby="factory-requirement-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Stage 1 & 2 · Pabrikasi"
          id="factory-requirement-title"
          subtitle="Kirimkan pernyataan kebutuhan bisnis ke Factory Backend untuk resolusi REUSE atau CREATE DRAFT."
          title="Input Kebutuhan Pabrikasi (Factory)"
        />

        <div className={styles.technicalCard}>
          <form onSubmit={handleFactorySubmit}>
            <div className={styles.fieldGrid}>
              <div className={styles.fieldGroup} style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="requirement-statement">Pernyataan Kebutuhan (Min. 20 Karakter)</label>
                <textarea
                  id="requirement-statement"
                  minLength={20}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Deskripsikan kebutuhan otomatisasi bisnis atau tugas operasional secara spesifik…"
                  rows={3}
                  value={statement}
                />
                <p className={styles.fieldHint}>
                  Pernyataan kebutuhan dianalisis oleh Factory Backend untuk mencocokkan katalog eksisting atau mendaftarkan draf baru.
                </p>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="preferred-type-select">Preferensi Jenis Kapabilitas</label>
                <select
                  id="preferred-type-select"
                  onChange={(e) => setPreferredType(e.target.value)}
                  value={preferredType}
                >
                  {CAPABILITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.actionBar}>
              <button
                className={styles.btnPrimary}
                disabled={factorySubmitting || statement.trim().length < 20}
                type="submit"
              >
                <Sparkles size={14} />
                <span>{factorySubmitting ? "Menganalisis Kebutuhan…" : "Analisis Kebutuhan via Factory"}</span>
              </button>
            </div>
          </form>

          {factoryError ? (
            <ItNotice title="Gagal Menganalisis Kebutuhan" variant="warning">
              {factoryError}
            </ItNotice>
          ) : null}

          {/* 3. Hasil Factory */}
          {factoryResult ? (
            <div className={styles.factoryResultBox}>
              <div className={styles.factoryResultHeader}>
                <strong>Hasil Analisis Pabrikasi Backend</strong>
                <ItStatusBadge
                  label={factoryResult.decision === "REUSE" ? "REUSE (Gunakan Kembali)" : "CREATE (Buat Draf Baru)"}
                  status={factoryResult.decision === "REUSE" ? "AVAILABLE" : "PARTIAL"}
                />
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span>Keputusan Pabrikasi</span>
                  <strong>{factoryResult.decision}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Referensi Korelasi</span>
                  <code className={styles.codeRef}>{factoryResult.correlationId}</code>
                </div>
                <div className={styles.detailItem}>
                  <span>Status Registri</span>
                  <strong>{factoryResult.registryState ?? "—"}</strong>
                </div>
                <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
                  <span>Alasan Backend</span>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#2a4237" }}>{factoryResult.reason}</p>
                </div>
              </div>

              {factoryResult.decision === "REUSE" && factoryResult.existingCapabilities.length > 0 ? (
                <div>
                  <h4 style={{ margin: "8px 0", fontSize: "0.85rem", color: "#17382d" }}>
                    Kapabilitas Eksisting yang Ditemukan:
                  </h4>
                  <ItDataTable
                    ariaLabel="Kapabilitas eksisting"
                    columns={["ID Kapabilitas", "Versi", "Nama", "Tipe", "Tujuan"]}
                    minWidth={700}
                  >
                    {factoryResult.existingCapabilities.map((c) => (
                      <tr key={c.capabilityId}>
                        <td><code className={styles.codeRef}>{c.capabilityId}</code></td>
                        <td>{c.version}</td>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.capabilityType}</td>
                        <td>{c.purpose}</td>
                      </tr>
                    ))}
                  </ItDataTable>
                </div>
              ) : null}

              {factoryResult.decision === "CREATE" && factoryResult.draft ? (
                <div>
                  <h4 style={{ margin: "8px 0", fontSize: "0.85rem", color: "#17382d" }}>
                    Proposal Draf Baru Terdaftar di Backend:
                  </h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span>Identifier Draf</span>
                      <code className={styles.codeRef}>{factoryResult.draft.identifier}</code>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Versi</span>
                      <strong>{factoryResult.draft.version}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Tipe Kapabilitas</span>
                      <strong>{factoryResult.draft.capabilityType}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Tingkat Risiko</span>
                      <strong>{factoryResult.draft.risk}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Lifecycle State</span>
                      <ItStatusBadge label={factoryResult.draft.lifecycleState} status="AVAILABLE" />
                    </div>
                    <div className={styles.detailItem}>
                      <span>Kesiapan Registrasi</span>
                      <code>{factoryResult.draft.readiness}</code>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {/* 4. Inspeksi Rilis & 5. Siklus Hidup Rilis & 6. Aksi yang Diizinkan */}
      <section aria-labelledby="release-governance-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Stage 3 – 9 · Tata Kelola Rilis"
          id="release-governance-title"
          subtitle="Inspeksi status rilis berotoritas, verifikasi materiality, QA otomatis, review AI, dan eksekusi aksi yang diizinkan Backend."
          title="Inspeksi & Otoritas Rilis (Governed Release)"
        />

        <div className={styles.technicalCard}>
          <form onSubmit={handleReleaseLookup}>
            <div className={styles.fieldGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="release-id-input">ID Rilis (Release ID)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    id="release-id-input"
                    onChange={(e) => setLookupReleaseId(e.target.value)}
                    placeholder="Contoh: rel_agent_recon_v1"
                    style={{ flex: 1 }}
                    type="text"
                    value={lookupReleaseId}
                  />
                  <button
                    className={styles.btnSecondary}
                    disabled={releaseLoading || !lookupReleaseId.trim()}
                    type="submit"
                  >
                    {releaseLoading ? "Memuat…" : "Inspeksi Rilis"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {releaseMessage ? (
            <ItNotice
              title={releaseMessage.type === "success" ? "Operasi Berhasil" : "Kesalahan Operasi"}
              variant={releaseMessage.type === "success" ? "neutral" : "warning"}
            >
              {releaseMessage.text}
            </ItNotice>
          ) : null}

          {/* 5. Siklus Hidup Rilis (Stepper Kanonis) */}
          <div className={styles.stepperContainer}>
            <div className={styles.stepperHeader}>
              <span id="lifecycle-stepper-title">ALUR SIKLUS HIDUP KANONIS (STAGE PROGRESSION)</span>
              <span>
                Stage Aktif: <strong>{lifecycleProjection.activeStageLabel}</strong>
              </span>
            </div>

            <div className={styles.stepperTrack} role="list">
              {CANONICAL_LIFECYCLE_STAGES.map((stage, idx) => {
                const status = lifecycleProjection.stageStatuses[stage.key];
                const isCurrent = status === "CURRENT";
                const isCompleted = status === "COMPLETED";
                const isSkipped = status === "SKIPPED";
                const isDeviation = status === "DEVIATION";
                const isRejected = status === "REJECTED";
                const isOnHold = status === "ON_HOLD";
                const isBlocked = status === "BLOCKED";
                const isSuspended = status === "SUSPENDED";
                const isRolledBack = status === "ROLLED_BACK";
                const isUnknown = status === "UNKNOWN";

                const statusClass = isCurrent
                  ? styles.current
                  : isCompleted
                    ? styles.completed
                    : isSkipped
                      ? styles.skipped
                      : isDeviation
                        ? styles.deviation
                        : isRejected
                          ? styles.rejected
                          : isOnHold
                            ? styles.onHold
                            : isBlocked
                              ? styles.blocked
                              : isSuspended
                                ? styles.suspended
                                : isRolledBack
                                  ? styles.rolledBack
                                  : isUnknown
                                    ? styles.unknown
                                    : "";

                return (
                  <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div className={`${styles.stepNode} ${statusClass}`} role="listitem">
                      {isCompleted ? (
                        <CheckCircle2 aria-hidden={true} size={14} />
                      ) : isCurrent ? (
                        <Clock aria-hidden={true} size={14} />
                      ) : isDeviation || isRejected || isBlocked ? (
                        <AlertTriangle aria-hidden={true} size={14} />
                      ) : isSkipped ? (
                        <Minus aria-hidden={true} size={14} />
                      ) : (
                        <span>{stage.order}.</span>
                      )}
                      <span>{stage.label}</span>
                      {isSkipped ? <small>(Dilewati)</small> : null}
                      {isUnknown ? <small>(Belum Pasti)</small> : null}
                    </div>
                    {idx < CANONICAL_LIFECYCLE_STAGES.length - 1 ? (
                      <span aria-hidden={true} className={styles.stepDivider}>
                        →
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {lifecycleProjection.deviationNotice ? (
              <ItNotice title="Catatan Status Siklus Hidup" variant="neutral">
                {lifecycleProjection.deviationNotice}
              </ItNotice>
            ) : null}
          </div>

          {currentRelease ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span>ID Rilis</span>
                  <code className={styles.codeRef}>{currentRelease.release_id}</code>
                </div>
                <div className={styles.detailItem}>
                  <span>Subject / Versi</span>
                  <strong>
                    {currentRelease.subject_id} · v{currentRelease.subject_version}
                  </strong>
                </div>
                <div className={styles.detailItem}>
                  <span>State Kanonis Backend</span>
                  <div>
                    <ItStatusBadge
                      label={formatCanonicalReleaseState(currentRelease.state)}
                      status={
                        currentRelease.state === "ACTIVE"
                          ? "AVAILABLE"
                          : currentRelease.state.includes("APPROVED") || currentRelease.state === "RELEASED"
                            ? "AVAILABLE"
                            : currentRelease.state.includes("REJECTED") || currentRelease.state === "BLOCKED"
                              ? "BLOCKED"
                              : "PARTIAL"
                      }
                    />
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <span>Materialitas (Authority Gate)</span>
                  {currentRelease.materiality === "MATERIAL" ? (
                    <strong>MATERIAL (Wajib Persetujuan Direktur)</strong>
                  ) : currentRelease.materiality === "NON_MATERIAL" ? (
                    <strong>NON_MATERIAL (Cukup Otoritas IT)</strong>
                  ) : (
                    <div>
                      <strong>BELUM TERSEDIA</strong>
                      <p className={styles.fieldHint} style={{ margin: "2px 0 0" }}>
                        Materialitas rilis tidak disertakan pada projection Backend saat ini.
                      </p>
                    </div>
                  )}
                </div>
                <div className={styles.detailItem}>
                  <span>Kill Switch Aktif</span>
                  <strong style={{ color: currentRelease.kill_switch_active ? "#8b1e1e" : "#204033" }}>
                    {currentRelease.kill_switch_active ? "AKTIF (Sistem Dimatikan)" : "TIDAK"}
                  </strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Pernah Dirilis</span>
                  <strong>{currentRelease.ever_released ? "Ya" : "Belum"}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Referensi Korelasi</span>
                  <code className={styles.codeRef}>{currentRelease.correlation_id}</code>
                </div>
                <div className={styles.detailItem}>
                  <span>Review ID</span>
                  <code className={styles.codeRef}>{currentRelease.review_id || "—"}</code>
                </div>
                <div className={styles.detailItem}>
                  <span>Bukti Review Paket</span>
                  <div>
                    <strong>BELUM TERSEDIA</strong>
                    <p className={styles.fieldHint} style={{ margin: "2px 0 0" }}>
                      Referensi bukti review tidak tersedia pada projection rilis Backend.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Aksi yang Diizinkan Backend */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className={styles.cardHeader}>
                  <h3 style={{ fontSize: "0.85rem" }}>Aksi Otoritatif yang Diizinkan Backend</h3>
                  <small style={{ color: "#6e7670" }}>
                    Otoritas Aktor: {actor?.roles?.join(", ") || "BELUM TERSEDIA"}
                  </small>
                </div>

                {allowedActions.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Reason input for actions that require justification */}
                    {(allowedActions.includes("it-decision") ||
                      allowedActions.includes("director-decision") ||
                      allowedActions.includes("suspend") ||
                      allowedActions.includes("kill") ||
                      allowedActions.includes("clear-kill") ||
                      allowedActions.includes("rollback")) && (
                      <div className={styles.fieldGroup}>
                        <label htmlFor="action-reason-input">Catatan / Alasan Aksi (Wajib untuk penangguhan/kill/keputusan)</label>
                        <input
                          id="action-reason-input"
                          onChange={(e) => setActionReason(e.target.value)}
                          placeholder="Masukkan alasan atau justifikasi audit teknis…"
                          type="text"
                          value={actionReason}
                        />
                      </div>
                    )}

                    {allowedActions.includes("rollback") && (
                      <div className={styles.fieldGroup}>
                        <label htmlFor="action-target-input">Target Release ID Rollback</label>
                        <input
                          id="action-target-input"
                          onChange={(e) => setActionTargetReleaseId(e.target.value)}
                          placeholder="Masukkan release_id target versi sebelumnya…"
                          type="text"
                          value={actionTargetReleaseId}
                        />
                      </div>
                    )}

                    <div className={styles.actionBar}>
                      {allowedActions.includes("it-decision") ? (
                        <>
                          <button
                            className={styles.btnPrimary}
                            disabled={actionProcessing}
                            onClick={() => void handleExecuteAction("it-decision", "APPROVED")}
                            type="button"
                          >
                            <BadgeCheck size={14} />
                            <span>Setujui Keputusan IT</span>
                          </button>
                          <button
                            className={styles.btnSecondary}
                            disabled={actionProcessing}
                            onClick={() => void handleExecuteAction("it-decision", "RETURNED")}
                            type="button"
                          >
                            <span>Kembalikan (Perlu Revisi)</span>
                          </button>
                          <button
                            className={styles.btnDanger}
                            disabled={actionProcessing}
                            onClick={() => void handleExecuteAction("it-decision", "REJECTED")}
                            type="button"
                          >
                            <span>Tolak Rilis IT</span>
                          </button>
                        </>
                      ) : null}

                      {allowedActions.includes("director-decision") ? (
                        <>
                          <button
                            className={styles.btnPrimary}
                            disabled={actionProcessing}
                            onClick={() => void handleExecuteAction("director-decision", "APPROVED")}
                            type="button"
                          >
                            <BadgeCheck size={14} />
                            <span>Setujui (Direktur / Executive)</span>
                          </button>
                          <button
                            className={styles.btnSecondary}
                            disabled={actionProcessing}
                            onClick={() => void handleExecuteAction("director-decision", "RETURNED")}
                            type="button"
                          >
                            <span>Kembalikan Direktur</span>
                          </button>
                          <button
                            className={styles.btnDanger}
                            disabled={actionProcessing}
                            onClick={() => void handleExecuteAction("director-decision", "REJECTED")}
                            type="button"
                          >
                            <span>Tolak Direktur</span>
                          </button>
                        </>
                      ) : null}

                      {allowedActions.includes("release") ? (
                        <button
                          className={styles.btnPrimary}
                          disabled={actionProcessing}
                          onClick={() => void handleExecuteAction("release")}
                          type="button"
                        >
                          <Play size={14} />
                          <span>Terbitkan Rilis (Release)</span>
                        </button>
                      ) : null}

                      {allowedActions.includes("activate") ? (
                        <button
                          className={styles.btnPrimary}
                          disabled={actionProcessing}
                          onClick={() => void handleExecuteAction("activate")}
                          type="button"
                        >
                          <CheckCircle2 size={14} />
                          <span>Aktifkan Agen (Activate)</span>
                        </button>
                      ) : null}

                      {allowedActions.includes("suspend") ? (
                        <button
                          className={styles.btnSecondary}
                          disabled={actionProcessing}
                          onClick={() => void handleExecuteAction("suspend")}
                          type="button"
                        >
                          <span>Tangguhkan (Suspend)</span>
                        </button>
                      ) : null}

                      {allowedActions.includes("kill") ? (
                        <button
                          className={styles.btnDanger}
                          disabled={actionProcessing}
                          onClick={() => void handleExecuteAction("kill")}
                          type="button"
                        >
                          <ShieldAlert size={14} />
                          <span>Aktivasi Kill Switch</span>
                        </button>
                      ) : null}

                      {allowedActions.includes("clear-kill") ? (
                        <button
                          className={styles.btnPrimary}
                          disabled={actionProcessing}
                          onClick={() => void handleExecuteAction("clear-kill")}
                          type="button"
                        >
                          <CheckCircle2 size={14} />
                          <span>Pulihkan Kill Switch</span>
                        </button>
                      ) : null}

                      {allowedActions.includes("rollback") ? (
                        <button
                          className={styles.btnSecondary}
                          disabled={actionProcessing}
                          onClick={() => void handleExecuteAction("rollback")}
                          type="button"
                        >
                          <RotateCcw size={14} />
                          <span>Rollback ke Versi Target</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div>
                    {currentRelease.state === "IT_APPROVED" && !currentRelease.materiality ? (
                      <ItNotice title="Menunggu Informasi Otoritas" variant="neutral">
                        Action lanjutan tidak dapat ditentukan secara aman karena materialitas rilis belum tersedia dari Backend. Tahap lanjutan menunggu projection materialitas atau transisi Director dari Backend.
                      </ItNotice>
                    ) : null}
                    <p className={styles.noActionNote}>
                      Status: {formatCanonicalReleaseState(currentRelease.state)}. Tidak ada aksi manusia yang diizinkan untuk peran Anda saat ini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ItEmptyState
              description="Masukkan Release ID di atas untuk memeriksa status tata kelola rilis aktual dari Backend."
              title="Belum Ada Rilis yang Diinspeksi"
            />
          )}
        </div>
      </section>

      {/* 7. Submodules Technical Registry */}
      <section aria-labelledby="technical-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Kapabilitas"
          id="technical-registry-title"
          subtitle="Kesiapan ditentukan dari sumber modul terpusat."
          title="Registri Teknis"
        />
        <ItDataTable
          ariaLabel="Registri teknis GENESIS"
          columns={["Kapabilitas", "Cakupan Teknis", "Kesiapan", "Route Kanonis"]}
          minWidth={900}
        >
          <RegistryRows items={TECHNICAL_REGISTRY} />
        </ItDataTable>
      </section>

      {/* 8. Governance Reference Modules */}
      <section aria-labelledby="governance-references-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Kontrol"
          id="governance-references-title"
          title="Referensi Tata Kelola"
        />
        <ItDataTable
          ariaLabel="Referensi tata kelola GENESIS"
          columns={["Referensi", "Cakupan Teknis", "Kesiapan", "Route Kanonis"]}
          minWidth={900}
        >
          <RegistryRows items={GOVERNANCE_REFERENCES} />
        </ItDataTable>
      </section>
    </div>
  );
}
