import Link from "next/link";
import { Settings2 } from "lucide-react";

import { getGenesisRoute } from "@/features/workspace-routing";
import { canActorAccessGenesis } from "./agent-workforce-projection";
import styles from "./agent-workforce.module.css";

interface AgentWorkforceAuthorityProps {
  readonly actorRoles: readonly string[];
}

export function AgentWorkforceAuthority({ actorRoles }: AgentWorkforceAuthorityProps) {
  const isAuthorizedForGenesis = canActorAccessGenesis(actorRoles);

  return (
    <article className={styles.authorityCard} aria-labelledby="authority-title">
      <div>
        <span className={styles.authorityEyebrow}>AUTHORITY BOUNDARY</span>
        <h3 id="authority-title" className={styles.authorityTitle}>
          AI bekerja, manusia berwenang
        </h3>
      </div>

      <div className={styles.authorityList}>
        <div className={styles.authorityItem}>
          <span className={styles.authorityItemLabel}>AI</span>
          <span className={styles.authorityItemDesc}>
            Draft, analisis, checklist, rekomendasi
          </span>
        </div>

        <div className={styles.authorityItem}>
          <span className={styles.authorityItemLabel}>Human</span>
          <span className={styles.authorityItemDesc}>
            Approve, release, sign, spend, grant access
          </span>
        </div>

        <div className={styles.authorityItem}>
          <span className={styles.authorityItemLabel}>GENESIS</span>
          <span className={styles.authorityItemDesc}>
            Registry, test, lifecycle, kill switch
          </span>
        </div>
      </div>

      {isAuthorizedForGenesis ? (
        <Link
          href={getGenesisRoute()}
          className={styles.genesisLinkButton}
          aria-label="Buka GENESIS Control Plane untuk reviewer teknis"
        >
          <Settings2 size={14} aria-hidden="true" />
          <span>Detail teknis → GENESIS (authorized only)</span>
        </Link>
      ) : null}
    </article>
  );
}
