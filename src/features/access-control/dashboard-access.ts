export type DashboardPersona = "director" | "division_lead" | "member" | "it_lead" | "deputy_it";

export type DashboardProfile = {
  persona: DashboardPersona;
  divisionLabel: string | null;
  governanceVisible: boolean;
  homeDescription: string;
  homeEyebrow: string;
  homeLabel: string;
  homeTitle: string;
  roleLabel: string;
  scopeDescription: string;
  scopeTitle: string;
};

const divisionLabels: Record<string, string> = {
  FINANCE: "Keuangan",
  HR: "HR",
  IT: "IT",
  LEGAL: "Legal",
  PROPERTY: "Property",
  SALES_MARKETING: "Sales & Marketing",
};

const roleLabels: Record<string, string> = {
  BUSINESS_REVIEWER: "Business Reviewer",
  DIRECTOR: "Direktur Utama",
  DIVISION_OWNER: "Lead Divisi",
  IT_LEAD: "IT Lead",
  QA_SECURITY: "Wakil IT",
  TECHNICAL_REVIEWER: "Wakil IT",
};

const profileContent: Record<DashboardPersona, Omit<DashboardProfile, "divisionLabel" | "governanceVisible" | "roleLabel">> = {
  director: {
    persona: "director",
    homeDescription: "Ringkasan kondisi perusahaan. Insight akan muncul setelah data dan evidence terverifikasi tersedia.",
    homeEyebrow: "ALOS / EXECUTIVE VIEW",
    homeLabel: "Executive Dashboard",
    homeTitle: "Executive Dashboard",
    scopeDescription: "Memantau arah perusahaan, approval penting, dan rekomendasi GENESIS. Keputusan dan approval tetap dilakukan oleh manusia.",
    scopeTitle: "Ruang keputusan Director",
  },
  division_lead: {
    persona: "division_lead",
    homeDescription: "Pantau prioritas, pekerjaan, evidence, dan kebutuhan keputusan untuk divisi Anda.",
    homeEyebrow: "ALOS / DIVISION LEAD VIEW",
    homeLabel: "Dashboard Divisi",
    homeTitle: "Dashboard Divisi",
    scopeDescription: "Lead Divisi memvalidasi konteks bisnis dan mengarahkan pekerjaan tim. Agent hanya memberikan hasil dari sumber yang diizinkan.",
    scopeTitle: "Ruang kerja Lead Divisi",
  },
  member: {
    persona: "member",
    homeDescription: "Ruang kerja personal untuk tugas, dokumen, approval, dan bantuan GENESIS yang relevan dengan akses Anda.",
    homeEyebrow: "ALOS / MY WORK",
    homeLabel: "My Work",
    homeTitle: "My Work",
    scopeDescription: "Gunakan agent yang sudah disetujui untuk membuat ringkasan atau DRAFT. Hasil penting tetap perlu divalidasi oleh pemilik proses.",
    scopeTitle: "Ruang kerja anggota",
  },
  it_lead: {
    persona: "it_lead",
    homeDescription: "Pantau kesiapan operasi IT, agent, sumber evidence, dan kontrol yang menunggu proses governance.",
    homeEyebrow: "ALOS / IT OPERATIONS",
    homeLabel: "IT Operations",
    homeTitle: "IT Operations",
    scopeDescription: "IT Lead menyiapkan konfigurasi dan UAT. Approval terhadap perubahan dibuat oleh Wakil IT atau Director yang berbeda.",
    scopeTitle: "Ruang operasi IT",
  },
  deputy_it: {
    persona: "deputy_it",
    homeDescription: "Pantau kontrol, evidence, hasil UAT, dan item yang memerlukan pemeriksaan independen.",
    homeEyebrow: "ALOS / GOVERNANCE REVIEW",
    homeLabel: "Governance Workspace",
    homeTitle: "Governance Workspace",
    scopeDescription: "Wakil IT adalah pemeriksa independen lintas divisi, bukan divisi operasional. Ia tidak menyetujui perubahan yang dibuatnya sendiri.",
    scopeTitle: "Ruang pemeriksaan Wakil IT",
  },
};

export function getDashboardProfile(roles: readonly string[], divisionCodes: readonly string[]): DashboardProfile {
  const persona = selectPersona(roles);
  return {
    ...profileContent[persona],
    divisionLabel: formatDivisionLabel(divisionCodes),
    governanceVisible: canOpenGovernance(roles),
    roleLabel: formatRoleLabel(roles),
  };
}

export function canOpenGovernance(roles: readonly string[]): boolean {
  return roles.some((role) => ["DIRECTOR", "IT_LEAD", "QA_SECURITY", "TECHNICAL_REVIEWER", "BUSINESS_REVIEWER"].includes(role));
}

export function formatDivisionLabel(divisionCodes: readonly string[]): string | null {
  const labels = [...new Set(divisionCodes.map((code) => divisionLabels[code] ?? code))];
  return labels.length > 0 ? labels.join(" · ") : null;
}

export function formatRoleLabel(roles: readonly string[]): string {
  const labels = [...new Set(roles.map((role) => roleLabels[role] ?? role))];
  return labels.join(" · ") || "Pengguna ALOS";
}

function selectPersona(roles: readonly string[]): DashboardPersona {
  if (roles.includes("DIRECTOR")) return "director";
  if (roles.includes("IT_LEAD")) return "it_lead";
  if (roles.includes("QA_SECURITY") || roles.includes("TECHNICAL_REVIEWER")) return "deputy_it";
  if (roles.includes("DIVISION_OWNER")) return "division_lead";
  return "member";
}
