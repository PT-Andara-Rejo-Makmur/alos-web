import { ArrowRight, ChartNoAxesCombined, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import styles from "../landing-page.module.css";

export function HeroSection() {
  return (
    <section id="beranda" className={styles.heroSection} aria-label="Hero Section Beranda ALOS">
      {/* Background Hero Image */}
      <div className={styles.heroImageContainer}>
        <Image
          src="/images/landing/hero-residential-sunset.webp"
          alt="Hunian modern pada senja hari dengan pemandangan pegunungan"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
      </div>

      {/* Atmospheric Overlays */}
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={styles.heroGlow} aria-hidden="true" />

      {/* Hero Content */}
      <div className={styles.heroContent}>
        {/* Left Column: Typography & CTAs */}
        <div className={styles.heroLeft}>
          <p className={styles.eyebrow}>ONE SYSTEM. A STRONGER TOMORROW.</p>

          <h1 className={styles.heroH1}>ALOS</h1>

          <p className={styles.heroSubheading}>Andara Lean Operating System</p>

          <p className={styles.heroHeadline}>
            Mengintegrasikan Manusia, Proses, Data, dan AI Agent untuk Pertumbuhan Berkelanjutan.
          </p>

          <p className={styles.heroBody}>
            ALOS adalah sistem operasi terpadu PT Andara Rejo Makmur untuk menyatukan pekerjaan, data,
            proyek, tata kelola, dan kolaborasi manusia dengan AI dalam satu ekosistem yang terukur dan
            dapat ditelusuri.
          </p>

          <div className={styles.heroCtaGroup}>
            <Link href="/login" className={styles.goldButton}>
              <span>Masuk ke ALOS</span>
              <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </Link>

            <a href="#tentang" className={styles.outlineButton}>
              <span>Pelajari Lebih Lanjut</span>
            </a>
          </div>

          {/* Benefit Pills */}
          <div className={styles.heroBenefits}>
            <div className={styles.benefitItem}>
              <ShieldCheck className={styles.benefitIcon} size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>Secure &amp; Governed</span>
            </div>
            <div className={styles.benefitItem}>
              <ChartNoAxesCombined className={styles.benefitIcon} size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>Data-Driven Decisions</span>
            </div>
            <div className={styles.benefitItem}>
              <Zap className={styles.benefitIcon} size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>AI-Powered Execution</span>
            </div>
          </div>
        </div>

        {/* Right Column: Emblem & Quote */}
        <div className={styles.heroRight}>
          <div className={styles.emblemBox}>
            <div className={styles.emblemGlow}>
              <Image
                src="/brand/alos-logo-mark.png"
                alt="Emblem ALOS"
                width={80}
                height={80}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            <p className={styles.emblemTitle}>ALOS</p>
            <p className={styles.emblemTagline}>OPERATE · ORCHESTRATE · GROW</p>

            <blockquote className={styles.heroQuote}>
              &ldquo;Properti tidak hanya membangun rumah, tetapi membangun kehidupan yang lebih baik.&rdquo;
            </blockquote>
            <p className={styles.heroQuoteAuthor}>PT ANDARA REJO MAKMUR</p>
          </div>
        </div>
      </div>
    </section>
  );
}
