"use client";

import { useEffect, useRef } from "react";

import { AraActionProposal } from "./ara-action-proposal";
import { AraComposer } from "./ara-composer";
import { AraMessageEvidence } from "./ara-message-evidence";
import { AraSourceModeSelector } from "./ara-source-mode";
import type { AraMessage, AraSourceMode } from "./types";
import styles from "./ara-workspace.module.css";

interface AraChatThreadProps {
  readonly messages: readonly AraMessage[];
  readonly sourceMode: AraSourceMode;
  readonly onChangeSourceMode: (mode: AraSourceMode) => void;
  readonly prompt: string;
  readonly onPromptChange: (value: string) => void;
  readonly onSubmitPrompt: () => void;
  readonly onSelectQuickPrompt?: (text: string) => void;
  readonly onOpenContextPicker?: () => void;
  readonly isSending?: boolean;
}

const QUICK_PROMPTS = [
  "Ringkas prioritas",
  "Cari evidence",
  "Bandingkan dokumen",
  "Siapkan draft",
];

export function AraChatThread({
  messages,
  sourceMode,
  onChangeSourceMode,
  prompt,
  onPromptChange,
  onSubmitPrompt,
  onSelectQuickPrompt,
  onOpenContextPicker,
  isSending = false,
}: AraChatThreadProps) {
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof streamEndRef.current?.scrollIntoView === "function") {
      streamEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <div className={`${styles.railSurface} ${styles.chatThreadWrapper}`}>
      {/* Top Thread Bar */}
      <div className={styles.threadTopBar}>
        <div className={styles.threadHeaderInfo}>
          <span className={styles.threadBrandTitle}>ARA</span>
          <span className={styles.threadBrandSub}>
            Asisten kerja berbasis konteks ALOS Backend
          </span>
        </div>

        <AraSourceModeSelector
          mode={sourceMode}
          onChange={onChangeSourceMode}
          disabled={isSending}
        />
      </div>

      {/* Message Stream */}
      <div className={styles.messageStream} role="log" aria-live="polite" aria-label="Percakapan ARA">
        {/* Welcome Card */}
        <div className={styles.welcomeCard}>
          <div className={styles.araAvatar} aria-hidden="true">A</div>
          <div className={styles.welcomeContent}>
            <h3 className={styles.welcomeTitle}>Apa yang ingin Anda kerjakan?</h3>
            <p className={styles.welcomeText}>
              Saya akan menggunakan konteks, evidence, dan capability yang diizinkan Backend.
              Keputusan material tetap milik manusia.
            </p>
          </div>
        </div>

        {/* Quick Action Shortcuts (MULAI CEPAT) */}
        <div className={styles.quickActionsSection}>
          <span className={styles.quickActionLabel}>MULAI CEPAT</span>
          <div className={styles.quickActionGrid}>
            {QUICK_PROMPTS.map((actionText) => (
              <button
                key={actionText}
                type="button"
                className={styles.quickActionBtn}
                onClick={() => {
                  if (onSelectQuickPrompt) {
                    onSelectQuickPrompt(actionText);
                  } else {
                    onPromptChange(actionText);
                  }
                }}
              >
                {actionText}
              </button>
            ))}
          </div>
        </div>

        {/* Message History */}
        {messages.map((msg) => {
          if (msg.actor_kind === "HUMAN") {
            return (
              <div key={msg.message_id} className={styles.humanMessageRow}>
                <div className={styles.humanBubble}>
                  {msg.content}
                </div>
              </div>
            );
          }

          // Assistant Message
          const summary = msg.summary || msg.content;
          const limitations = msg.limitations && msg.limitations.length > 0
            ? msg.limitations
            : ["Tidak ada klaim final tanpa source dan scope yang sah."];

          return (
            <div key={msg.message_id} className={styles.assistantMessageRow}>
              <div className={styles.araAvatar} aria-hidden="true">A</div>
              <div className={styles.assistantCard}>
                {/* Summary Section */}
                <div className={styles.responseSection}>
                  <h4 className={styles.sectionHeading}>Ringkasan</h4>
                  <p className={styles.sectionText}>{summary}</p>
                </div>

                {/* Evidence Section */}
                <AraMessageEvidence citations={msg.citations} />

                {/* Limitations Section */}
                <div className={styles.responseSection}>
                  <h4 className={styles.goldSectionHeading}>Limitasi</h4>
                  {limitations.map((limit, lIdx) => (
                    <p key={lIdx} className={styles.sectionText}>{limit}</p>
                  ))}
                </div>

                {/* Action Proposals */}
                <AraActionProposal
                  proposals={msg.action_proposals}
                  onAttachContextRequest={onOpenContextPicker}
                />
              </div>
            </div>
          );
        })}

        <div ref={streamEndRef} />
      </div>

      {/* Composer */}
      <AraComposer
        prompt={prompt}
        onPromptChange={onPromptChange}
        onSubmit={onSubmitPrompt}
        onOpenContextPicker={onOpenContextPicker}
        isSending={isSending}
      />
    </div>
  );
}
