"use client";

import { useState } from "react";
import { Button, DataTable, PageHeader, Section, Tabs, type TabItem } from "@/components/ui";
import { LegalLayout } from "../legal-layout";
import { LegalSourceStateView } from "../shared/legal-ui";
import styles from "../legal.module.css";

const tabs: readonly TabItem[] = ["Menunggu Saya", "Dalam Review", "Dikembalikan", "Selesai", "Semua"].map((label) => ({ id: label, label }));
const columns = [{ header: "Subjek", key: "subject", render: () => "—" }, { header: "Jenis", key: "type", render: () => "—" }, { header: "Pemohon", key: "requester", render: () => "—" }, { header: "Divisi", key: "division", render: () => "—" }, { header: "Proyek", key: "project", render: () => "—" }, { header: "Diajukan", key: "submitted", render: () => "—" }, { header: "Prioritas", key: "priority", render: () => "Belum Dinilai" }, { header: "Materialitas", key: "materiality", render: () => "Belum Dinilai" }, { header: "Status", key: "status", render: () => "Belum Dinilai" }, { header: "SLA", key: "sla", render: () => "—" }];

export function LegalReviewsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <LegalLayout workspaceKey={workspaceKey}>{() => <LegalReviews />}</LegalLayout>; }
function LegalReviews() { const [tab, setTab] = useState("Menunggu Saya"); return <div className={styles.page}><PageHeader description="Telaah permintaan legal dengan pemisahan yang jelas dari persetujuan bisnis dan eksekusi tanda tangan." eyebrow="KONTRAK & DOKUMEN" title="Review Legal" /><Tabs ariaLabel="Navigasi review Legal" items={tabs} onValueChange={setTab} value={tab} /><Section actions={<Button disabled variant="secondary">Tindakan belum tersedia</Button>} description="Tindakan review menunggu sumber dan kewenangan resmi." title={tab}><DataTable caption={`Daftar review Legal — ${tab}`} columns={columns} emptyState={<LegalSourceStateView description={`Data review Legal pada bagian ${tab} belum tersedia.`} state="unavailable" />} rows={[]} /></Section><Section title="Pemisahan Status"><LegalSourceStateView description="Review Legal, persetujuan bisnis, dan eksekusi tanda tangan belum tersedia sebagai sumber terpisah." state="unavailable" /></Section></div>; }
