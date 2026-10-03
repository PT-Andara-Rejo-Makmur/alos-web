"use client";

import { useState } from "react";
import { Alert, Button, Drawer, FormSection } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { BusinessUnit, PlanningAssumptionCreateRequest, StrategyBusinessPeriod as BusinessPeriod, StrategyBusinessScope as BusinessScope } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import { activeExecutiveWorkspaceId, ExecutiveWorkspacePicker, ExecutiveRolePicker } from "./executive-form-fields";
import { generateCanonicalId } from "./executive-model";
import styles from "./executive.module.css";

export function AssumptionFormDrawer({ canSubmit, onClose, session }: Readonly<{ canSubmit: boolean; onClose: () => void; session: SessionProjection }>) {
  const [category, setCategory] = useState<PlanningAssumptionCreateRequest["category"]>("AVERAGE_SELLING_PRICE");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<BusinessUnit>("IDR");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [granularity, setGranularity] = useState("ANNUAL");
  const [scopeType, setScopeType] = useState<BusinessScope["type"]>("COMPANY");
  const [ownerWorkspace, setOwnerWorkspace] = useState(() => activeExecutiveWorkspaceId(session));
  const [ownerRole, setOwnerRole] = useState("");
  const [sourceMode, setSourceMode] = useState<"MANUAL_EVIDENCED" | "SOURCE_LINKED">("MANUAL_EVIDENCED");
  const [sourceRef, setSourceRef] = useState("");
  const [evidenceRef, setEvidenceRef] = useState("");
  const verificationState = "PENDING_VERIFICATION" as const;
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setFeedback("Nama asumsi wajib diisi."); return; }
    if (!value.trim()) { setFeedback("Nilai asumsi wajib diisi."); return; }

    const numValue = Number(value);
    if (!Number.isFinite(numValue)) { setFeedback("Masukkan nilai angka yang valid."); return; }
    if (endsAt && startsAt && endsAt < startsAt) { setFeedback("Tanggal selesai harus sesudah tanggal mulai."); return; }
    if (unit === "RATIO" && (numValue < 0 || numValue > 1)) {
      setFeedback("Nilai rasio harus berada dalam rentang 0 hingga 1.");
      return;
    }

    if (!startsAt || !endsAt) { setFeedback("Periode mulai dan selesai wajib ditentukan."); return; }
    if (!ownerWorkspace.trim() || !ownerRole.trim()) {
      setFeedback("Ruang kerja dan peran penanggung jawab wajib ditentukan.");
      return;
    }

    if (!canSubmit) {
      setFeedback("Anda belum memiliki kewenangan untuk melakukan tindakan ini.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const generatedAssumptionId = generateCanonicalId("asm");
      await strategyApi.createAssumption({
        assumption_id: generatedAssumptionId,
        version: 1,
        name,
        category,
        value: numValue,
        unit,
        period: {
          granularity: granularity as BusinessPeriod["granularity"],
          starts_at: startsAt,
          ends_at: endsAt,
        },
        scope: { type: scopeType, ref: null, label: scopeType === "COMPANY" ? "Korporasi" : null },
        source_mode: sourceMode,
        source_ref: sourceRef || null,
        evidence_refs: evidenceRef ? [evidenceRef] : [],
        verification_state: verificationState,
        owner_role_ref: ownerRole,
        owner_workspace_id: ownerWorkspace,
        description: description || null,
      });
      onClose();
    } catch {
      setFeedback("Gagal menyimpan asumsi perencanaan. Silakan coba kembali.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer description="Tambah asumsi baru sebagai dasar perencanaan perusahaan." onClose={onClose} open title="Formulir Asumsi">
      <form onSubmit={handleSubmit}>
        {!canSubmit ? (
          <div className={styles.briefNotice}>
            Anda belum memiliki kewenangan untuk membuat asumsi perencanaan. Formulir berjalan dalam mode pratinjau kebutuhan tanpa penyimpanan langsung.
          </div>
        ) : null}
        {feedback ? <Alert message={feedback} title="Perhatian" variant="warning" /> : null}

        <FormSection title="Asumsi dan Periode"><div className={styles.formGrid}><div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="asm-cat">Kategori *</label>
            <select className={styles.formSelect} id="asm-cat" onChange={(e) => setCategory(e.target.value as PlanningAssumptionCreateRequest["category"])} value={category}>
              <option value="AVERAGE_SELLING_PRICE">Harga Jual Rata-rata</option>
              <option value="CONVERSION_RATIO">Rasio Konversi</option>
              <option value="EXPECTED_CPL">Perkiraan Biaya per Prospek</option>
              <option value="AVAILABLE_INVENTORY">Inventaris Tersedia</option>
              <option value="MARKETING_BUDGET">Anggaran Pemasaran</option>
              <option value="TEAM_CAPACITY">Kapasitas Tim</option>
              <option value="CUSTOM">Khusus</option>
            </select>
          </div>
<div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="asm-name">Nama Asumsi *</label>
            <input className={styles.formInput} id="asm-name" onChange={(e) => setName(e.target.value)} required value={name} />
          </div>
<div className={styles.formField}>
            <label htmlFor="asm-unit">Satuan *</label>
            <select className={styles.formSelect} id="asm-unit" onChange={(e) => setUnit(e.target.value as BusinessUnit)} value={unit}>
              <option value="IDR">Rupiah</option>
              <option value="COUNT">Jumlah</option>
              <option value="PERCENT">Persentase (%)</option>
              <option value="RATIO">Rasio (0.00 – 1.00)</option>
              <option value="SCORE">Skor</option>
              <option value="UNIT">Unit</option>
            </select>
          </div>
<div className={styles.formField}>
            <label htmlFor="asm-val">Nilai * {unit === "RATIO" ? "(Rentang 0.00 – 1.00)" : ""}</label>
            <input className={styles.formInput} id="asm-val" onChange={(e) => setValue(e.target.value)} required step={unit === "RATIO" ? "0.01" : "1"} type="number" value={value} />
          </div>
<div className={styles.formField}>
            <label htmlFor="asm-start">Periode Mulai *</label>
            <input className={styles.formInput} id="asm-start" onChange={(e) => setStartsAt(e.target.value)} required type="date" value={startsAt} />
          </div>
<div className={styles.formField}>
            <label htmlFor="asm-end">Periode Selesai *</label>
            <input className={styles.formInput} id="asm-end" min={startsAt || undefined} onChange={(e) => setEndsAt(e.target.value)} required type="date" value={endsAt} />
          </div>
<div className={styles.formField}>
            <label htmlFor="asm-granularity">Frekuensi Pengukuran *</label>
            <select className={styles.formSelect} id="asm-granularity" onChange={(e) => setGranularity(e.target.value)} value={granularity}>
              <option value="ANNUAL">Tahunan</option>
              <option value="QUARTERLY">Triwulan</option>
              <option value="MONTHLY">Bulanan</option>
              <option value="CUSTOM">Khusus</option>
            </select>
          </div>
<div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="asm-desc">Deskripsi</label>
            <textarea className={styles.formTextarea} id="asm-desc" onChange={(e) => setDescription(e.target.value)} rows={2} value={description} />
          </div></div></FormSection>
<FormSection title="Penanggung Jawab"><div className={styles.formGrid}><div className={styles.formField}>
            <label htmlFor="asm-scope">Ruang Lingkup *</label>
            <select className={styles.formSelect} id="asm-scope" onChange={(e) => setScopeType(e.target.value as BusinessScope["type"])} value={scopeType}>
              <option value="COMPANY">Korporasi</option>
              <option value="DIVISION">Divisi</option>
            </select>
          </div>
<div className={styles.formField}>
            <ExecutiveWorkspacePicker id="asm-owner-ws" onChange={value => { setOwnerWorkspace(value); setOwnerRole(""); }} session={session} value={ownerWorkspace} />
          </div>
<div className={styles.formField}><ExecutiveRolePicker id="asm-owner-role" session={session} workspaceId={ownerWorkspace} value={ownerRole} onChange={setOwnerRole} /></div></div></FormSection>
<FormSection title="Dasar Angka"><div className={styles.formGrid}><div className={styles.formField}>
            <label htmlFor="asm-source-mode">Dasar Angka *</label>
            <select className={styles.formSelect} id="asm-source-mode" onChange={(e) => setSourceMode(e.target.value as "MANUAL_EVIDENCED")} value={sourceMode}>
              <option value="MANUAL_EVIDENCED">Diisi Manual dengan Bukti</option>
              <option disabled value="SOURCE_LINKED">Sumber resmi eksternal belum tersedia</option>
            </select>
          </div>
<div className={styles.formField}>
            <p>Asumsi akan menunggu pemeriksaan setelah disimpan.</p>
          </div>
<div className={styles.formField}>
            <label htmlFor="asm-source">Referensi Sumber</label>
            <input className={styles.formInput} id="asm-source" onChange={(e) => setSourceRef(e.target.value)} placeholder="Tautan / nomor rujukan" value={sourceRef} />
          </div>
<div className={styles.formField}>
            <label htmlFor="asm-evidence">Referensi Bukti</label>
            <input className={styles.formInput} id="asm-evidence" onChange={(e) => setEvidenceRef(e.target.value)} placeholder="Nomor arsip, nomor dokumen, atau tautan referensi" value={evidenceRef} />
          </div></div></FormSection>

        <div className={styles.formActions}>
          <Button onClick={onClose} type="button" variant="ghost">Batal</Button>
          {canSubmit ? (
            <Button disabled={submitting} type="submit" variant="primary">
              {submitting ? "Menyimpan…" : "Simpan Asumsi"}
            </Button>
          ) : (
            <div className={styles.briefNotice}>
              Anda belum memiliki kewenangan untuk melakukan tindakan ini.
            </div>
          )}
        </div>
      </form>
    </Drawer>
  );
}
