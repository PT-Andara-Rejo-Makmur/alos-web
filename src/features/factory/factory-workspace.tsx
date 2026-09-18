"use client";

import { useState, type FormEvent } from "react";

import { apiMessage } from "@/lib/api";

import { backendFactoryAdapter } from "./backend-adapter";
import type { FactoryAnalysisProjection, FactoryBackendAdapter } from "./models";

export function FactoryResultPanel({ result }: Readonly<{ result: FactoryAnalysisProjection }>) {
  return (
    <section className="factory-result" aria-live="polite">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">CAPABILITY DECISION</p>
          <h3>Keputusan {result.decision}</h3>
        </div>
        <span className={`status-pill decision-${result.decision.toLowerCase()}`}>
          {result.decision}
        </span>
      </div>
      <p className="projection-note">{result.reason}</p>
      {result.decision === "REUSE" ? (
        <div className="summary-grid">
          {result.existingCapabilities.map((capability) => (
            <article className="summary-card" key={capability.capabilityId}>
              <span className="summary-label">Existing Backend capability</span>
              <strong>{capability.name}</strong>
              <p>{capability.purpose}</p>
              <dl>
                <div><dt>ID</dt><dd>{capability.capabilityId}</dd></div>
                <div><dt>Version</dt><dd>{capability.version}</dd></div>
                <div><dt>Type</dt><dd>{capability.capabilityType}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      ) : result.draft ? (
        <article className="summary-card">
          <div className="summary-card-heading">
            <span className="summary-label">Capability proposal</span>
            <span className="status-pill status-pill--draft">DRAFT</span>
          </div>
          <strong>{result.draft.purpose}</strong>
          <dl className="detail-grid">
            <div><dt>Identifier</dt><dd>{result.draft.identifier}</dd></div>
            <div><dt>Version</dt><dd>{result.draft.version}</dd></div>
            <div><dt>Type</dt><dd>{result.draft.capabilityType}</dd></div>
            <div><dt>Risk</dt><dd>{result.draft.risk}</dd></div>
            <div><dt>Scope</dt><dd>{result.draft.scope.join(", ") || "Backend review required"}</dd></div>
            <div><dt>Tools</dt><dd>{result.draft.tools.join(", ") || "None proposed"}</dd></div>
            <div><dt>Permissions</dt><dd>{result.draft.permissions.join(", ") || "None proposed"}</dd></div>
            <div><dt>Readiness</dt><dd>{result.draft.readiness}</dd></div>
          </dl>
        </article>
      ) : null}
      <p className="projection-note">Correlation: {result.correlationId}</p>
    </section>
  );
}

export function FactoryWorkspace({
  adapter = backendFactoryAdapter,
}: Readonly<{ adapter?: FactoryBackendAdapter }>) {
  const [requirement, setRequirement] = useState("");
  const [result, setResult] = useState<FactoryAnalysisProjection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      setResult(await adapter.analyze({ requirement: requirement.trim() }));
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel feature-workspace" aria-labelledby="factory-title">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">GENESIS FACTORY · VIA BACKEND</p>
          <h2 id="factory-title">Requirement menjadi proposal terstruktur</h2>
        </div>
        <span className="status-pill status-pill--muted">Backend authoritative</span>
      </div>
      <form className="factory-form" onSubmit={submit}>
        <label htmlFor="business-requirement">Business requirement</label>
        <textarea
          id="business-requirement"
          minLength={20}
          onChange={(event) => setRequirement(event.target.value)}
          placeholder="Jelaskan outcome bisnis, batasan, dan evidence yang dibutuhkan."
          required
          rows={5}
          value={requirement}
        />
        <div className="request-boundary-note">
          Browser mengirim requirement ke ALOS Backend. Scope dan permission tidak dibuat oleh UI.
        </div>
        <button className="button button--primary" disabled={submitting} type="submit">
          {submitting ? "Mengirim ke Backend…" : "Analisis melalui Backend"}
        </button>
      </form>
      {error ? <p className="error-note" role="alert">{error}</p> : null}
      {result ? <FactoryResultPanel result={result} /> : null}
    </section>
  );
}
