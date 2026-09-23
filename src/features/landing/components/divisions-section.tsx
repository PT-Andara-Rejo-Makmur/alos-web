import {
  ArrowRight,
  Coins,
  FileCheck2,
  HardHat,
  ServerCog,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import Image from "next/image";

import { divisionsData } from "../data/landing-content";
import styles from "../landing-page.module.css";

const iconMap = {
  TrendingUp: TrendingUp,
  HardHat: HardHat,
  Coins: Coins,
  UsersRound: UsersRound,
  FileCheck2: FileCheck2,
  ServerCog: ServerCog,
};

export function DivisionsSection() {
  return (
    <section id="divisi" className={styles.divisionsSection} aria-label="Enam Divisi Utama ALOS">
      <div className={styles.sectionContainer}>
        {/* Header */}
        <div className={styles.divisionsHeader}>
          <div className={styles.divisionsTitleGroup}>
            <p className={styles.eyebrow}>ENAM DIVISI UTAMA</p>
            <h2 className={styles.sectionH2Dark}>Kolaborasi untuk Hasil yang Lebih Besar.</h2>
          </div>

          <p className={styles.divisionsSubcopy}>
            Setiap divisi terhubung dalam satu sistem dan dapat bekerja dengan dukungan AI Agent
            sesuai scope, role, serta hak akses yang berlaku.
          </p>
        </div>

        {/* 6 Division Cards Grid */}
        <div className={styles.divisionsGrid}>
          {divisionsData.map((division) => {
            const IconComponent = iconMap[division.iconName];
            return (
              <div
                key={division.id}
                className={styles.divisionCard}
                tabIndex={0}
                role="article"
                aria-label={`Divisi ${division.name}`}
              >
                {/* Background Image */}
                <div className={styles.divisionImageContainer}>
                  <Image
                    src={division.image}
                    alt={division.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 16vw"
                    className={styles.divisionImage}
                  />
                </div>

                {/* Gradient Overlay */}
                <div className={styles.divisionOverlay} aria-hidden="true" />

                {/* Card Content */}
                <div className={styles.divisionContent}>
                  <IconComponent className={styles.divisionIcon} size={28} strokeWidth={1.8} aria-hidden="true" />
                  <h3 className={styles.divisionName}>{division.name}</h3>
                  <p className={styles.divisionDesc}>{division.description}</p>
                  <div className={styles.divisionArrowBox} aria-hidden="true">
                    <ArrowRight size={14} strokeWidth={1.8} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
