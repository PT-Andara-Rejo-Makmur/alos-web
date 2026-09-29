"use client";
import { Button, type DataTableColumn } from "@/components/ui";
import { LegalDataPage, type LegalTab } from "../shared/legal-data-page";
import { LegalSourceStateView } from "../shared/legal-ui";

type RiskRow = { readonly id: string };
const columns: readonly DataTableColumn<RiskRow>[] = ["Risiko", "Kategori", "Objek Terkait", "Dampak", "Kemungkinan", "Severity", "Penanggung Jawab", "Mitigasi", "Tenggat", "Status", "Evidence"].map((header) => ({ header, key: header, render: () => header === "Status" || header === "Severity" ? "Belum Dinilai" : "—" }));
const tabs: readonly LegalTab<RiskRow>[] = ["Risiko", "Kepatuhan", "Temuan", "Tindakan", "Riwayat"].map((label) => ({ id: label, label, title: label === "Risiko" ? "Risiko & Kepatuhan" : label, description: label === "Kepatuhan" ? "Persyaratan, bukti, penilaian, dan status menunggu sumber resmi." : `Tampilan ${label} Legal tanpa menyimpulkan status dari ketiadaan data.`, caption: `Daftar ${label} Legal`, columns, emptyDescription: `${label} Legal belum tersedia.`, rows: [], actions: label === "Tindakan" ? <Button disabled variant="secondary">Buat Tindakan</Button> : undefined, children: label === "Temuan" || label === "Tindakan" ? <LegalSourceStateView description="Temuan dan tindakan korektif menggunakan Shared Work setelah sumber resmi tersedia." state="unavailable" /> : undefined }));
export function LegalRisksPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <LegalDataPage description="Pantau risiko legal dan kepatuhan tanpa membuat penilaian atau status patuh dari halaman ini." tabs={tabs} title="Risiko & Kepatuhan" workspaceKey={workspaceKey} />; }
