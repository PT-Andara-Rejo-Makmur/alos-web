"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { apiMessage, sessionApiRequest } from "@/lib/api";
import type { PasswordResetConfirmRequest, PasswordResetConfirmResponse } from "@/lib/contracts";

import styles from "./login-page.module.css";

export function ResetPasswordForm() {
  const token = useRef<string | null>(null);
  const initialized = useRef(false);
  const [tokenAvailable, setTokenAvailable] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    token.current = new URLSearchParams(window.location.search).get("token");
    window.history.replaceState(window.history.state, "", window.location.pathname);
    setTokenAvailable(Boolean(token.current && token.current.length >= 20));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!token.current || token.current.length < 20) {
      setError("Tautan atur ulang kata sandi tidak valid atau telah kedaluwarsa.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const payload: PasswordResetConfirmRequest = {
        token: token.current,
        password,
        password_confirmation: confirmation,
      };
      await sessionApiRequest<PasswordResetConfirmResponse>("/password-reset/confirm", {
        method: "POST",
        body: payload,
      });
      token.current = null;
      setTokenAvailable(false);
      setPassword("");
      setConfirmation("");
      setSuccess(true);
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.authForm}>
        <div className={styles.roleBox} role="status">
          <h3 className={styles.roleBoxTitle}>Kata Sandi Diperbarui</h3>
          <p className={styles.roleBoxCopy}>
            Kata sandi Anda telah berhasil diperbarui. Seluruh sesi lama telah dicabut untuk keamanan akun Anda.
          </p>
        </div>
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link href="/login" className={styles.submitButton} style={{ textDecoration: "none" }}>
            <span>Masuk ke ALOS</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.authForm} onSubmit={submit}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="new-password">
          Kata Sandi Baru *
        </label>
        <div className={styles.inputWrapper}>
          <input
            autoComplete="new-password"
            className={styles.inputControl}
            disabled={submitting || tokenAvailable === false}
            id="new-password"
            minLength={8}
            maxLength={256}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimal 8 karakter"
            required
            type="password"
            value={password}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="confirm-password">
          Konfirmasi Kata Sandi Baru *
        </label>
        <div className={styles.inputWrapper}>
          <input
            autoComplete="new-password"
            className={styles.inputControl}
            disabled={submitting || tokenAvailable === false}
            id="confirm-password"
            minLength={8}
            maxLength={256}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Ulangi kata sandi baru"
            required
            type="password"
            value={confirmation}
          />
        </div>
      </div>

      {error ? (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      ) : null}

      {tokenAvailable === false && !error ? (
        <div className={styles.errorMessage} role="alert">
          Tautan atur ulang kata sandi tidak valid atau telah kedaluwarsa.
        </div>
      ) : null}

      <button className={styles.submitButton} disabled={submitting || !tokenAvailable} type="submit">
        <span>{submitting ? "Memproses…" : "Simpan Kata Sandi Baru"}</span>
      </button>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <Link href="/login" className={styles.backLink}>
          Kembali ke halaman masuk
        </Link>
      </div>
    </form>
  );
}
