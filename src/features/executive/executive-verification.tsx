"use client";

import { useState } from "react";
import { Alert, Button, Drawer } from "@/components/ui";
import type { StrategyVerificationRequest } from "@/lib/contracts";
import styles from "./executive.module.css";

export function ExecutiveVerificationDrawer({ onSave, onClose }: Readonly<{
  onSave: (payload: StrategyVerificationRequest) => Promise<unknown>;
  onClose: () => void;
}>) {
  const [reason, setReason] = useState("");
  const [state, setState] = useState<StrategyVerificationRequest["verification_state"]>("VERIFIED");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!reason.trim()) return;
    setSaving(true);
    try { await onSave({ verification_state: state, reason: reason.trim() }); onClose(); }
    catch { setError("Keputusan verifikasi ditolak. Periksa kewenangan dan record sumber."); }
    finally { setSaving(false); }
  }
  return <Drawer open onClose={onClose} title="Telaah Verifikasi" description="Keputusan dicatat sebagai history baru; nilai dan bukti asal dipertahankan.">
    {error ? <Alert title="Perhatian" message={error} variant="warning" /> : null}
    <form onSubmit={(event) => void submit(event)}>
      <div className={styles.formField}><label htmlFor="verification-state">Keputusan</label><select id="verification-state" className={styles.formSelect} value={state} onChange={(event) => setState(event.target.value as StrategyVerificationRequest["verification_state"])}><option value="VERIFIED">Terverifikasi</option><option value="CONFLICT">Konflik</option><option value="REJECTED">Ditolak</option></select></div>
      <div className={styles.formField}><label htmlFor="verification-reason">Alasan Verifikasi *</label><textarea id="verification-reason" className={styles.formTextarea} required value={reason} onChange={(event) => setReason(event.target.value)} /></div>
      <Button disabled={saving || !reason.trim()} type="submit">{saving ? "Menyimpan…" : "Catat Keputusan"}</Button>
    </form>
  </Drawer>;
}
