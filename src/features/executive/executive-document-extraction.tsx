"use client";

import { useState } from "react";
import { Button, EmptyState, Section, Status } from "@/components/ui";
import styles from "./executive.module.css";

export interface ExtractedCandidate {
  readonly id: string;
  readonly fieldName: string;
  value: string;
  status: "TERIMA" | "EDIT" | "ABAIKAN" | "PERLU_DIPERIKSA";
  readonly sourceText: string;
  readonly anchor: string;
  readonly required: boolean;
}

export interface ExtractionSectionProps {
  readonly initialCandidates?: readonly ExtractedCandidate[];
  readonly initialProcessed?: boolean;
}

export function ExtractionSection({ initialCandidates = [], initialProcessed = false }: ExtractionSectionProps) {
  const [sourceType, setSourceType] = useState<"EXISTING" | "UPLOAD">("EXISTING");
  const [versionRef, setVersionRef] = useState("");
  const [extractionType, setExtractionType] = useState("STRATEGY_PLAN");
  const [processed, setProcessed] = useState(initialProcessed);
  const [candidates, setCandidates] = useState<ExtractedCandidate[]>([...initialCandidates]);

  function handleCandidateAction(id: string, action: "TERIMA" | "EDIT" | "ABAIKAN") {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: action } : c)),
    );
  }

  function handleCandidateValueChange(id: string, nextVal: string) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value: nextVal, status: "EDIT" } : c)),
    );
  }

  return (
    <Section description="Alur ekstraksi terpandu: Dokumen & Versi yang Tetap → Jenis Ekstraksi → Proses → Telaah Kandidat." title="Ekstraksi Dokumen Strategi">

      {!processed ? (
        <div className={styles.cascadeStep}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="ext-src-type">Sumber Dokumen *</label>
              <select className={styles.formSelect} id="ext-src-type" onChange={(e) => setSourceType(e.target.value as "EXISTING")} value={sourceType}>
                <option value="EXISTING">Dokumen Resmi yang Tersedia</option>
                <option value="UPLOAD">Unggah Dokumen Baru</option>
              </select>
            </div>

            {sourceType === "EXISTING" ? (
              <div className={styles.formField}>
                <label htmlFor="ext-doc-id">Dokumen Terpilih *</label>
                <select className={styles.formSelect} disabled id="ext-doc-id" value="">
                  <option value="">Dokumen belum tersedia untuk dipilih.</option>
                </select>
                <p style={{ fontSize: "12px", color: "var(--alos-text-secondary)", margin: "var(--alos-space-1) 0 0" }}>
                  Dokumen belum tersedia untuk dipilih.
                </p>
              </div>
            ) : (
              <div className={`${styles.formField} ${styles.formFullWidth}`}>
                <div className={styles.briefNotice}>
                  Layanan pengunggahan dokumen belum terhubung.
                </div>
              </div>
            )}

            <div className={styles.formField}>
              <label htmlFor="ext-ver">Referensi Versi Dokumen *</label>
              <input
                className={styles.formInput}
                id="ext-ver"
                onChange={(e) => setVersionRef(e.target.value)}
                placeholder="Contoh: Versi 1.0 (Dokumen Tetap)"
                value={versionRef}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="ext-type">Jenis Ekstraksi *</label>
              <select className={styles.formSelect} id="ext-type" onChange={(e) => setExtractionType(e.target.value)} value={extractionType}>
                <option value="STRATEGY_PLAN">Rencana Strategis & RKAP</option>
                <option value="TARGET_KPI">Target Kinerja & KPI</option>
                <option value="ASSUMPTIONS">Asumsi Perencanaan</option>
              </select>
            </div>
          </div>

          <div className={styles.formActions} style={{ marginTop: "var(--alos-space-3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--alos-space-3)" }}>
              <Button disabled variant="primary">Proses Ekstraksi</Button>
              <span style={{ fontSize: "12px", color: "var(--alos-text-secondary)" }}>
                Ekstraksi dokumen belum tersedia.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.briefHeader} style={{ marginBottom: "var(--alos-space-4)" }}>
            <h3>Telaah Kandidat Ekstraksi</h3>
            <Button onClick={() => setProcessed(false)} size="sm" variant="ghost">Ganti Dokumen</Button>
          </div>

          <div className={styles.extractionSplit}>
            {/* Desktop Left: Document Viewer */}
            <div className={styles.docViewer}>
              <div className={styles.briefHeader} style={{ marginBottom: "var(--alos-space-3)" }}>
                <h4>Dokumen Sumber</h4>
              </div>
              <EmptyState
                description="Pilih dokumen resmi yang terverifikasi untuk menampilkan isi dokumen."
                title="Pratinjau dokumen belum tersedia."
              />
            </div>

            {/* Desktop Right: Candidate Fields with Actions */}
            <div className={styles.candidateList}>
              <div className={styles.briefNotice}>
                Dilarang langsung menetapkan hasil ekstraksi sebagai aktif. Seluruh kandidat wajib ditelaah secara tertib.
              </div>

              {candidates.length === 0 ? (
                <EmptyState
                  description="Hasil pembacaan dokumen akan ditampilkan di sini setelah proses ekstraksi terhubung."
                  title="Belum ada kandidat ekstraksi."
                />
              ) : (
                candidates.map((c) => (
                  <div className={styles.candidateCard} key={c.id}>
                    <div className={styles.candidateRow}>
                      <strong>{c.fieldName} {c.required ? "*" : ""}</strong>
                      <Status
                        label={
                          c.status === "PERLU_DIPERIKSA"
                            ? "Perlu Diperiksa"
                            : c.status === "TERIMA"
                              ? "Diterima"
                              : c.status === "EDIT"
                                ? "Diedit"
                                : "Diabaikan"
                        }
                        variant={
                          c.status === "PERLU_DIPERIKSA"
                            ? "warning"
                            : c.status === "ABAIKAN"
                              ? "danger"
                              : "success"
                        }
                      />
                    </div>

                    <div>
                      <label htmlFor={`cand-${c.id}`} style={{ display: "block", fontSize: "11px", color: "var(--alos-text-muted)" }}>
                        Nilai Kandidat:
                      </label>
                      <input
                        className={styles.formInput}
                        id={`cand-${c.id}`}
                        onChange={(e) => handleCandidateValueChange(c.id, e.target.value)}
                        value={c.value}
                      />
                    </div>

                    <p style={{ color: "var(--alos-text-muted)", fontSize: "11px", margin: 0 }}>
                      Sumber: &quot;{c.sourceText}&quot; ({c.anchor})
                    </p>

                    <div className={styles.formActions} style={{ marginTop: "var(--alos-space-2)" }}>
                      <Button onClick={() => handleCandidateAction(c.id, "TERIMA")} size="sm" variant={c.status === "TERIMA" ? "primary" : "ghost"}>
                        Terima
                      </Button>
                      <Button onClick={() => handleCandidateAction(c.id, "EDIT")} size="sm" variant={c.status === "EDIT" ? "primary" : "ghost"}>
                        Edit
                      </Button>
                      <Button onClick={() => handleCandidateAction(c.id, "ABAIKAN")} size="sm" variant={c.status === "ABAIKAN" ? "primary" : "ghost"}>
                        Abaikan
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {candidates.length > 0 ? (
                <div className={styles.formActions} style={{ marginTop: "var(--alos-space-4)", flexDirection: "column", alignItems: "flex-start", gap: "var(--alos-space-2)" }}>
                  <div className={styles.briefNotice}>
                    Penyimpanan hasil telaah kandidat memerlukan integrasi layanan ekstraksi resmi yang belum terhubung. Telaah kandidat saat ini bersifat pratinjau saja.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
