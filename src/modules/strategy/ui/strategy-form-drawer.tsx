"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { X, Lock } from "lucide-react";
import styles from "./strategy-ui.module.css";

interface StrategyFormDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly submitLabel?: string;
}

export function StrategyFormDrawer({
  isOpen,
  onClose,
  title,
  description = "Formulir pratinjau antarmuka. Penyimpanan data memerlukan integrasi kontrak Backend.",
  children,
  submitLabel = "Simpan",
}: StrategyFormDrawerProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className="alos-modal-backdrop"
      role="dialog"
      aria-labelledby="strategy-form-drawer-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e7e5e4",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e7e5e4",
          }}
        >
          <div>
            <h3
              id="strategy-form-drawer-title"
              style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#1c1917" }}
            >
              {title}
            </h3>
            {description ? (
              <p style={{ fontSize: "12px", color: "#78716c", margin: "2px 0 0" }}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label="Tutup form"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#78716c",
              borderRadius: "4px",
            }}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{ padding: "20px" }}>
          {children}

          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #e7e5e4",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "#92400e",
                background: "#fef3c7",
                padding: "8px 12px",
                borderRadius: "6px",
              }}
            >
              <Lock size={14} style={{ flexShrink: 0 }} />
              <span>Fungsi penyimpanan menunggu kontrak Backend.</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
              <button
                className={styles.buttonSecondary}
                onClick={onClose}
                type="button"
              >
                Batal
              </button>
              <button
                className={styles.buttonPrimary}
                disabled={true}
                title="Menunggu ketersediaan endpoint mutasi Backend"
                type="submit"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
