"use client";
import { type DataTableColumn } from "@/components/ui";
import { LegalDataPage, type LegalTab } from "../shared/legal-data-page";
type AssetRow = { readonly id: string };
const columns: readonly DataTableColumn<AssetRow>[] = ["Proyek / Aset", "Penanggung Jawab Legal", "Kesiapan Izin", "Kesiapan Kontrak", "Dokumen Tanah/Aset", "Temuan Legal Terbuka", "Penghambat Legal", "Review Terakhir"].map((header) => ({ header, key: header, render: () => header.includes("Kesiapan") || header.includes("Penghambat") ? "Belum Dinilai" : "—" }));
const tabs: readonly LegalTab<AssetRow>[] = ["Semua", "Memerlukan Review", "Belum Lengkap", "Riwayat"].map((label) => ({ id: label, label, title: label === "Semua" ? "Legalitas Proyek & Aset" : `Legalitas Proyek & Aset — ${label}`, description: "Legalitas proyek dan aset menggunakan referensi Project/Asset bersama; kesiapan final menunggu verifikasi.", caption: `Legalitas proyek dan aset ${label}`, columns, emptyDescription: "Data legalitas proyek dan aset belum tersedia.", rows: [] }));
export function LegalAssetsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <LegalDataPage description="Pantau legalitas proyek dan aset tanpa membuat ulang data proyek atau menyimpulkan kesiapan." tabs={tabs} title="Legalitas Proyek & Aset" workspaceKey={workspaceKey} />; }
