"use client";

import { useState } from "react";

import { Button, DataTable, Drawer, EmptyState, PageHeader, Section, Status } from "@/components/ui";

import { ExecutiveLayout } from "./executive-layout";
import styles from "./executive.module.css";

export interface StrategicInitiative {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly relatedTargetName: string;
  readonly ownerRole: string;
  readonly workspace: string;
  readonly lifecycleState: "DRAFT" | "UNDER_REVIEW" | "ACTIVE" | "ARCHIVED";
  readonly relatedProject?: string | null;
  readonly progress?: string | null;
  readonly sourceRef?: string | null;
  readonly evidenceRef?: string | null;
}

export function ExecutiveInitiativesPage({
  initiatives = [],
  workspaceKey,
}: Readonly<{ initiatives?: readonly StrategicInitiative[]; workspaceKey?: string }> = {}) {
  return (
    <ExecutiveLayout workspaceKey={workspaceKey}>
      {() => <InitiativesContent initiatives={initiatives} />}
    </ExecutiveLayout>
  );
}

function InitiativesContent({
  initiatives = [],
}: Readonly<{ initiatives?: readonly StrategicInitiative[] }>) {
  const [selectedInitiative, setSelectedInitiative] = useState<StrategicInitiative | null>(null);

  return (
    <div className={styles.page}>
      <PageHeader
        description="Hubungkan sasaran strategis dengan inisiatif prioritas perusahaan secara transparan."
        eyebrow="STRATEGI & KINERJA"
        title="Inisiatif Strategis"
      />

      <Section
        description="Daftar inisiatif prioritas korporasi yang terhubung dengan target kinerja."
        title="Inisiatif Prioritas"
      >
        {initiatives.length > 0 ? (
          <DataTable
            caption="Inisiatif strategis korporasi"
            columns={[
              { header: "Nama Inisiatif", key: "name", render: (item) => item.name },
              { header: "Target Terkait", key: "target", render: (item) => item.relatedTargetName },
              { header: "Penanggung Jawab", key: "owner", render: (item) => item.ownerRole },
              {
                header: "Status",
                key: "status",
                render: (item) => (
                  <Status
                    label={lifecycleLabel(item.lifecycleState)}
                    variant={item.lifecycleState === "ACTIVE" ? "success" : "neutral"}
                  />
                ),
              },
              {
                header: "Proyek Terkait",
                key: "project",
                render: (item) => item.relatedProject ?? "—",
              },
              {
                header: "Progres",
                key: "progress",
                render: (item) => item.progress ?? "—",
              },
            ]}
            getRowKey={(item) => item.id}
            rowAction={(item) => (
              <Button onClick={() => setSelectedInitiative(item)} size="sm" variant="ghost">
                Lihat Detail
              </Button>
            )}
            rows={initiatives}
          />
        ) : (
          <EmptyState
            description="Data inisiatif strategis belum terhubung. Inisiatif akan tampil setelah modul pelaksanaan dan kontrak integrasi aktif."
            title="Belum ada inisiatif yang dapat ditampilkan."
          />
        )}
      </Section>

      <Section title="Kesiapan Data Pelaksanaan">
        <div className={styles.readinessRow}>
          <Status label="Belum Tersedia" variant="neutral" />
          <p>
            Struktur arsitektur inisiatif telah diselaraskan dengan kebutuhan strategi.
            Data pelaksanaan rinci akan tersinkronisasi otomatis dari modul kerja universal saat integrasi data aktif.
          </p>
        </div>
      </Section>

      {/* Detail Drawer */}
      {selectedInitiative ? (
        <Drawer
          description="Informasi rinci arsitektur inisiatif strategis."
          onClose={() => setSelectedInitiative(null)}
          open
          title={selectedInitiative.name}
        >
          <div className={styles.sourceDetails}>
            <div className={styles.sourceDetail}>
              <dt>Nama Inisiatif</dt>
              <dd>{selectedInitiative.name}</dd>
            </div>
            <div className={styles.sourceDetail}>
              <dt>Deskripsi</dt>
              <dd>{selectedInitiative.description || "—"}</dd>
            </div>
            <div className={styles.sourceDetail}>
              <dt>Ruang Kerja</dt>
              <dd>{selectedInitiative.workspace}</dd>
            </div>
            <div className={styles.sourceDetail}>
              <dt>Target Terkait</dt>
              <dd>{selectedInitiative.relatedTargetName}</dd>
            </div>
            <div className={styles.sourceDetail}>
              <dt>Penanggung Jawab</dt>
              <dd>{selectedInitiative.ownerRole}</dd>
            </div>
            <div className={styles.sourceDetail}>
              <dt>Siklus Hidup</dt>
              <dd>
                <Status
                  label={lifecycleLabel(selectedInitiative.lifecycleState)}
                  variant={selectedInitiative.lifecycleState === "ACTIVE" ? "success" : "neutral"}
                />
              </dd>
            </div>
            <div className={styles.sourceDetail}>
              <dt>Sumber Rujukan</dt>
              <dd>{selectedInitiative.sourceRef ?? "—"}</dd>
            </div>
            <div className={styles.sourceDetail}>
              <dt>Bukti Pendukung</dt>
              <dd>{selectedInitiative.evidenceRef ?? "—"}</dd>
            </div>
          </div>
          <div className={styles.formActions}>
            <Button onClick={() => setSelectedInitiative(null)} variant="ghost">Tutup</Button>
          </div>
        </Drawer>
      ) : null}
    </div>
  );
}

function lifecycleLabel(state: string): string {
  const map: Record<string, string> = {
    DRAFT: "Draf",
    UNDER_REVIEW: "Dalam Peninjauan",
    APPROVED: "Disetujui",
    ACTIVE: "Aktif",
    SUPERSEDED: "Digantikan",
    ARCHIVED: "Diarsipkan",
  };
  return map[state] ?? state;
}
