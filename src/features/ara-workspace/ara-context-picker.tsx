"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import type { AraContextOption, ContextEntityType } from "./types";
import styles from "./ara-workspace.module.css";

interface AraContextPickerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSelectOption: (option: AraContextOption) => void;
  readonly options?: readonly AraContextOption[];
  readonly isLoading?: boolean;
}

const ENTITY_TABS: readonly ContextEntityType[] = [
  "DOCUMENT",
  "PROJECT",
  "TASK",
  "EVIDENCE",
  "FINDING",
  "REPORT",
];

export function AraContextPicker({
  isOpen,
  onClose,
  onSelectOption,
  options = [],
  isLoading = false,
}: AraContextPickerProps) {
  const [selectedType, setSelectedType] = useState<ContextEntityType>("DOCUMENT");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredOptions = options.filter((item) => {
    const matchesType = item.entity_type === selectedType;
    const matchesSearch = searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesType && matchesSearch;
  });

  return (
    <div
      className={styles.drawerOverlay}
      style={{ justifyContent: "center", alignItems: "center" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pilih entitas konteks dari Backend"
    >
      <div
        className={styles.railSurface}
        style={{
          width: "90%",
          maxWidth: "480px",
          maxHeight: "80vh",
          padding: "18px",
          gap: "14px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#141619" }}>
              Lampirkan Konteks
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#666055" }}>
              Hanya entitas dalam wewenang Backend yang dapat dilampirkan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "#666" }}
            aria-label="Tutup pemilih konteks"
          >
            <X size={20} />
          </button>
        </div>

        {/* Entity Type Selector Tabs */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {ENTITY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedType(tab)}
              style={{
                padding: "6px 10px",
                fontSize: "11px",
                fontWeight: 600,
                borderRadius: "6px",
                border: "1px solid",
                borderColor: selectedType === tab ? "#c5a572" : "#dcd7ce",
                backgroundColor: selectedType === tab ? "#faf5ea" : "#faf9f6",
                color: selectedType === tab ? "#926f28" : "#555047",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className={styles.searchBox}>
          <Search size={14} color="#8a8275" aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={`Cari ${selectedType.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={`Cari entitas ${selectedType}`}
          />
        </div>

        {/* Options List */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", minHeight: "160px" }}>
          {isLoading ? (
            <p style={{ fontSize: "12px", color: "#8a8275", textAlign: "center", margin: "auto" }}>
              Memuat opsi konteks dari Backend...
            </p>
          ) : filteredOptions.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#8a8275", textAlign: "center", margin: "auto" }}>
              Belum ada entitas {selectedType.toLowerCase()} yang tersedia dalam scope aktif.
            </p>
          ) : (
            filteredOptions.map((opt) => (
              <button
                key={opt.entity_id}
                type="button"
                onClick={() => {
                  onSelectOption(opt);
                  onClose();
                }}
                className={styles.conversationItem}
                style={{ border: "1px solid #e8e6df" }}
              >
                <div className={styles.convContent}>
                  <p className={styles.convTitle}>{opt.title}</p>
                  <p className={styles.convMeta}>
                    {opt.entity_type} {opt.source_version ? `· v${opt.source_version}` : ""}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
