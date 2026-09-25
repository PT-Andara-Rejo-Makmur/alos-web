import Link from "next/link";
import { ArrowRight } from "lucide-react";

import styles from "./agent-workforce.module.css";

interface AgentWorkforceBannerProps {
  readonly araHref?: string;
}

export function AgentWorkforceBanner({ araHref = "/workspace" }: AgentWorkforceBannerProps) {
  return (
    <section className={styles.boundaryBanner} aria-label="Informasi Ruang Lingkup Workforce">
      <div className={styles.bannerContent}>
        <span className={styles.bannerEyebrow}>BUSINESS-FACING WORKFORCE</span>
        <p className={styles.bannerText}>
          Daftar ini berasal dari agent/capability yang diizinkan untuk workspace aktif. Registry teknis tetap di GENESIS.
        </p>
      </div>
      <Link
        href={araHref}
        className={styles.bannerCta}
        aria-label="Buka ARA untuk bekerja dengan agent"
      >
        <span>Buka ARA untuk bekerja</span>
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </section>
  );
}
