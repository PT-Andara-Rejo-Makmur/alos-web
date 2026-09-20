"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { apiMessage, sessionApiRequest } from "@/lib/api";

interface SessionProjection {
  readonly authenticated: boolean;
  readonly principal: {
    readonly display_name?: string;
    readonly email?: string;
  } | null;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const session = await sessionApiRequest<SessionProjection>("/login", {
        method: "POST",
        body: { email, password },
      });
      if (!session.authenticated) throw new Error("Backend session was not established.");
      router.push("/research");
      router.refresh();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel feature-workspace" aria-labelledby="login-title">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">BACKEND SESSION</p>
          <h2 id="login-title">Masuk ke ALOS</h2>
        </div>
        <span className="status-pill status-pill--muted">Backend authoritative</span>
      </div>
      <p>
        Kredensial diverifikasi oleh ALOS Backend. Token disimpan sebagai cookie HttpOnly
        dan tidak tersedia untuk JavaScript browser.
      </p>
      <form className="factory-form" onSubmit={submit}>
        <label htmlFor="session-email">Email</label>
        <input
          autoComplete="username"
          id="session-email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <label htmlFor="session-password">Password</label>
        <input
          autoComplete="current-password"
          id="session-password"
          minLength={12}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <button className="button button--primary" disabled={submitting} type="submit">
          {submitting ? "Memverifikasi…" : "Masuk melalui Backend"}
        </button>
      </form>
      {error ? <p className="alos-error" role="alert">{error}</p> : null}
    </section>
  );
}
