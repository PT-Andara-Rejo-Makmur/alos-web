import { describe, expect, it } from "vitest";

import { executiveNavigation } from "@/features/executive/navigation";
import { financeNavigation } from "@/features/finance/navigation";
import { hrNavigation } from "@/features/hr/navigation";
import { legalNavigation } from "@/features/legal/navigation";
import { propertyNavigation } from "@/features/property/navigation";
import { salesNavigation } from "@/features/sales/navigation";
import { itNavigation } from "@/features/it/navigation";

function labels(sections: ReturnType<typeof propertyNavigation>): string[] {
  return sections.flatMap((section) => section.items.map((item) => item.label));
}

describe("domain navigation exposes usable capabilities", () => {
  it("keeps Property work routes and hides the three unbacked shells", () => {
    const menu = labels(propertyNavigation("property"));
    expect(menu).toEqual(expect.arrayContaining([
      "Portofolio Proyek", "Progres & Jadwal", "Pekerjaan & Milestone", "Unit & Kesiapan", "Inspeksi & Kualitas", "Proyek",
    ]));
    expect(menu).not.toEqual(expect.arrayContaining(["Kontraktor", "Anggaran & RAB", "Material & Pengadaan"]));
  });

  it("keeps HR records, GA and work; hides Compensation", () => {
    const menu = labels(hrNavigation("hr", true));
    expect(menu).toEqual(expect.arrayContaining(["Karyawan", "Rekrutmen & Kandidat", "Onboarding & Masa Percobaan", "Kehadiran & Cuti", "Kinerja & Pengembangan", "GA & Fasilitas", "Proyek", "Tugas"]));
    expect(menu).not.toContain("Kompensasi & Benefit");
  });

  it("keeps IT monitoring, integrations, and release records; hides assets and support shells", () => {
    const menu = labels(itNavigation("it"));
    expect(menu).toEqual(expect.arrayContaining(["Layanan & Insiden", "Integrasi & Connector", "Perubahan & Rilis", "Akses & Identitas", "Proyek", "Tugas"]));
    expect(menu).not.toEqual(expect.arrayContaining(["Aset IT", "Dukungan & Permintaan"]));
  });

  it("retains partial-but-functional finance, legal, strategy and sales areas", () => {
    expect(labels(financeNavigation("finance"))).toContain("Kas & Likuiditas");
    expect(labels(legalNavigation("legal"))).toContain("Kontrak & Perjanjian");
    expect(labels(executiveNavigation("executive"))).toContain("Rencana & Target");
    expect(labels(salesNavigation("sales"))).toContain("Pipeline Penjualan");
  });
});
