"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { SafeErrorView } from "@/features/evidence";

import { backendResearchAdapter } from "./backend-adapter";
import {
  projectBackendDomainAccess,
  researchDomains,
  type ResearchBackendAdapter,
  type ResearchDomainAccessRecord,
  type ResearchDomainId,
  type ResearchRequestReceipt,
  type ResearchSourceMode,
} from "./models";
import { RdPermissionPanel } from "./rd-permission-panel";

export function SharedResearchWorkspace({
  adapter = backendResearchAdapter,
  initialDomainAccess,
}: Readonly<{
  adapter?: ResearchBackendAdapter;
  initialDomainAccess?: readonly ResearchDomainAccessRecord[];
}>) {
  const [sourceMode, setSourceMode] = useState<ResearchSourceMode>("INTERNAL");
  const [domain, setDomain] = useState<ResearchDomainId>("TECHNOLOGY");
  const [question, setQuestion] = useState("");
  const [receipt, setReceipt] = useState<ResearchRequestReceipt | null>(null);
  const [rawError, setRawError] = useState<unknown | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [domainAccess, setDomainAccess] = useState<
    readonly ResearchDomainAccessRecord[] | undefined
  >(initialDomainAccess);

  useEffect(() => {
    if (initialDomainAccess !== undefined) return;
    const controller = new AbortController();
    adapter
      .loadDomainAccess(controller.signal)
      .then((response) => setDomainAccess(response.domains))
      .catch(() => setDomainAccess(undefined));
    return () => controller.abort();
  }, [adapter, initialDomainAccess]);

  const domainPermissions = useMemo(
    () => projectBackendDomainAccess(domainAccess),
    [domainAccess],
  );
  const canSubmit = domainPermissions[domain].isAllowed;

  async function requestResearch() {
    setSubmitting(true);
    setRawError(null);
    setReceipt(null);
    try {
      const response = await adapter.request({
        question: question.trim(),
        sourceMode,
        domain,
      });
      setReceipt(response);
    } catch (caught) {
      setRawError(caught);
    } finally {
      setSubmitting(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    void requestResearch();
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

      <RdPermissionPanel
        domainPermissions={domainPermissions}
        selectedDomain={domain}
        onSelectDomain={setDomain}
      />

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
          onChange={(event) => setDomain(event.target.value as ResearchDomainId)}
          value={domain}
        >
          {researchDomains.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
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

        <button
          className="button button--primary"
          disabled={submitting || !canSubmit}
          type="submit"
        >
          {submitting ? "Mengirim request…" : "Request research via Backend"}
        </button>
      </form>

      {rawError ? (
        <SafeErrorView error={rawError} onRetry={() => void requestResearch()} />
      ) : null}

      {receipt ? (
        <p className="success-note" role="status">
          Request {receipt.request_id} diterima Backend dengan state {receipt.state}.
          {" "}Decision: {receipt.decision}. Ref: {receipt.correlation_id}.
        </p>
      ) : null}
    </section>
  );
}
