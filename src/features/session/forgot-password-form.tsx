"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { apiMessage, sessionApiRequest } from "@/lib/api";
import type { PasswordResetRequest, PasswordResetResponse } from "@/lib/contracts";

import styles from "./login-page.module.css";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const payload: PasswordResetRequest = { email };
      await sessionApiRequest<PasswordResetResponse>("/password-reset/request", {
        method: "POST",
        body: payload,
      });
      setSubmitted(true);
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.authForm}>
        <div className={styles.roleBox} role="status">
          <h3 className={styles.roleBoxTitle}>Instruksi Terkirim</h3>
          <p className={styles.roleBoxCopy}>
            Jika email terdaftar, instruksi pemulihan telah dikirim. Silakan periksa kotak masuk atau folder spam email Anda.
          </p>
        </div>
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link href="/login" className={styles.backLink}>
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.authForm} onSubmit={submit}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="reset-email">
          Email Akun *
        </label>
        <div className={styles.inputWrapper}>
          <input
            autoComplete="email"
            className={styles.inputControl}
            disabled={submitting}
            id="reset-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@andara.co.id"
            required
            type="email"
            value={email}
          />
        </div>
      </div>

      {error ? (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      ) : null}

      <button className={styles.submitButton} disabled={submitting} type="submit">
        <span>{submitting ? "Memproses…" : "Kirim Instruksi Pemulihan"}</span>
      </button>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <Link href="/login" className={styles.backLink}>
          Kembali ke halaman masuk
        </Link>
      </div>
    </form>
  );
}
