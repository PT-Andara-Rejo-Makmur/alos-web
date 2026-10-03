"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, EmptyState, LoadingState } from "@/components/ui";
import { selectActiveWorkspace, workspaceDomainFromMetadata, type SessionProjection } from "@/features/session";
import type { WorkspaceAccessProjection } from "@/lib/contracts";
import { ApiError, sessionApiRequest } from "@/lib/api";
import { roleLabel } from "@/lib/presentation";
import styles from "./workspace.module.css";

const descriptions: Readonly<Record<string, string>> = {
  EXECUTIVE: "Keputusan, kondisi perusahaan, dan target utama.", SALES: "Pelanggan, penjualan, dan tindak lanjut.",
  PROPERTY: "Proyek, pekerjaan teknis, dan pemeriksaan mutu.", FINANCE: "Anggaran, piutang, utang, dan pembayaran.",
  LEGAL: "Kontrak, perizinan, dan kepatuhan.", HR_GA: "Karyawan, rekrutmen, dan fasilitas.", IT: "Layanan, sistem, dan akses perusahaan.",
};

function activeAccess(session: SessionProjection): readonly WorkspaceAccessProjection[] {
  const principal = session.principal;
  if (!session.authenticated || !principal || !("actor" in principal) || !principal.actor.active) return [];
  const seen = new Set<string>();
  return [...(principal.active_workspace ? [principal.active_workspace] : []), ...principal.workspace_access]
    .filter(item => { if (!item.active || !item.workspace.active || seen.has(item.workspace.workspace_id)) return false; seen.add(item.workspace.workspace_id); return true; });
}

export default function WorkspacePage() {
  const router = useRouter();
  const routerRef = useRef(router);
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "session_expired" | "error" | "no_access">("loading");
  const [revision, setRevision] = useState(0);
  const [choosing, setChoosing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let current = true;
    async function load() {
      try {
        const value = await sessionApiRequest<SessionProjection>("/");
        if (!current) return;
        if (!value.authenticated || !value.principal || !("actor" in value.principal) || !value.principal.actor.active) { setState("no_access"); return; }
        const access = activeAccess(value);
        if (access.length === 1 && workspaceDomainFromMetadata(access[0].workspace) === "UNKNOWN") { setState("no_access"); return; }
        if (access.length === 1 && workspaceDomainFromMetadata(access[0].workspace) !== "UNKNOWN") {
          const only = access[0];
          if (value.principal.active_workspace?.workspace.workspace_id !== only.workspace.workspace_id || !value.principal.active_workspace?.active) await selectActiveWorkspace(only.workspace.workspace_id);
          if (current) routerRef.current.replace(`/workspace/${encodeURIComponent(only.workspace.workspace_key)}/summary`);
          return;
        }
        setSession(value); setState("ready");
      } catch (caught) {
        if (current) setState(caught instanceof ApiError && caught.status === 401 ? "session_expired" : "error");
      }
    }
    void load();
    return () => { current = false; };
  }, [revision]);

  async function choose(access: WorkspaceAccessProjection) {
    if (choosing || workspaceDomainFromMetadata(access.workspace) === "UNKNOWN") return;
    setChoosing(access.workspace.workspace_id); setError(null);
    try {
      await selectActiveWorkspace(access.workspace.workspace_id);
      routerRef.current.replace(`/workspace/${encodeURIComponent(access.workspace.workspace_key)}/summary`); routerRef.current.refresh();
    } catch {
      setError("Ruang kerja belum dapat dibuka. Coba lagi.");
      setChoosing(null);
    }
  }

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await sessionApiRequest("/", { method: "DELETE" });
    } catch {
      // Always leave the chooser even if the session endpoint is unavailable.
    } finally {
      routerRef.current.replace("/login");
      routerRef.current.refresh();
    }
  }

  if (state === "ready" && session) {
    const principal = session.principal && "actor" in session.principal ? session.principal : null;
    const access = activeAccess(session);
    return <main className={styles.chooserPage}>
      <header className={styles.chooserTopbar}>
        <div className={styles.chooserBrand}><Image src="/brand/alos-logo-mark.png" alt="ALOS" width={34} height={34} /><div><strong>ALOS</strong><span>PT Andara Rejo Makmur</span></div></div>
        <div className={styles.chooserProfileGroup}>
          {principal ? <span className={styles.chooserProfile}>{principal.actor.display_name}</span> : null}
          <Button disabled={loggingOut} onClick={() => void logout()} size="sm" variant="ghost">{loggingOut ? "Keluar…" : "Keluar"}</Button>
        </div>
      </header>
      <section className={styles.chooser} aria-labelledby="workspace-title">
        <div className={styles.chooserHeader}><Image src="/images/workspace-shell/workspace-home-header.webp" alt="" fill sizes="100vw" priority /><div><p>PT ANDARA REJO MAKMUR</p><h1 id="workspace-title">Pilih Ruang Kerja</h1><span>Pilih tanggung jawab yang ingin Anda tangani.</span></div></div>
        {access.length ? <div className={styles.workspaceGrid}>{access.map(item => {
          const domain = workspaceDomainFromMetadata(item.workspace);
          return <button className={styles.workspaceChoice} type="button" key={item.workspace.workspace_id} disabled={choosing !== null || domain === "UNKNOWN"} onClick={() => void choose(item)}>
            <span><strong>{item.workspace.workspace_name}</strong><span className={styles.workspaceRole}>{roleLabel(item.role_refs)}</span><small>{descriptions[domain] ?? "Ruang kerja belum dapat dibuka. Hubungi administrator."}</small></span><ArrowRight aria-hidden="true" size={20} />
          </button>;
        })}</div> : <EmptyState title="Belum ada ruang kerja yang dapat dibuka" description="Hubungi administrator perusahaan agar akun Anda dihubungkan dengan ruang kerja yang sesuai." />}
        {choosing ? <p role="status">Membuka ruang kerja…</p> : null}{error ? <Alert message={error} variant="danger" /> : null}
      </section>
    </main>;
  }
  return <main className={styles.stateContainer}><div className={styles.stateCard}><p className={styles.stateBrand}>ALOS</p>
    {state === "loading" ? <LoadingState label="Memeriksa ruang kerja Anda…" /> : <><h1 className={styles.stateTitle}>{state === "session_expired" ? "Sesi Anda sudah berakhir." : state === "no_access" ? "Anda tidak memiliki akses ke halaman ini." : "Kami belum dapat memuat halaman ini."}</h1><p className={styles.stateText}>{state === "error" ? "Periksa koneksi lalu coba kembali." : "Silakan masuk dengan akun perusahaan Anda."}</p><Button onClick={() => { if (state === "error") { setState("loading"); setRevision(value => value + 1); } else router.replace("/login"); }}>{state === "error" ? "Coba lagi" : "Masuk kembali"}</Button></>}
  </div></main>;
}
