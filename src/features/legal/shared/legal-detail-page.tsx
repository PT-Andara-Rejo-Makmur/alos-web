"use client";
import { PageHeader, Section, Tabs, type TabItem } from "@/components/ui";
import { LegalLayout } from "../legal-layout";
import { LegalSourceStateView } from "./legal-ui";
import styles from "../legal.module.css";

const tabs: readonly TabItem[] = ["Ringkasan", "Pihak", "Ketentuan Utama", "Kewajiban", "Dokumen & Versi", "Review", "Persetujuan", "Perubahan", "Tenggat", "Temuan", "Bukti", "Aktivitas"].map((label) => ({ id: label, label }));
const permitTabs: readonly TabItem[] = ["Ringkasan", "Dokumen", "Review", "Tenggat", "Bukti", "Aktivitas"].map((label) => ({ id: label, label }));
const caseTabs: readonly TabItem[] = ["Ringkasan", "Pihak", "Timeline", "Dokumen", "Tindakan", "Tenggat", "Temuan", "Bukti", "Aktivitas"].map((label) => ({ id: label, label }));
const assetTabs: readonly TabItem[] = ["Ringkasan", "Dokumen", "Kontrak", "Perizinan", "Temuan", "Review", "Aktivitas"].map((label) => ({ id: label, label }));

export function LegalDetailPage({ kind, workspaceKey }: Readonly<{ kind: "contract" | "permit" | "case" | "asset"; recordId?: string; workspaceKey?: string }>) { return <LegalLayout workspaceKey={workspaceKey}>{() => <LegalDetail kind={kind} />}</LegalLayout>; }
function LegalDetail({ kind }: Readonly<{ kind: "contract" | "permit" | "case" | "asset" }>) { const title = kind === "contract" ? "Detail Kontrak" : kind === "permit" ? "Detail Perizinan" : kind === "case" ? "Detail Kasus" : "Detail Legalitas Proyek & Aset"; const selectedTabs = kind === "contract" ? tabs : kind === "permit" ? permitTabs : kind === "case" ? caseTabs : assetTabs; return <div className={styles.page}><PageHeader description="Detail data belum tersedia dari sumber legal resmi." eyebrow="LEGAL" title={title} /><Tabs ariaLabel={`Navigasi ${title}`} items={selectedTabs} /><Section title="Sumber Data"><LegalSourceStateView description="Detail belum dapat ditampilkan karena sumber legal belum terhubung. Identitas pada URL tidak menentukan kewenangan." state="unavailable" /></Section></div>; }
