"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState, PageHeader, Section, Status, Tabs, type TabItem } from "@/components/ui";

import { ExecutiveLayout } from "./executive-layout";
import styles from "./executive.module.css";

export function ExecutiveReviewsPage() { return <ExecutiveLayout>{() => <ReviewsContent />}</ExecutiveLayout>; }
function ReviewsContent() {
  const [tab, setTab] = useState("performance");
  const tabs: readonly TabItem[] = useMemo(() => [{ id: "performance", label: "Review Kinerja" }, { id: "corrective", label: "Tindakan Korektif" }, { id: "revision", label: "Revisi Target" }, { id: "history", label: "Riwayat" }], []);
  const text = tab === "corrective" ? "Tindak lanjut menggunakan Tugas atau Proyek universal setelah action Backend tersedia." : tab === "revision" ? "Revisi menjaga versi aktif dan mengikuti lifecycle review/approval dari Backend." : "Review akan ditampilkan setelah PerformanceReview canonical tersedia.";
  return <div className={styles.page}><PageHeader description="Telaah kinerja, tindak lanjut, dan perubahan target melalui lifecycle yang berwenang." eyebrow="STRATEGI & KINERJA" title="Review & Revisi" /><Tabs ariaLabel="Review dan revisi" items={tabs} onValueChange={setTab} value={tab} /><Section title={tabs.find((item) => item.id === tab)?.label}><EmptyState action={tab === "corrective" ? <Link className={styles.detailLink} href="/workspace/executive/tasks">Buka Tugas</Link> : undefined} description={text} title="Belum ada data yang dapat ditampilkan." /></Section><Section title="Lifecycle"><div className={styles.readinessRow}><Status label="Mengikuti Backend" variant="neutral" /><p>Tindakan material tidak diaktifkan langsung dari frontend dan tidak dapat disetujui sendiri.</p></div></Section></div>;
}
