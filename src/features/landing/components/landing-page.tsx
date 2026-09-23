import styles from "../landing-page.module.css";
import { AboutSection } from "./about-section";
import { DivisionsSection } from "./divisions-section";
import { FinalCtaSection } from "./final-cta-section";
import { GenesisSection } from "./genesis-section";
import { HeroSection } from "./hero-section";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";

export function LandingPage() {
  return (
    <div className={styles.landingWrapper}>
      <LandingHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <DivisionsSection />
        <GenesisSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
