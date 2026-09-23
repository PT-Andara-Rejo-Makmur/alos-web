"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { landingNavigation } from "../data/landing-content";
import styles from "../landing-page.module.css";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* Dual Brand Identity */}
        <Link className={styles.brandGroup} href="#beranda" aria-label="Beranda ALOS PT Andara Rejo Makmur">
          <div className={styles.brandPrimary}>
            <Image
              src="/brand/pt-andara-logo.png"
              alt="Logo PT Andara Rejo Makmur"
              width={38}
              height={38}
              style={{ objectFit: "contain" }}
              priority
            />
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>PT ANDARA REJO MAKMUR</span>
              <span className={styles.brandSubtitle}>BUILDING A BETTER TOMORROW</span>
            </div>
          </div>

          <div className={styles.brandDivider} aria-hidden="true" />

          <div className={styles.brandAlos}>
            <Image
              src="/brand/alos-logo-mark.png"
              alt="Logo ALOS"
              width={30}
              height={30}
              style={{ objectFit: "contain" }}
              priority
            />
            <div className={styles.brandText}>
              <span className={styles.alosTitle}>ALOS</span>
              <span className={styles.alosSubtitle}>Andara Lean Operating System</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.navDesktop} aria-label="Navigasi Utama Landing Page">
          {landingNavigation.map((item) => (
            <a key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className={styles.headerActions}>
          <Link href="/login" className={styles.goldButton}>
            <span>Masuk ke ALOS</span>
            <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-menu"
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          >
            {mobileMenuOpen ? (
              <X size={24} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Menu size={24} strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="landing-mobile-menu" className={styles.mobileDrawer} role="region" aria-label="Menu navigasi mobile">
          {landingNavigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/login"
            className={styles.goldButton}
            onClick={() => setMobileMenuOpen(false)}
            style={{ marginTop: "0.5rem" }}
          >
            <span>Masuk ke ALOS</span>
            <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
      )}
    </header>
  );
}
