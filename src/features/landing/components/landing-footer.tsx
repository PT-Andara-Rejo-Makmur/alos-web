import Image from "next/image";
import Link from "next/link";

import { landingNavigation } from "../data/landing-content";
import styles from "../landing-page.module.css";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="kontak-info" className={styles.footer} aria-label="Footer ALOS">
      <div className={styles.footerContainer}>
        <div className={styles.footerTop}>
          {/* Brand Column */}
          <div className={styles.footerBrandColumn}>
            <div className={styles.brandGroup}>
              <div className={styles.brandPrimary}>
                <Image
                  src="/brand/pt-andara-logo.png"
                  alt="Logo PT Andara Rejo Makmur"
                  width={38}
                  height={38}
                  style={{ objectFit: "contain" }}
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
                />
                <div className={styles.brandText}>
                  <span className={styles.alosTitle}>ALOS</span>
                  <span className={styles.alosSubtitle}>Andara Lean Operating System</span>
                </div>
              </div>
            </div>

            <p className={styles.footerDesc}>
              Sistem operasi terpadu PT Andara Rejo Makmur untuk mengorkestrasi pekerjaan, data, proyek,
              dan kolaborasi manusia dengan AI dalam satu tata kelola yang terukur dan terpercaya.
            </p>
          </div>

          {/* Navigation Column */}
          <nav className={styles.footerNav} aria-label="Navigasi Footer">
            {landingNavigation.map((item) => (
              <a key={item.href} href={item.href} className={styles.footerNavLink}>
                {item.label}
              </a>
            ))}
            <Link href="/login" className={styles.footerNavLink}>
              Masuk ke ALOS
            </Link>
          </nav>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <span>&copy; {currentYear} PT Andara Rejo Makmur. All rights reserved.</span>
          <span className={styles.footerAuthority}>
            ALOS &middot; Authority bisnis dan runtime berada di Backend
          </span>
        </div>
      </div>
    </footer>
  );
}
