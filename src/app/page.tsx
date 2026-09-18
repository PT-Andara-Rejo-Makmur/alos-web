import Link from "next/link";

import { ConnectionStatus } from "@/components/feedback/connection-status";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { experiences } from "@/experiences/registry";

export default function HomePage() {
  return (
    <main className="page-stack">
      <section className="hero panel">
        <div>
          <p className="eyebrow">ANDARA LEAN OPERATING SYSTEM</p>
          <h1>Satu workspace untuk bekerja, berkolaborasi, dan mengambil keputusan.</h1>
          <p className="hero-copy">
            ALOS menyatukan pengalaman manusia dan AI tanpa memindahkan authority dari Backend.
            Setiap aksi tetap scoped, traceable, dan menunggu canonical response.
          </p>
        </div>
        <ConnectionStatus />
      </section>

      <section aria-labelledby="workspace-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">WORKSPACES</p>
            <h2 id="workspace-title">Pilih pengalaman kerja</h2>
          </div>
          <span className="quiet-label">{experiences.length} area · 1 authority</span>
        </div>
        <div className="experience-grid">
          {experiences.map((experience) => (
            <Link className="experience-card" href={experience.href} key={experience.id}>
              <ExperienceIcon tone={experience.tone} />
              <div>
                <p className="card-kicker">{experience.audience}</p>
                <h3>{experience.name}</h3>
                <p>{experience.summary}</p>
              </div>
              <span aria-hidden="true" className="card-arrow">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="authority-strip" aria-label="Boundary authority">
        <div>
          <span className="status-dot status-dot--safe" />
          <strong>Backend authoritative</strong>
        </div>
        <p>Frontend hanya menampilkan projection dan mengirim command yang tervalidasi.</p>
      </section>
    </main>
  );
}
