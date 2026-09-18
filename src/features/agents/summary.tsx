import type { AgentCapabilitySummary } from "./models";

export function AgentCapabilitySummaryCard({
  item,
}: Readonly<{ item: AgentCapabilitySummary }>) {
  return (
    <article className="summary-card">
      <div className="summary-card-heading">
        <span className="summary-label">{item.kind}</span>
        <span className="status-pill">{item.lifecycleState}</span>
      </div>
      <h3>{item.identifier}</h3>
      <p>{item.purpose}</p>
      <dl className="detail-grid">
        <div><dt>Capability type</dt><dd>{item.capabilityType}</dd></div>
        <div><dt>Version</dt><dd>{item.version}</dd></div>
        <div><dt>Scope</dt><dd>{item.scope.join(", ") || "None returned"}</dd></div>
        <div><dt>Risk</dt><dd>{item.risk}</dd></div>
        <div><dt>Tools</dt><dd>{item.tools.join(", ") || "None returned"}</dd></div>
        <div><dt>Readiness</dt><dd>{item.readiness}</dd></div>
      </dl>
    </article>
  );
}

export function AgentCapabilitySummaryList({
  items,
}: Readonly<{ items: readonly AgentCapabilitySummary[] }>) {
  return (
    <section className="panel feature-workspace" aria-labelledby="registry-summary-title">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">BACKEND REGISTRY PROJECTION</p>
          <h2 id="registry-summary-title">Agent & Capability summary</h2>
        </div>
        <span className="status-pill status-pill--muted">Read only</span>
      </div>
      {items.length ? (
        <div className="summary-grid">
          {items.map((item) => <AgentCapabilitySummaryCard item={item} key={item.identifier} />)}
        </div>
      ) : (
        <div className="empty-projection" role="status">
          <strong>Menunggu Registry API Backend</strong>
          <p>Tidak ada Agent atau Capability state yang dibuat secara lokal.</p>
        </div>
      )}
    </section>
  );
}
