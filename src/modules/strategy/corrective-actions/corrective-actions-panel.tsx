"use client";

import React from "react";
import { Wrench, Plus, Link2Off } from "lucide-react";
import type { CorrectiveActionItem } from "../shared/types";
import styles from "../ui/strategy-ui.module.css";

interface CorrectiveActionsPanelProps {
  readonly items?: readonly CorrectiveActionItem[];
  readonly reviewId?: string;
  readonly isBackendConnected?: boolean;
}

export const CorrectiveActionsPanel: React.FC<CorrectiveActionsPanelProps> = ({
  items = [],
  isBackendConnected = false,
}) => {
  return (
    <div className={styles.correctiveSection}>
      <div className={styles.correctiveHeader}>
        <div>
          <div className={styles.sectionEyebrow}>Rantai Tindak Lanjut</div>
          <h4 className={styles.correctiveTitle}>Tindakan Perbaikan</h4>
          <p className={styles.correctiveSubtitle}>
            Tindakan korektif yang menghubungkan hasil review kinerja ke proyek atau tugas eksekusi.
          </p>
        </div>
        <div className={styles.actionWithHelper}>
          <button
            type="button"
            className={styles.buttonDisabled}
            disabled
            title="Backend belum mendukung pembuatan tindak lanjut dari review kinerja"
          >
            <Plus size={14} aria-hidden="true" />
            <span>Buat Tindak Lanjut</span>
          </button>
          <span className={styles.inlineHelper}>
            Backend belum mendukung pembuatan tindak lanjut dari review kinerja.
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyContainerSmall}>
          <Wrench size={18} className={styles.emptyIcon} aria-hidden="true" />
          <p className={styles.emptyTitleSmall}>
            {isBackendConnected
              ? "Belum ada tindakan perbaikan yang tercatat untuk review ini"
              : "Tautan tindakan perbaikan belum terhubung"}
          </p>
          <p className={styles.emptyHelperSmall}>
            Tindakan korektif yang diterbitkan dari analisis penyebab kinerja akan dipetakan ke Proyek dan Tugas operasional.
          </p>
        </div>
      ) : (
        <div className={styles.actionList}>
          {items.map((act) => (
            <div key={act.id} className={styles.actionCard}>
              <div className={styles.actionCardHeader}>
                <span className={styles.actionCardTitle}>{act.title}</span>
                <span className={styles.tag}>{act.status ?? "DALAM_PROSES"}</span>
              </div>
              {act.description && (
                <p className={styles.actionCardDesc}>{act.description}</p>
              )}
              <div className={styles.actionMeta}>
                <span>Pemilik role: {act.owner_role_ref ?? "—"}</span>
                <span>Tenggat: {act.due_date ?? "—"}</span>
                {act.linked_project_id ? (
                  <span className={styles.tagProject}>
                    Proyek: {act.linked_project_id}
                  </span>
                ) : act.linked_task_id ? (
                  <span className={styles.tagProject}>
                    Tugas: {act.linked_task_id}
                  </span>
                ) : (
                  <span className={styles.unlinkedText}>
                    <Link2Off size={11} aria-hidden="true" />
                    Belum ada tugas operasional
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
