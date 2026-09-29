"use client";

import { PageHeader, Section, Metric, DataTable, type DataTableColumn } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertySourceNote, PropertyUnavailableState } from "../shared/property-ui";
import styles from "../property.module.css";

const metrics = ["Progress Fisik", "Schedule Health", "Unit Readiness", "Quality State", "Financial Visibility", "Handover Readiness"] as const;
interface ProjectHealthRow { readonly recordId: string; readonly project: string; readonly progress: string; readonly schedule: string; readonly quality: string; readonly readiness: string; }
const projectHealthRows: readonly ProjectHealthRow[] = [];
const projectHealthColumns: readonly DataTableColumn<ProjectHealthRow>[] = [
  { header: "Project", key: "project", render: (row) => row.project },
  { header: "Progress", key: "progress", render: (row) => row.progress },
  { header: "Schedule", key: "schedule", render: (row) => row.schedule },
  { header: "Quality", key: "quality", render: (row) => row.quality },
  { header: "Unit Readiness", key: "readiness", render: (row) => row.readiness },
];

export function PropertySummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertySummary session={session} />}</PropertyLayout>;
}

function PropertySummary({ session }: Readonly<{ session: SessionProjection }>) {
  const activeWorkspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  return (
    <div className={styles.page}>
      <PageHeader description="Project & Property Operating System untuk pengendalian teknis, progres, mutu, dan kesiapan." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeWorkspace?.workspace_key ?? "—"}`} title="Ringkasan Property" />
      <div className={styles.contextBar}>
        <div className={styles.contextItem}><span className={styles.contextLabel}>Periode</span><span className={styles.contextValue}>—</span></div>
        <div className={styles.contextItem}><span className={styles.contextLabel}>Project</span><span className={styles.contextValue}>Semua project</span></div>
        <div className={styles.contextItem}><span className={styles.contextLabel}>Workspace</span><span className={styles.contextValue}>{activeWorkspace?.workspace_name ?? "—"}</span></div>
        <div className={styles.contextItem}><span className={styles.contextLabel}>Status data</span><span className={styles.contextValue}>Belum Terhubung</span></div>
      </div>
      <PropertySourceNote>Projection Property belum terhubung. Nilai teknis, jadwal, mutu, dan kesiapan tidak disimpulkan oleh frontend.</PropertySourceNote>
      <section aria-label="Metric utama Property" className={styles.metricGrid}>{metrics.map((label) => <Metric key={label} label={label} status="Belum Terhubung" value="—" />)}</section>
      <Section description="Health per project akan tampil setelah projection project dan construction terhubung." title="Project Health"><DataTable caption="Project health" columns={projectHealthColumns} emptyState={<PropertyUnavailableState description="Project health belum tersedia." />} getRowKey={(row) => row.recordId} rows={projectHealthRows} /></Section>
      <div className={styles.summaryGrid}>
        <Section title="Perhatian Utama"><PropertyUnavailableState description="Finding, incident, dan schedule exception belum tersedia." /></Section>
        <Section title="Unit Readiness"><PropertyUnavailableState description="Technical readiness unit belum tersedia." /></Section>
        <Section title="Contractor Summary"><PropertyUnavailableState description="Projection contractor dan delivery belum tersedia." /></Section>
        <Section title="Financial Visibility"><PropertyUnavailableState description="Actual Finance adalah projection read-only dan belum tersedia." /></Section>
        <Section title="Persetujuan & Temuan"><PropertyUnavailableState description="Approval governance dan Shared Work Finding belum tersedia pada source ini." /></Section>
      </div>
    </div>
  );
}
