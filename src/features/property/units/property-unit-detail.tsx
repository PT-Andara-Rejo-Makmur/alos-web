"use client";

import { PageHeader, Section } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertySourceNote, PropertyUnavailableState } from "../shared/property-ui";
import styles from "../property.module.css";

export function PropertyUnitDetailPage({ unitId, workspaceKey }: Readonly<{ unitId: string; workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyUnitDetail session={session} unitId={unitId} />}</PropertyLayout>;
}

function PropertyUnitDetail({ session, unitId }: Readonly<{ session: SessionProjection; unitId: string }>) {
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Detail unit Property; identity berasal dari route canonical setelah boundary workspace tervalidasi." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Detail Unit" />
    <PropertySourceNote>Projection unit belum terhubung. Identifier unit tidak diinterpretasikan menjadi status bisnis oleh frontend.</PropertySourceNote>
    <Section title="Technical State"><PropertyUnavailableState description={`Technical state untuk unit ${unitId} belum tersedia.`} /></Section>
    <Section title="Technical Readiness"><PropertyUnavailableState description="Readiness teknis belum dinilai." title="Belum Dinilai" /></Section>
    <Section title="Sales / Commercial Projection"><PropertyUnavailableState description="Commercial state adalah projection Sales read-only dan belum tersedia." /></Section>
    <Section title="Handover"><PropertyUnavailableState description="Handover readiness belum tersedia." /></Section>
  </div>;
}
