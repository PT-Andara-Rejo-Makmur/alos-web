"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useRef,
} from "react";
import { ArrowUp, Paperclip } from "lucide-react";

import styles from "./ara-workspace.module.css";

interface AraComposerProps {
  readonly prompt: string;
  readonly onPromptChange: (value: string) => void;
  readonly onSubmit: (event?: FormEvent) => void;
  readonly onOpenContextPicker?: () => void;
  readonly disabled?: boolean;
  readonly isSending?: boolean;
}

export function AraComposer({
  prompt,
  onPromptChange,
  onSubmit,
  onOpenContextPicker,
  disabled = false,
  isSending = false,
}: AraComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onPromptChange(event.target.value);
    // Auto-grow textarea up to max-height
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (prompt.trim() && !disabled && !isSending) {
        onSubmit();
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }
  }

  function handleFormSubmit(event: FormEvent) {
    event.preventDefault();
    if (prompt.trim() && !disabled && !isSending) {
      onSubmit(event);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }

  const canSubmit = prompt.trim().length > 0 && !disabled && !isSending;

  return (
    <form className={styles.composerArea} onSubmit={handleFormSubmit}>
      <div className={styles.composerInputBox}>
        {onOpenContextPicker && (
          <button
            type="button"
            className={styles.attachContextBtn}
            onClick={onOpenContextPicker}
            aria-label="Lampirkan konteks backend"
            title="Lampirkan konteks dari Backend"
            disabled={disabled || isSending}
          >
            <Paperclip size={18} aria-hidden="true" />
          </button>
        )}

        <textarea
          ref={textareaRef}
          className={styles.composerTextarea}
          placeholder="Tulis permintaan untuk ARA..."
          value={prompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Input pesan permintaan untuk ARA"
          disabled={disabled || isSending}
          rows={1}
        />

        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!canSubmit}
          aria-label={isSending ? "Mengirim pesan..." : "Kirim permintaan ke ARA"}
        >
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      </div>

      <p className={styles.composerDisclaimer}>
        ARA tidak menjalankan model, tool, atau authority langsung dari browser.
      </p>
    </form>
  );
}
