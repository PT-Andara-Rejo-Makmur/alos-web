"use client";

import { ArrowRight } from "lucide-react";
import type { WorkspaceChoice } from "./workspace-choice";
import styles from "./workspace-resolver.module.css";

export function WorkspaceChoiceCard({
  choice,
  isSelected,
  onSelect,
}: {
  readonly choice: WorkspaceChoice;
  readonly isSelected: boolean;
  readonly onSelect: (choice: WorkspaceChoice) => void;
}) {
  const handleClick = () => {
    if (choice.isAvailable) {
      onSelect(choice);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      aria-checked={isSelected}
      aria-disabled={!choice.isAvailable}
      aria-label={`Pilih ruang kerja ${choice.name}`}
      className={`${styles.card} ${isSelected ? styles.cardSelected : ""} ${
        !choice.isAvailable ? styles.cardDisabled : ""
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="radio"
      tabIndex={choice.isAvailable ? 0 : -1}
    >
      {/* Top Header */}
      <div className={styles.cardTop}>
        <div className={styles.cardHeaderLeft}>
          <div aria-hidden="true" className={styles.cardInitial}>
            {choice.initial}
          </div>
          <span className={styles.cardDivisionTag}>
            {choice.divisionLabel}
          </span>
        </div>
        {isSelected ? (
          <span className={styles.selectedBadge}>DIPILIH</span>
        ) : null}
      </div>

      {/* Main Title & Role */}
      <div>
        <h3 className={styles.cardTitle}>{choice.name}</h3>
        <p className={styles.cardRole}>
          {choice.isAvailable
            ? choice.roleLabel
            : "Workspace belum memiliki experience aktif."}
        </p>
      </div>

      {/* Bottom Metadata & Indicator */}
      <div className={styles.cardBottom}>
        <span className={styles.cardMetadata}>
          {choice.isAvailable
            ? choice.contextMetadata
            : "Hubungi Administrator"}
        </span>
        <ArrowRight
          aria-hidden="true"
          className={styles.cardArrow}
          size={18}
          strokeWidth={2}
        />
      </div>
    </div>
  );
}
