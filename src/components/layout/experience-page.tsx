import type { ReactNode } from "react";

import { ConnectionStatus } from "@/components/feedback/connection-status";
import type { ExperienceDefinition } from "@/experiences/registry";

export function ExperiencePage({
  experience,
  children,
}: Readonly<{ experience: ExperienceDefinition; children?: ReactNode }>) {
  return (
    <main className="page-stack">
      <section className={`experience-hero panel tone-${experience.tone}`}>
        <div>
          <p className="eyebrow">{experience.audience}</p>
          <h1>{experience.name}</h1>
          <p className="hero-copy">{experience.description}</p>
        </div>
        <ConnectionStatus compact />
      </section>

      <section className="workspace-grid">
        <article className="panel workspace-panel">
          <div className="section-heading section-heading--compact">
            <div>
              <p className="eyebrow">WORKSPACE STATUS</p>
              <h2>Menunggu integrasi Backend</h2>
            </div>
            <span className="status-pill status-pill--muted">Belum dikonfigurasi</span>
          </div>
          <p>
            Tidak ada fake business data pada baseline. Konten authoritative akan dimuat dari
            ALOS Backend setelah environment dan session pengguna tersedia.
          </p>
        </article>
        <aside className="panel boundary-panel">
          <p className="eyebrow">AUTHORITY BOUNDARY</p>
          <h2>{experience.boundaryTitle}</h2>
          <p>{experience.boundary}</p>
        </aside>
      </section>

      {children}
    </main>
  );
}
