import { directorReviewSections, type DecisionCommand } from "./models";

const decisions: readonly DecisionCommand[] = ["APPROVE", "RETURN", "REJECT", "HOLD"];

export function DirectorReviewProjection() {
  return (
    <section className="panel review-projection" aria-labelledby="director-review-title">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">REVIEW PACKAGE · EXECUTIVE PROJECTION</p>
          <h2 id="director-review-title">Decision context, without technical noise</h2>
        </div>
        <span className="status-pill status-pill--muted">Tidak ada package aktif</span>
      </div>
      <div className="executive-list">
        {directorReviewSections.map((section) => (
          <div key={section}>
            <span className="empty-value">—</span>
            <strong>{section}</strong>
          </div>
        ))}
      </div>
      <div className="decision-bar" aria-label="Decision command preview">
        {decisions.map((decision) => (
          <button disabled key={decision} type="button">
            {decision}
          </button>
        ))}
      </div>
      <p className="projection-note">
        Tombol aktif hanya dari Backend response; hasil command tidak diterapkan secara optimistic.
      </p>
    </section>
  );
}
