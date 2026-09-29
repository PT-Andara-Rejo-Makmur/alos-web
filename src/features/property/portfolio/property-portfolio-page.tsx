"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyDetailDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableState } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [
  { id: "all", label: "Semua" }, { id: "active", label: "Aktif" }, { id: "planning", label: "Perencanaan" },
  { id: "risk", label: "Berisiko" }, { id: "held", label: "Ditahan" }, { id: "completed", label: "Selesai" },
];
interface PortfolioRow { readonly recordId: string; readonly project: string; readonly phase: string; readonly progress: string; readonly schedule: string; readonly health: string; readonly owner: string; readonly unitReadiness: string; }
const portfolioRows: readonly PortfolioRow[] = [];
const portfolioColumns: readonly DataTableColumn<PortfolioRow>[] = [
  { header: "Project", key: "project", render: (row) => row.project }, { header: "Phase", key: "phase", render: (row) => row.phase },
  { header: "Progress", key: "progress", render: (row) => row.progress }, { header: "Schedule", key: "schedule", render: (row) => row.schedule },
  { header: "Health", key: "health", render: (row) => row.health }, { header: "Owner", key: "owner", render: (row) => row.owner },
  { header: "Unit Readiness", key: "unitReadiness", render: (row) => row.unitReadiness },
];

export function PropertyPortfolioPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyPortfolio session={session} />}</PropertyLayout>;
}

function PropertyPortfolio({ session }: Readonly<{ session: SessionProjection }>) {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<PortfolioRow | null>(null);
  const [filters, setFilters] = useState({ project: "all", phase: "all", health: "all" });
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  const openProject = () => { if (selected && activeKey) router.push(`/workspace/${encodeURIComponent(activeKey)}/projects/${encodeURIComponent(selected.recordId)}`); };
  return (
    <div className={styles.page}>
      <PageHeader description="Portfolio Property merupakan projection atas canonical Shared Work Project." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Portofolio Proyek" />
      <PropertySourceNote>Portfolio source belum tersedia. Project identity tetap dimiliki Shared Work; Property hanya menambahkan projection teknis.</PropertySourceNote>
      <Tabs ariaLabel="Filter portfolio project" items={tabs} onValueChange={setTab} value={tab} />
      <Section title="Filter Portfolio"><PropertyFilterBar ariaLabel="Filter portfolio project" search={<input aria-label="Cari project" placeholder="Cari project" />}><PropertySelect label="Project" name="portfolio-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua project"]]} value={filters.project} /><PropertySelect label="Phase" name="portfolio-phase" onChange={(value) => setFilters((current) => ({ ...current, phase: value }))} options={[["all", "Semua phase"]]} value={filters.phase} /><PropertySelect label="Health" name="portfolio-health" onChange={(value) => setFilters((current) => ({ ...current, health: value }))} options={[["all", "Semua status"]]} value={filters.health} /></PropertyFilterBar></Section>
      <Section description="Quick view Property dapat membuka detail canonical Shared Work Project." title="Daftar Portfolio"><DataTable caption="Daftar portfolio project" columns={portfolioColumns} emptyState={<PropertyUnavailableState description="Portfolio project belum tersedia." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => setSelected(row)} size="sm" variant="secondary">Lihat cepat</Button>} rows={portfolioRows} /></Section>
      <PropertyDetailDrawer description="Projection teknis Property; detail entity tetap canonical Shared Work Project." items={selected ? [{ label: "Project", value: selected.project }, { label: "Phase", value: selected.phase }, { label: "Progress", value: selected.progress }, { label: "Schedule", value: selected.schedule }, { label: "Health", value: selected.health }] : []} onClose={() => setSelected(null)} open={selected !== null} title="Quick View Project">{selected ? <Button onClick={openProject} variant="primary">Buka Proyek</Button> : null}</PropertyDetailDrawer>
    </div>
  );
}
