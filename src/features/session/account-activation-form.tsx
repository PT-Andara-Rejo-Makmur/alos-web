"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { apiMessage, sessionApiRequest } from "@/lib/api";
import type { ActivateAccountRequest, ActivateAccountResponse } from "@/lib/contracts";

import styles from "./login-page.module.css";

export function AccountActivationForm() {
  const router = useRouter();
  const token = useRef<string | null>(null);
  const initialized = useRef(false);
  const [tokenAvailable, setTokenAvailable] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    token.current = new URLSearchParams(window.location.search).get("token");
    window.history.replaceState(window.history.state, "", window.location.pathname);
    setTokenAvailable(Boolean(token.current));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!token.current || token.current.length < 20) {
      setError("Tautan aktivasi tidak valid atau telah kedaluwarsa.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const request: ActivateAccountRequest = {
        token: token.current,
        password,
        password_confirmation: confirmation,
      };
      const result = await sessionApiRequest<ActivateAccountResponse>("/activate", {
        method: "POST",
        body: request,
      });
      if (result.activation_state !== "ACTIVATED") throw new Error("Respons aktivasi tidak valid.");
      token.current = null;
      setTokenAvailable(false);
      setPassword("");
      setConfirmation("");
      router.replace("/login?activated=1");
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.authForm} onSubmit={submit}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="activation-password">Kata Sandi Baru *</label>
        <input className={styles.inputControl} id="activation-password" type="password" autoComplete="new-password" minLength={8} maxLength={256} required disabled={submitting || tokenAvailable === null} value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="activation-confirmation">Konfirmasi Kata Sandi *</label>
        <input className={styles.inputControl} id="activation-confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={256} required disabled={submitting || tokenAvailable === null} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
      </div>
      {error ? <div className={styles.errorMessage} role="alert">{error}</div> : null}
      {tokenAvailable === false && !submitting && !error ? <div className={styles.errorMessage} role="alert">Tautan aktivasi tidak valid atau telah kedaluwarsa.</div> : null}
      <button className={styles.submitButton} type="submit" disabled={submitting || !tokenAvailable}>
        {submitting ? "Mengaktifkan…" : "Aktifkan Akun"}
      </button>
    </form>
  );
}
