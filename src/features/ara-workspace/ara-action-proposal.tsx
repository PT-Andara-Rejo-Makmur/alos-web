"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import type { AraActionProposalItem } from "./types";
import styles from "./ara-workspace.module.css";

interface AraActionProposalProps {
  readonly proposals?: readonly AraActionProposalItem[];
  readonly onAttachContextRequest?: () => void;
}

export function AraActionProposal({
  proposals = [],
  onAttachContextRequest,
}: AraActionProposalProps) {
  return (
    <div className={styles.proposalsContainer}>
      {onAttachContextRequest && (
        <button
          type="button"
          className={styles.actionProposalBtn}
          onClick={onAttachContextRequest}
        >
          Lampirkan context
        </button>
      )}

      {proposals.map((item) => (
        <Link
          key={item.action_id}
          href={item.href}
          className={styles.actionProposalBtn}
          title={item.description ?? item.label}
        >
          <span>{item.label}</span>
          <ExternalLink size={12} aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}
