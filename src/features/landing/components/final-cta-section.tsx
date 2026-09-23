import { ArrowRight, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import styles from "../landing-page.module.css";

export function FinalCtaSection() {
  return (
    <section id="kontak" className={styles.finalCtaSection} aria-label="Aksi Utama dan Hubungi Kami">
      {/* Background Community Image */}
      <div className={styles.ctaImageContainer}>
        <Image
          src="/images/landing/cta-residential-community.webp"
          alt="Kawasan hunian modern dilihat dari ketinggian saat senja"
          fill
          sizes="100vw"
          className={styles.ctaImage}
        />
      </div>

      {/* Atmospheric Dark Overlay */}
      <div className={styles.ctaOverlay} aria-hidden="true" />

      {/* Content */}
      <div className={styles.ctaContent}>
        <div className={styles.ctaTextGroup}>
          <h2 className={styles.ctaHeading}>Membangun Hari Ini untuk Generasi Esok.</h2>
          <p className={styles.ctaSupporting}>
            Satu sistem untuk menyatukan strategi, operasi, tata kelola, dan teknologi PT Andara Rejo
            Makmur.
          </p>
        </div>

        <div className={styles.ctaActions}>
          <Link href="/login" className={styles.goldButton}>
            <span>Masuk ke ALOS</span>
            <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </Link>

          <a href="#kontak-info" className={styles.outlineButton}>
            <MessageSquare size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Hubungi Kami</span>
          </a>
        </div>
      </div>
    </section>
  );
}
