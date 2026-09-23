import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Network,
  SearchCheck,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import styles from "../landing-page.module.css";

export function GenesisSection() {
  return (
    <section id="genesis" className={styles.genesisSection} aria-label="Ekosistem GENESIS AI Agent">
      <div className={styles.sectionContainer}>
        <div className={styles.genesisGrid}>
          {/* Left: Copy & CTA */}
          <div className={styles.genesisLeft}>
            <p className={styles.sectionEyebrowLight}>DIDUKUNG OLEH GENESIS</p>
            <h2 className={styles.sectionH2Light}>AI Agent untuk Eksekusi yang Terarah.</h2>
            <p className={styles.genesisBody}>
              GENESIS adalah ekosistem AI Agent yang membantu setiap divisi melakukan riset, analisis,
              otomasi, dan kolaborasi secara terkontrol, sementara keputusan dan otoritas bisnis tetap
              berada pada manusia dan Backend ALOS.
            </p>
            <div className={styles.aboutCta}>
              <a href="#kontak" className={styles.goldButtonLight}>
                <span>Kenali GENESIS</span>
                <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Center: CSS & Lucide Visual Diagram */}
          <div className={styles.genesisDiagram} aria-label="Diagram Kapabilitas GENESIS">
            {/* Top Capabilities */}
            <div className={styles.capabilitiesWrapper}>
              <div className={styles.capabilitiesRowTop}>
                <div className={styles.capabilityChip}>
                  <SearchCheck className={styles.capabilityIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span>Research &amp; Analysis</span>
                </div>
                <div className={styles.capabilityChip}>
                  <Bot className={styles.capabilityIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span>Automation &amp; Execution</span>
                </div>
              </div>

              {/* Central Pedestal Node */}
              <div className={styles.genesisPedestal}>
                <span className={styles.genesisPedestalText}>GENESIS</span>
              </div>

              {/* Bottom Capabilities */}
              <div className={styles.capabilitiesRowBottom}>
                <div className={styles.capabilityChip}>
                  <BrainCircuit className={styles.capabilityIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span>Knowledge &amp; Memory</span>
                </div>
                <div className={styles.capabilityChip}>
                  <ShieldCheck className={styles.capabilityIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span>Governance &amp; Safety</span>
                </div>
                <div className={styles.capabilityChip}>
                  <Network className={styles.capabilityIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span>Multi-Agent Collaboration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: AI Agent Ecosystem Card */}
          <div className={styles.genesisRightPanel}>
            <div className={styles.ecosystemIconBox}>
              <UsersRound size={34} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <h3 className={styles.ecosystemTitle}>AI Agent Ecosystem</h3>
            <p className={styles.ecosystemDesc}>
              Siap mendukung operasional PT Andara Rejo Makmur secara terukur dan governed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
