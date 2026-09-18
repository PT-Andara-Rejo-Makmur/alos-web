"use client";

import { useState, type FormEvent } from "react";

import { apiMessage } from "@/lib/api";

import { backendResearchAdapter } from "./backend-adapter";
import {
  researchDomains,
  type ResearchBackendAdapter,
  type ResearchRequestReceipt,
  type ResearchSourceMode,
} from "./models";

export function SharedResearchWorkspace({
  adapter = backendResearchAdapter,
}: Readonly<{ adapter?: ResearchBackendAdapter }>) {
  const [sourceMode, setSourceMode] = useState<ResearchSourceMode>("INTERNAL");
  const [domain, setDomain] = useState<(typeof researchDomains)[number]["id"]>("TECHNOLOGY");
  const [question, setQuestion] = useState("");
  const [receipt, setReceipt] = useState<ResearchRequestReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setReceipt(null);
    try {
      setReceipt(await adapter.request({ question: question.trim(), sourceMode, domain }));
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel feature-workspace" aria-labelledby="research-title">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">SHARED R&D WORKSPACE</p>
          <h2 id="research-title">Satu engine, empat domain</h2>
        </div>
        <span className="status-pill status-pill--muted">Request only</span>
      </div>
      <form className="factory-form" onSubmit={submit}>
        <fieldset className="mode-selector">
          <legend>Source mode</legend>
          {(["INTERNAL", "EXTERNAL"] as const).map((mode) => (
            <label key={mode}>
              <input
                checked={sourceMode === mode}
                name="source-mode"
                onChange={() => setSourceMode(mode)}
                type="radio"
                value={mode}
              />
              <span>{mode}</span>
            </label>
          ))}
        </fieldset>
        <label htmlFor="research-domain">R&D domain</label>
        <select
          id="research-domain"
          onChange={(event) => setDomain(event.target.value as typeof domain)}
          value={domain}
        >
          {researchDomains.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
        <p className="domain-description">
          {researchDomains.find((option) => option.id === domain)?.description}
        </p>
        <label htmlFor="research-question">Research question</label>
        <textarea
          id="research-question"
          minLength={10}
          onChange={(event) => setQuestion(event.target.value)}
          required
          rows={4}
          value={question}
        />
        <div className="request-boundary-note">
          {sourceMode === "EXTERNAL"
            ? "EXTERNAL adalah untrusted input. Backend menentukan permission, egress, source policy, dan audit."
            : "INTERNAL tetap dibatasi tenant, workspace, permission, classification, dan evidence policy Backend."}
        </div>
        <button className="button button--primary" disabled={submitting} type="submit">
          {submitting ? "Mengirim request…" : "Request research via Backend"}
        </button>
      </form>
      {error ? <p className="error-note" role="alert">{error}</p> : null}
      {receipt ? (
        <p className="success-note" role="status">
          Request {receipt.requestId} diterima Backend dengan state {receipt.state}.
        </p>
      ) : null}
    </section>
  );
}
