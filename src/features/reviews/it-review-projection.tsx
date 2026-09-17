import { itReviewSections } from "./models";

export function ItReviewProjection() {
  return (
    <section className="panel review-projection" aria-labelledby="it-review-title">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">REVIEW PACKAGE · IT PROJECTION</p>
          <h2 id="it-review-title">Detailed assurance structure</h2>
        </div>
        <span className="status-pill status-pill--muted">Menunggu Backend</span>
      </div>
      <div className="review-section-grid">
        {itReviewSections.map((section, index) => (
          <div className="review-section" key={section}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{section}</strong>
          </div>
        ))}
      </div>
      <p className="projection-note">
        AI recommendation ditampilkan sebagai assurance input, tidak pernah sebagai approval.
      </p>
    </section>
  );
}
