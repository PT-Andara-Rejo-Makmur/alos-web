"use client";

import { PageHeader, Section } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertySourceNote, PropertyUnavailableState } from "../shared/property-ui";
import styles from "../property.module.css";

export function PropertyContractorDetailPage({ contractorId, workspaceKey }: Readonly<{ contractorId: string; workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyContractorDetail contractorId={contractorId} session={session} />}</PropertyLayout>; }

function PropertyContractorDetail({ contractorId, session }: Readonly<{ contractorId: string; session: SessionProjection }>) {
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Detail contractor technical delivery dan projection lintas domain." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Detail Kontraktor" />
    <PropertySourceNote>Contractor detail belum terhubung. Legal dan Finance state tetap read-only.</PropertySourceNote>
    <Section title="Technical Delivery"><PropertyUnavailableState description={`Technical delivery untuk contractor ${contractorId} belum tersedia.`} /></Section>
    <Section title="Legal Projection"><PropertyUnavailableState description="Legal status belum tersedia dan tidak dapat diubah Property." /></Section>
    <Section title="Finance Projection"><PropertyUnavailableState description="Payment status belum tersedia dan tidak dapat diubah Property." /></Section>
  </div>;
}
