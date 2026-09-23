import { ArrowRight, BarChart3, Cpu, Layers3, ShieldCheck } from "lucide-react";

import { aboutFeatures } from "../data/landing-content";
import styles from "../landing-page.module.css";

const iconMap = {
  Layers3: Layers3,
  BarChart3: BarChart3,
  Cpu: Cpu,
  ShieldCheck: ShieldCheck,
};

export function AboutSection() {
  return (
    <section id="tentang" className={styles.aboutSection} aria-label="Tentang ALOS">
      {/* Anchor for #fitur navigation */}
      <div id="fitur" style={{ position: "relative", top: "-80px" }} aria-hidden="true" />

      <div className={styles.sectionContainer}>
        {/* Header Grid */}
        <div className={styles.aboutHeader}>
          <div>
            <p className={styles.sectionEyebrowLight}>TENTANG ALOS</p>
            <h2 className={styles.sectionH2Light}>Lebih dari Sekadar Sistem, Ini Cara Kerja Baru.</h2>
          </div>

          <div>
            <p className={styles.aboutBodyLight}>
              ALOS menjadi fondasi digital PT Andara Rejo Makmur untuk mengorkestrasi aktivitas perusahaan
              secara terintegrasi, efisien, berbasis bukti, dan tetap berada dalam tata kelola manusia.
            </p>
            <div className={styles.aboutCta}>
              <a href="#divisi" className={styles.goldButtonLight}>
                <span>Pelajari Tentang ALOS</span>
                <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* 4 Feature Cards */}
        <div className={styles.featureGrid}>
          {aboutFeatures.map((feature) => {
            const IconComponent = iconMap[feature.iconName];
            return (
              <div key={feature.id} className={styles.featureCard}>
                <div className={styles.featureIconBox}>
                  <IconComponent size={26} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
