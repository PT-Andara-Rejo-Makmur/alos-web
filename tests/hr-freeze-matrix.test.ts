import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(path), "utf8");

describe("HR / GA master freeze matrix", () => {
  it("keeps unknown HR values source-honest", () => {
    const source = read("src/features/hr/hr-pages.tsx");
    expect(source).toContain("—");
    expect(source).toContain("Belum Terhubung");
    expect(source).not.toContain("Rp0");
    expect(source).not.toContain("Tidak Ada Kasus");
    expect(source).not.toMatch(/missing attendance.*Hadir/i);
    expect(source).not.toMatch(/headcount[^\n]*(?:=|:)\s*0/i);
  });

  it("keeps HR user-facing labels in natural Indonesian", () => {
    const pages = read("src/features/hr/hr-pages.tsx");
    const detail = read("src/features/hr/shared/hr-detail-page.tsx");
    const navigation = read("src/features/hr/navigation.ts");
    const expectedLabels = [
      "Karyawan", "Posisi", "Divisi", "Manajer", "Jenis Kepegawaian", "Tanggal Bergabung",
      "Status Kepegawaian", "Akhir Kontrak", "Tanggal", "Jadwal", "Jam Masuk", "Jam Keluar",
      "Status Kehadiran", "Sumber", "Verifikasi", "Kebutuhan", "Tindakan", "Penanggung Jawab",
      "Tenggat", "Bukti", "Pelatihan", "Kompetensi / Persyaratan", "Hasil", "Periode",
      "Hak Karyawan", "Tunjangan", "Instruksi Potongan", "Dampak Kehadiran", "Dampak Lembur",
      "Dampak Cuti", "Fasilitas Kantor", "Portofolio", "Alasan", "Hari Kerja Terakhir", "Jenis Perubahan",
      "Tanggal Berlaku", "Serah Terima Pengetahuan", "Pengembalian Aset", "Pencabutan Akses", "Dokumen Akhir",
    ];
    for (const label of expectedLabels) expect(`${pages}\n${detail}`).toContain(`"${label}"`);

    const genericEnglishLabels = [
      "Employee", "Employee ID", "Position", "Division", "Manager", "Employment Type", "Join Date",
      "Employment Status", "Contract End", "Date", "Schedule", "Check In", "Check Out", "Attendance State",
      "Source", "Verification", "Need", "Action", "Owner", "Target Date", "Evidence", "Training",
      "Skill / Requirement", "Result", "Period", "Employee Entitlement", "Allowance", "Deduction Instruction",
      "Attendance Impact", "Overtime Impact", "Leave Impact", "Office Facility", "Reason", "Last Working Date",
      "Change Type", "Effective Date", "Knowledge Transfer", "Asset Return", "Access Revocation", "Final Documents",
      "Headcount", "Interview", "Offer", "Benefit",
    ];
    for (const label of genericEnglishLabels) {
      expect(`${pages}\n${detail}`).not.toContain(`"${label}"`);
      expect(`${pages}\n${detail}`).not.toContain(`'${label}'`);
    }
    expect(navigation).toContain('label: "Kompensasi & Tunjangan"');
    expect(navigation).not.toContain('label: "Kompensasi & Benefit"');
  });

  it("maps internal source states to human labels without leaking raw enum values", () => {
    const ui = read("src/features/hr/shared/hr-ui.tsx");
    expect(ui).toContain('"Belum Terhubung"');
    expect(ui).toContain('"Gagal Memuat"');
    expect(ui).toContain('"Belum ada data"');
    expect(ui).not.toContain("IN_REVIEW");
    expect(ui).not.toContain("CONNECTED_EMPTY");
    expect(ui).not.toContain("CONNECTED_DATA");
    expect(ui).not.toContain("RESTRICTED");
    expect(ui).not.toContain("CONFIDENTIAL");
    expect(ui).not.toContain("HR_GA");
  });

  it("locks recruitment, AI, and protected-attribute boundaries", () => {
    const decisions = read("docs/hr-business-state-decisions.md");
    expect(decisions).toContain("Candidate extraction bukan keputusan employment");
    expect(decisions).toContain("AI tidak boleh hire, reject, promote, terminate");
    expect(decisions).toContain("Protected attributes (race/ethnicity, religion, health, political belief, sexual orientation, family status)");
    expect(decisions).toContain("bukan input ranking atau keputusan employment");
  });

  it("locks Legal, Finance, and IT ownership boundaries", () => {
    const decisions = read("docs/hr-business-state-decisions.md");
    expect(decisions).toContain("Employment document tersedia bukan berarti kontrak sah secara Legal");
    expect(decisions).toContain("Payroll preparation HR bukan payment execution");
    expect(decisions).toContain("`Paid`, `Settled`, dan `Reconciled` adalah state Finance-owned");
    expect(decisions).toContain("Joiner/Mover/Leaver HR bukan provisioning atau revocation teknis");
    expect(decisions).toContain("Provision, Revoke, System Access, dan Admin Permission adalah IT/Identity-owned");
  });

  it("locks onboarding, attendance, performance, and immutable history semantics", () => {
    const decisions = read("docs/hr-business-state-decisions.md");
    expect(decisions).toContain("Checklist onboarding tetap readiness");
    expect(decisions).toContain("hasil probation memerlukan human review");
    expect(decisions).toContain("Koreksi attendance merupakan record terpisah dan tidak menimpa event asli");
    expect(decisions).toContain("leave balance dan approval policy bukan konstanta frontend");
    expect(decisions).toContain("Promotion, termination, dan final performance rating tidak ditentukan AI");
    expect(decisions).toContain("Employment change effective-dated; compensation change versioned");
    expect(decisions).toContain("history employment, compensation, dan offboarding tidak ditimpa");
  });

  it("locks classification, privacy, relation, and conflict semantics", () => {
    const decisions = read("docs/hr-business-state-decisions.md");
    const forms = read("src/features/hr/shared/hr-ui.tsx");
    expect(decisions).toContain("Frontend tidak menetapkan classification PUBLIC, INTERNAL, CONFIDENTIAL, atau RESTRICTED");
    expect(decisions).toContain("Search dan readiness tidak boleh membocorkan salary, bank, tax, government ID, atau restricted HR Case");
    expect(decisions).toContain("Entity relation memakai sumber pilihan resmi; user tidak memasukkan raw internal ID");
    expect(decisions).toContain("HTTP 409/version conflict bukan success");
    expect(decisions).toContain("tidak boleh menimpa data yang lebih baru");
    expect(forms).toContain("Pilihan belum tersedia.");
    expect(forms).toContain("Perubahan belum disimpan karena penyimpanan belum tersedia.");
    expect(forms).toContain("disabled type=\"submit\"");
  });

  it("keeps universal work and assistant routes reusable", () => {
    const navigation = read("src/features/hr/navigation.ts");
    expect(navigation).not.toMatch(/hr-(projects|tasks|approvals|documents|reports|findings|ara)/i);
    for (const route of ["/projects", "/tasks", "/approvals", "/documents", "/reports", "/findings", "/ara"]) {
      expect(navigation).toContain(route);
    }
  });

  it("keeps table, responsive, and accessible primitives structural", () => {
    const table = read("src/components/ui/data-table.tsx");
    const css = read("src/features/hr/hr.module.css");
    const ui = read("src/features/hr/shared/hr-ui.tsx");
    expect(table).toContain("<table");
    expect(table).toContain('scope="col"');
    expect(css).toContain("@media (max-width: 760px)");
    expect(css).toContain(".formGrid { grid-template-columns: 1fr; }");
    expect(ui).toContain("<Drawer");
    expect(ui).toContain("<FormField");
  });

  it("keeps frozen workspace dispatchers present", () => {
    const routes = [
      "src/app/workspace/[workspaceKey]/(domain)/summary/page.tsx",
      "src/app/workspace/[workspaceKey]/(domain)/performance/page.tsx",
    ];
    for (const route of routes) {
      const source = read(route);
      expect(source).toContain("resolveWorkspaceDomain");
    }
    expect(read("src/features/session/workspace-domain.ts")).toContain('"FINANCE"');
    expect(read("src/features/session/workspace-domain.ts")).toContain('"LEGAL"');
  });
});
