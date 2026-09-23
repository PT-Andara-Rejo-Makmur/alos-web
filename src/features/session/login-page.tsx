"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "./login-form";
import styles from "./login-page.module.css";

export function LoginPage() {
  return (
    <div className={styles.loginWrapper}>
      {/* ===================================================================
          Mobile Top Banner (< 960px)
          =================================================================== */}
      <div className={styles.mobileBanner} aria-hidden="true">
        <Image
          src="/images/login/login-residential-entry-mobile.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.mobileBannerImage}
        />
        <div className={styles.mobileBannerOverlay} />
        <div className={styles.mobileBannerContent}>
          <div className={styles.brandIdentity}>
            <div className={styles.brandLogoBox}>
              <Image
                src="/brand/pt-andara-logo.png"
                alt="Logo PT Andara Rejo Makmur"
                width={28}
                height={28}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>PT ANDARA REJO MAKMUR</span>
              <span className={styles.brandSubtitle}>BUILDING A BETTER TOMORROW</span>
            </div>
          </div>

          <div className={styles.mobileBannerBottom}>
            <p className={styles.mobileBannerEyebrow}>SATU IDENTITAS &middot; AKSES SESUAI PERAN</p>
            <h2 className={styles.mobileBannerHeadline}>
              Satu sistem untuk bekerja dan bertumbuh.
            </h2>
          </div>
        </div>
      </div>

      {/* ===================================================================
          Left Panel: Brand Visual (Desktop >= 960px)
          =================================================================== */}
      <section className={styles.visualPanel} aria-label="Visual Identitas ALOS">
        {/* Background Entry Image */}
        <div className={styles.visualImageContainer}>
          <Image
            src="/images/login/login-residential-entry.webp"
            alt=""
            fill
            priority
            sizes="56vw"
            className={styles.visualImage}
          />
        </div>

        {/* Cinematic Dark Overlay */}
        <div className={styles.visualOverlay} aria-hidden="true" />

        {/* Top: PT Andara Identity */}
        <div className={styles.visualHeader}>
          <Link href="/" className={styles.brandIdentity} aria-label="Beranda PT Andara Rejo Makmur">
            <div className={styles.brandLogoBox}>
              <Image
                src="/brand/pt-andara-logo.png"
                alt="Logo PT Andara Rejo Makmur"
                width={26}
                height={26}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>PT ANDARA REJO MAKMUR</span>
              <span className={styles.brandSubtitle}>BUILDING A BETTER TOMORROW</span>
            </div>
          </Link>
        </div>

        {/* Bottom: Headline, Body, and Tagline */}
        <div className={styles.visualFooter}>
          <p className={styles.eyebrow}>SATU IDENTITAS &middot; AKSES SESUAI PERAN</p>
          <h1 className={styles.visualHeadline}>
            Satu sistem untuk bekerja, mengendalikan, dan bertumbuh.
          </h1>
          <p className={styles.visualBody}>
            ALOS menyatukan proses, data, keputusan, dan AI Agent dalam satu operating system
            perusahaan yang terukur dan berbasis bukti.
          </p>
          <div className={styles.visualDivider} aria-hidden="true" />
          <p className={styles.visualTagline}>OPERATE &middot; ORCHESTRATE &middot; GROW</p>
        </div>
      </section>

      {/* ===================================================================
          Right Panel: Authentication Form
          =================================================================== */}
      <main className={styles.formPanel} aria-label="Autentikasi Pengguna ALOS">
        {/* Top Bar Navigation */}
        <div className={styles.formTopBar}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Kembali ke beranda</span>
          </Link>
        </div>

        {/* Main Form Container */}
        <div className={styles.formContainer}>
          {/* Official ALOS Mark */}
          <div className={styles.alosLogoBox}>
            <Image
              src="/brand/alos-logo-mark.png"
              alt="Logo ALOS"
              width={52}
              height={52}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          <p className={styles.formEyebrow}>ANDARA LEAN OPERATING SYSTEM</p>
          <h2 className={styles.formHeading}>Selamat datang kembali.</h2>
          <p className={styles.formDescription}>
            Masuk menggunakan akun PT Andara Rejo Makmur untuk mengakses workspace sesuai peran dan hak
            akses Anda.
          </p>

          {/* Form */}
          <LoginForm />

          {/* Mobile Bottom Links */}
          <div className={styles.mobileNavLinks}>
            <Link href="/">Kembali ke beranda</Link>
            <span aria-hidden="true" className={styles.mobileNavLinksDot}>&middot;</span>
            <a href="#admin-contact" onClick={(e) => { e.preventDefault(); alert("Silakan hubungi administrator TI PT Andara Rejo Makmur untuk kendala akses."); }}>
              Hubungi administrator
            </a>
          </div>
        </div>

        {/* Form Footer */}
        <div className={styles.formFooter}>
          <p className={styles.footerMeta}>PT ANDARA REJO MAKMUR &middot; INTERNAL SYSTEM</p>
        </div>
      </main>
    </div>
  );
}
