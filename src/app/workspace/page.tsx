"use client";

import { CheckCircle2, CircleHelp, Info, Plus, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import {
  Alert,
  Button,
  DataTable,
  Dialog,
  Drawer,
  EmptyState,
  FormField,
  LoadingState,
  Metric,
  PageHeader,
  Pagination,
  Section,
  Status,
  Tabs,
  Toolbar,
} from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { ApiError, sessionApiRequest } from "@/lib/api";

import styles from "./workspace.module.css";

type PageState = "loading" | "ready" | "no_access" | "session_expired" | "error";

export default function WorkspacePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("loading");
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nextSession = await sessionApiRequest<SessionProjection>("/");
        if (cancelled) return;
        if (!nextSession.authenticated || !nextSession.principal) {
          setSession(null);
          setState("no_access");
        } else {
          setSession(nextSession);
          setState("ready");
        }
      } catch (caught) {
        if (!cancelled) {
          setSession(null);
          setState(caught instanceof ApiError && caught.status === 401 ? "session_expired" : "error");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setState("loading");
    setSession(null);
    setRetryCount((count) => count + 1);
  };

  if (state === "ready" && session) {
    return (
      <AppShell session={session}>
        <PrimitivePreview />
      </AppShell>
    );
  }

  return (
    <main className={styles.stateContainer}>
      <div className={styles.stateCard}>
        <p className={styles.stateBrand}>ALOS</p>

        {state === "loading" && (
          <div aria-live="polite">
            <div className={styles.loadingSpinner} aria-hidden="true" />
            <p className={styles.stateText}>Memeriksa status akun…</p>
          </div>
        )}

        {state === "no_access" && (
          <div>
            <h1 className={styles.stateTitle}>Anda tidak memiliki akses ke halaman ini.</h1>
            <p className={styles.stateText}>Silakan masuk dengan akun yang memiliki hak akses.</p>
            <div className={styles.stateActions}>
              <button
                className={styles.primaryButton}
                onClick={() => router.replace("/login")}
                type="button"
              >
                Masuk kembali
              </button>
            </div>
          </div>
        )}

        {state === "session_expired" && (
          <div>
            <h1 className={styles.stateTitle}>Sesi Anda sudah berakhir.</h1>
            <p className={styles.stateText}>Silakan masuk kembali untuk melanjutkan.</p>
            <div className={styles.stateActions}>
              <button
                className={styles.primaryButton}
                onClick={() => router.replace("/login")}
                type="button"
              >
                Masuk kembali
              </button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div>
            <h1 className={styles.stateTitle}>Kami belum dapat memuat halaman ini.</h1>
            <p className={styles.stateText}>Koneksi sedang bermasalah. Silakan coba kembali.</p>
            <div className={styles.stateActions}>
              <button className={styles.primaryButton} onClick={handleRetry} type="button">
                Coba lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

type PreviewRow = { readonly name: string; readonly status: string; readonly detail: string };

const previewRows: readonly PreviewRow[] = [
  { name: "Item A", status: "Aktif", detail: "Contoh tampilan" },
  { name: "Item B", status: "Belum Tersedia", detail: "Contoh tampilan" },
];

function PrimitivePreview() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={styles.preview}>
      <Alert
        icon={<Info size={18} strokeWidth={1.9} />}
        message="Halaman ini digunakan sementara untuk meninjau standar antarmuka sebelum modul bisnis dibangun."
        title="CONTOH TAMPILAN"
        variant="info"
      />

      <PageHeader
        actions={<Button iconBefore={<Plus size={16} strokeWidth={1.9} />} variant="secondary">Contoh aksi</Button>}
        description="Halaman ini digunakan sementara untuk meninjau standar antarmuka sebelum modul bisnis dibangun."
        eyebrow="CONTOH TAMPILAN"
        metadata="Komponen bersama · Standar ALOS"
        title="Pratinjau Komponen ALOS"
      />

      <Section title="Tombol dan status" description="Aksi dan state menggunakan bahasa yang diberikan consumer.">
        <div className={styles.previewRow}>
          <Button>Aksi utama</Button>
          <Button variant="secondary">Aksi sekunder</Button>
          <Button variant="ghost">Aksi ringan</Button>
          <Button variant="danger">Aksi berisiko</Button>
          <Status icon={<CheckCircle2 size={14} strokeWidth={1.9} />} label="Aktif" variant="success" />
          <Status label="Perlu Perhatian" variant="warning" />
          <Status label="Belum Tersedia" variant="neutral" />
        </div>
      </Section>

      <Section title="Ringkasan nilai" description="Ringkasan hanya menampilkan nilai yang diberikan consumer.">
        <div className={styles.previewMetricGrid}>
          <Metric label="Contoh label" supportingText="Belum tersedia" value="—" />
          <Metric label="Status contoh" supportingText="Contoh tampilan" status={<Status label="Informasi" variant="info" />} value="Aktif" />
        </div>
      </Section>

      <Section title="Alat kerja dan tabel" description="Struktur data memakai tabel semantik dan dapat bergulir di layar kecil.">
        <Toolbar
          actions={<Button iconBefore={<SlidersHorizontal size={16} strokeWidth={1.9} />} size="sm" variant="secondary">Filter contoh</Button>}
          filters={<Status label="Semua contoh" variant="neutral" />}
          search={<input aria-label="Cari contoh" className="alos-form-control" placeholder="Cari contoh" />}
        />
        <div className={styles.previewTable}>
          <DataTable
            caption="Contoh tampilan"
            columns={[
              { header: "Nama", key: "name", render: (row: PreviewRow) => row.name },
              { header: "Status", key: "status", render: (row: PreviewRow) => <Status label={row.status} variant={row.status === "Aktif" ? "success" : "neutral"} /> },
              { header: "Keterangan", key: "detail", render: (row: PreviewRow) => row.detail },
            ]}
            rows={previewRows}
          />
        </div>
      </Section>

      <Section title="Tab dan formulir" description="Navigasi dan input tetap ringan serta dapat diakses keyboard.">
        <Tabs
          items={[
            { content: "Konten contoh pertama.", id: "pertama", label: "Pertama" },
            { content: "Konten contoh kedua.", id: "kedua", label: "Kedua" },
            { content: "Konten contoh ketiga.", disabled: true, id: "ketiga", label: "Ketiga" },
          ]}
        />
        <div className={styles.previewFieldGrid}>
          <FormField description="Keterangan singkat untuk contoh input." label="Nama contoh" required>
            <input placeholder="Masukkan contoh" />
          </FormField>
          <FormField error="Isian ini wajib diisi." label="Isian contoh">
            <input aria-describedby="preview-error-help" defaultValue="" />
          </FormField>
        </div>
      </Section>

      <Section title="Pesan dan kondisi kosong" description="State selalu menjelaskan kondisi dengan bahasa yang mudah dipahami.">
        <div className={styles.previewStack}>
          <Alert action={<Button size="sm" variant="secondary">Coba lagi</Button>} message="Data belum dapat dimuat. Silakan coba kembali." title="Informasi" variant="warning" />
          <EmptyState action={<Button size="sm" variant="secondary">Tindakan contoh</Button>} description="Data akan ditampilkan setelah tersedia." icon={<CircleHelp size={24} strokeWidth={1.8} />} title="Belum ada data" />
          <LoadingState label="Memuat contoh" variant="section" />
        </div>
      </Section>

      <Section title="Dialog, drawer, dan pembagian halaman" description="Dialog dan drawer hanya menyediakan pola interaksi generik.">
        <div className={styles.previewRow}>
          <Button ref={dialogTriggerRef} onClick={() => setDialogOpen(true)}>Buka Dialog</Button>
          <Button ref={drawerTriggerRef} onClick={() => setDrawerOpen(true)} variant="secondary">Buka Drawer</Button>
        </div>
        <Pagination currentPage={page} onPageChange={setPage} totalPages={3} />
      </Section>

      <Dialog
        description="Konten ini hanya untuk meninjau pola dialog."
        footer={<Button onClick={() => setDialogOpen(false)}>Selesai</Button>}
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title="Dialog contoh"
        triggerRef={dialogTriggerRef}
      >
        <p className={styles.previewText}>Tidak ada perubahan yang dilakukan.</p>
      </Dialog>
      <Drawer
        description="Konten ini hanya untuk meninjau pola drawer."
        footer={<Button onClick={() => setDrawerOpen(false)}>Tutup</Button>}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        title="Drawer contoh"
        triggerRef={drawerTriggerRef}
      >
        <p className={styles.previewText}>Detail contoh ditampilkan di area kontekstual.</p>
      </Drawer>
    </div>
  );
}
