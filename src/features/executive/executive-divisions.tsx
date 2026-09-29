"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  DataTable,
  EmptyState,
  LoadingState,
  PageHeader,
  Section,
  Status,
  Tabs,
  type TabItem,
} from "@/components/ui";
import {
  ApprovalsPage,
  FindingsPage,
  ProjectsPage,
  ReportsPage,
  TasksPage,
} from "@/features/shared-work";

import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveStrategyData } from "./executive-data";
import {
  formatValue,
  observationFor,
  performanceLabel,
  performanceVariant,
  valueForObservation,
  verificationLabel,
} from "./executive-model";
import styles from "./executive.module.css";

const divisionRows = [
  ["Sales & Marketing", "sales"],
  ["Property & Teknik", "property"],
  ["Finance & Pajak", "finance"],
  ["Legal", "legal"],
  ["HR/GA", "hr"],
  ["IT", "it"],
] as const;

export function ExecutiveDivisionsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }> = {}) {
  return (
    <ExecutiveLayout workspaceKey={workspaceKey}>
      {(_session, activeKey) => {
        const base = `/workspace/${encodeURIComponent(activeKey)}`;
        return (
          <div className={styles.page}>
            <PageHeader
              description="Pantau kesiapan data, capaian target, serta keterkaitan pekerjaan tiap divisi sesuai ruang lingkup yang berwenang."
              eyebrow="ORGANISASI"
              title="Divisi"
            />
            <Section title="Status Divisi">
              <DataTable
                caption="Daftar divisi"
                columns={[
                  { header: "Divisi", key: "name", render: (row: readonly string[]) => row[0] },
                  { header: "Penanggung Jawab", key: "owner", render: () => "—" },
                  { header: "Target Utama", key: "target", render: () => "—" },
                  { header: "Kinerja", key: "performance", render: () => "—" },
                  { header: "Proyek Aktif", key: "projects", render: () => "—" },
                  { header: "Tugas Terlambat", key: "tasks", render: () => "—" },
                  { header: "Temuan", key: "findings", render: () => "—" },
                  { header: "Persetujuan", key: "approvals", render: () => "—" },
                  {
                    header: "Status Data",
                    key: "status",
                    render: () => <Status label="Belum Terhubung" variant="neutral" />,
                  },
                ]}
                getRowKey={(row) => row[1]}
                rowAction={(row) => (
                  <Link className={styles.detailLink} href={`${base}/divisions/${row[1]}`}>
                    Lihat Detail
                  </Link>
                )}
                rows={divisionRows}
              />
            </Section>
          </div>
        );
      }}
    </ExecutiveLayout>
  );
}

export function ExecutiveDivisionDetailPage({
  divisionKey,
  workspaceKey,
}: Readonly<{ divisionKey: string; workspaceKey?: string }>) {
  const division = divisionRows.find((row) => row[1] === divisionKey);
  const [activeTab, setActiveTab] = useState("summary");
  const { data, error, loading, sessionExpired } = useExecutiveStrategyData();

  const tabs: readonly TabItem[] = useMemo(() => [
    { id: "summary", label: "Ringkasan" },
    { id: "performance", label: "Kinerja" },
    { id: "projects", label: "Proyek" },
    { id: "tasks", label: "Tugas" },
    { id: "approvals", label: "Persetujuan" },
    { id: "findings", label: "Temuan" },
    { id: "reports", label: "Laporan" },
  ], []);

  // Filter strategy targets for this division if any exist (FAIL-CLOSED: scope.ref must strictly match)
  const divisionTargets = useMemo(() => {
    if (!data) return [];
    return data.targets.filter(
      (t) => t.scope.type === "DIVISION" && Boolean(t.scope.ref) && t.scope.ref === divisionKey,
    );
  }, [data, divisionKey]);

  // Authoritative division owner is not inferred from target; defaults strictly to "—"
  const divisionOwner = "—";

  return (
    <ExecutiveLayout workspaceKey={workspaceKey}>
      {(_session, activeKey) => {
        const base = `/workspace/${encodeURIComponent(activeKey)}`;
        return (
          <div className={styles.page}>
            <div style={{ marginBottom: "var(--alos-space-2)" }}>
              <Link className={styles.detailLink} href={`${base}/divisions`}>
                ← Kembali ke Daftar Divisi
              </Link>
            </div>

            <PageHeader
              description="Kinerja dan pekerjaan divisi ditampilkan terintegrasi sesuai ruang lingkup yang berwenang."
              eyebrow="ORGANISASI"
              metadata={`Unit Organisasi: ${division?.[0] ?? "Divisi"}`}
              title={division?.[0] ?? "Detail Divisi"}
            />

            {!division ? (
              <EmptyState
                action={<Link className={styles.detailLink} href={`${base}/divisions`}>Kembali ke Divisi</Link>}
                description="Divisi yang diminta tidak tersedia pada ruang kerja ini."
                title="Divisi tidak ditemukan."
              />
            ) : (
            <>
              <Tabs
                ariaLabel="Detail navigasi divisi"
                items={tabs}
                onValueChange={setActiveTab}
                value={activeTab}
              />

              {/* Tab 1: Ringkasan */}
              {activeTab === "summary" ? (
                <div className={styles.cascadeFlow}>
                  <Section title="Ringkasan Operasional Divisi">
                    <div className={styles.targetDetailGrid}>
                      <div className={styles.candidateCard}>
                        <span style={{ fontSize: "12px", color: "var(--alos-text-muted)" }}>Target Khusus</span>
                        <strong style={{ fontSize: "20px" }}>{loading || error || !data ? "—" : divisionTargets.length}</strong>
                        <span style={{ fontSize: "11px", color: "var(--alos-text-secondary)" }}>Sasaran teralokasi</span>
                      </div>
                      <div className={styles.candidateCard}>
                        <span style={{ fontSize: "12px", color: "var(--alos-text-muted)" }}>Status Sinkronisasi</span>
                        <Status label="Belum Terhubung" variant="neutral" />
                        <span style={{ fontSize: "11px", color: "var(--alos-text-secondary)" }}>Kanal kerja divisi</span>
                      </div>
                      <div className={styles.candidateCard}>
                        <span style={{ fontSize: "12px", color: "var(--alos-text-muted)" }}>Penanggung Jawab</span>
                        <strong style={{ fontSize: "14px" }}>{divisionOwner}</strong>
                        <span style={{ fontSize: "11px", color: "var(--alos-text-secondary)" }}>
                          {divisionOwner !== "—" ? `Peran: ${divisionOwner}` : "Belum ditentukan"}
                        </span>
                      </div>
                    </div>
                  </Section>

                  <Section title="Status Alokasi Data">
                    <div className={styles.readinessRow}>
                      <Status label="Belum Terhubung" variant="neutral" />
                      <p>
                        Integrasi data operasional divisi {division[0]} dalam proses penyambungan.
                        Gunakan tab di atas untuk menginspeksi Proyek, Tugas, Persetujuan, Temuan, dan Laporan divisi.
                      </p>
                    </div>
                  </Section>
                </div>
              ) : null}

              {/* Tab 2: Kinerja */}
              {activeTab === "performance" ? (
                <Section
                  description="Proyeksi kinerja dan pencapaian target yang dialokasikan khusus untuk divisi ini."
                  title={`Kinerja ${division[0]}`}
                >
                  {loading ? (
                    <LoadingState label={`Memuat kinerja ${division[0]}`} variant="table" />
                  ) : error || sessionExpired || !data ? (
                    <div className={styles.readinessRow}>
                      <Status label="Belum Terhubung" variant="neutral" />
                      <p>Kinerja belum dapat disimpulkan karena data strategi belum tersedia.</p>
                    </div>
                  ) : divisionTargets.length > 0 ? (
                    <DataTable
                      caption={`Kinerja ${division[0]}`}
                      columns={[
                        { header: "Sasaran", key: "name", render: (t) => t.name },
                        {
                          header: "Target",
                          key: "target",
                          render: (t) => valueForObservation(observationFor(t, "TARGET"), formatValue),
                        },
                        {
                          header: "Aktual",
                          key: "actual",
                          render: (t) => valueForObservation(observationFor(t, "ACTUAL"), formatValue),
                        },
                        {
                          header: "Perkiraan",
                          key: "forecast",
                          render: (t) => valueForObservation(observationFor(t, "FORECAST"), formatValue),
                        },
                        {
                          header: "Status",
                          key: "status",
                          render: (t) => (
                            <Status
                              label={performanceLabel(t.performance_state)}
                              variant={performanceVariant(t.performance_state)}
                            />
                          ),
                        },
                        {
                          header: "Verifikasi",
                          key: "verification",
                          render: (t) => verificationLabel(observationFor(t, "ACTUAL")?.verification_state),
                        },
                      ]}
                      getRowKey={(t) => t.target_id}
                      rows={divisionTargets}
                    />
                  ) : (
                    <div className={styles.readinessRow}>
                      <Status label="Belum ada data" variant="neutral" />
                      <p>Belum ada data target yang dialokasikan khusus untuk divisi ini.</p>
                    </div>
                  )}
                </Section>
              ) : null}

              {/* Tab 3: Proyek (Reuses Shared Work ProjectsPage with workspaceKey and embed) */}
              {activeTab === "projects" ? (
                <ProjectsPage embed workspaceKey={divisionKey} />
              ) : null}

              {/* Tab 4: Tugas (Reuses Shared Work TasksPage with workspaceKey and embed) */}
              {activeTab === "tasks" ? (
                <TasksPage embed workspaceKey={divisionKey} />
              ) : null}

              {/* Tab 5: Persetujuan (Reuses Shared Work ApprovalsPage with workspaceKey and embed) */}
              {activeTab === "approvals" ? (
                <ApprovalsPage embed workspaceKey={divisionKey} />
              ) : null}

              {/* Tab 6: Temuan (Reuses Shared Work FindingsPage with workspaceKey and embed) */}
              {activeTab === "findings" ? (
                <FindingsPage embed workspaceKey={divisionKey} />
              ) : null}

              {/* Tab 7: Laporan (Reuses Shared Work ReportsPage with workspaceKey and embed) */}
              {activeTab === "reports" ? (
                <ReportsPage embed workspaceKey={divisionKey} />
              ) : null}
            </>
          )}
        </div>
        );
      }}
    </ExecutiveLayout>
  );
}
