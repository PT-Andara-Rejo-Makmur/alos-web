"use client";
import { useEffect, useState } from "react";
import { Alert, Metric, PageHeader, Section, Status, Tabs } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { apiMessage } from "@/lib/api";
import type { AraAuthorityProjection } from "@/lib/contracts";
import { araApi } from "@/features/ara/api";
import { CapabilityRequests } from "@/features/ara/capability-requests";
import { RecordPanel } from "@/features/business-records/record-panel";
import { itResources } from "./resources";
import styles from "@/components/ui/work-surface.module.css";

export function TechnologyControl({session}:Readonly<{session:SessionProjection}>) {
  const [tab,setTab]=useState("systems");
  const [authority,setAuthority]=useState<AraAuthorityProjection|null>(null);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{let active=true;void araApi.authority().then(value=>{if(active)setAuthority(value);}).catch(caught=>{if(active)setError(apiMessage(caught));});return()=>{active=false;};},[]);
  return <div className={styles.stack}><PageHeader title="ALOS & GENESIS" description="Status asisten, kemampuan yang tersedia, serta sistem dan rilis perusahaan." />
    <Section title="Layanan GENESIS">{error ? <Alert variant="warning" message={error} /> : null}<div className={styles.metricStrip}>
      <Metric label="Layanan ARA" value={authority?.service_available === true ? "Tersedia" : authority?.service_available === false ? "Belum tersedia" : "Belum diketahui"} />
      <Metric label="Model Gateway" value={authority ? (authority.production_provider_connected ? "Terhubung" : "Belum terhubung") : "Belum diketahui"} />
      <Metric label="Kemampuan yang Diizinkan" value={authority ? String(authority.allowed_capability_ids.length) : "Belum tersedia"} />
    </div>{authority ? <p>Mode layanan: <Status label={authority.runtime_mode === "NORMAL" ? "Operasional" : "Pengujian"} /></p> : null}</Section>
    <Tabs ariaLabel="Kendali teknologi" value={tab} onValueChange={setTab} items={[{id:"systems",label:"Sistem ALOS"},{id:"capabilities",label:"Asisten & Otomasi"},{id:"releases",label:"Rilis"}]} />
    {tab==="systems" ? <RecordPanel resource={itResources.systems} session={session} /> : tab==="releases" ? <RecordPanel resource={itResources.releases} session={session} /> : <CapabilityRequests />}
  </div>;
}
