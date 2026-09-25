"use client";

import { ArrowRight, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { apiMessage, sessionApiRequest } from "@/lib/api";
import { resolveWorkspaceDestination } from "@/features/workspace-resolver";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import styles from "./login-page.module.css";

interface SessionProjection {
  readonly authenticated: boolean;
  readonly principal: AuthenticatedPrincipalProjection | null;
}

// Canonical post-login destination: Workspace Resolver
const POST_LOGIN_PATH = "/workspace";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const session = await sessionApiRequest<SessionProjection>("/login", {
        method: "POST",
        body: { email, password },
      });
      if (!session.authenticated) {
        throw new Error("Backend session was not established.");
      }
      const memberships = session.principal?.workspace_access ?? [];
      const destination = memberships.length === 1
        ? resolveWorkspaceDestination(memberships[0].workspace)
        : null;
      // A single Backend-authorized membership needs no intermediate chooser.
      // Multiple memberships still use the canonical resolver.
      router.replace(destination ?? POST_LOGIN_PATH);
      router.refresh();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <form className={styles.authForm} onSubmit={submit} noValidate={false}>
        {/* Email Field */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="session-email">
            Email
          </label>
          <div className={styles.inputWrapper}>
            <input
              autoComplete="username"
              className={styles.inputControl}
              disabled={submitting}
              id="session-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@andara.co.id"
              required
              type="email"
              value={email}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="session-password">
            Kata sandi
          </label>
          <div className={styles.inputWrapper}>
            <input
              autoComplete="current-password"
              className={`${styles.inputControl} ${styles.inputWithToggle}`}
              disabled={submitting}
              id="session-password"
              minLength={12}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan kata sandi"
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className={styles.togglePasswordButton}
              onClick={() => setShowPassword((prev) => !prev)}
              type="button"
            >
              {showPassword ? (
                <>
                  <EyeOff size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span>SEMBUNYIKAN</span>
                </>
              ) : (
                <>
                  <Eye size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span>LIHAT</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert Message */}
        {error ? (
          <div className={styles.errorMessage} role="alert">
            <ShieldAlert size={18} strokeWidth={1.8} aria-hidden="true" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Submit Button */}
        <button className={styles.submitButton} disabled={submitting} type="submit">
          <span>{submitting ? "Memverifikasi…" : "Masuk ke ALOS"}</span>
          {!submitting && <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />}
        </button>
      </form>

      {/* Security Helper */}
      <div className={styles.securityHelper}>
        <span className={styles.securityDot} aria-hidden="true" />
        <span>Sesi dikelola ALOS Backend &middot; Cookie HttpOnly</span>
      </div>

      {/* Role-based Access Box */}
      <div className={styles.roleBox}>
        <h3 className={styles.roleBoxTitle}>Akses berbasis peran</h3>
        <p className={styles.roleBoxCopy}>
          Setelah masuk, ALOS menampilkan workspace dan data sesuai role, scope divisi, proyek, serta
          permission yang diberikan kepada akun Anda.
        </p>
      </div>

      {/* Help text */}
      <p className={styles.helpText}>Mengalami kendala akses? Hubungi administrator sistem.</p>
    </div>
  );
}
