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
  EXECUTIVE: "Executive",
  WORKSPACE_LEAD: "Penanggung Jawab Workspace",
  WORKSPACE_MEMBER: "Anggota Workspace",
  IT_ADMIN: "Administrator IT",
  AI_ADMIN: "Administrator AI",
  QA_ASSURANCE: "QA Assurance",
  TECHNICAL_REVIEWER: "Technical Reviewer",
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
    scopeDescription: "Penanggung Jawab Workspace memvalidasi konteks bisnis dan mengarahkan pekerjaan tim. Agent hanya memberikan hasil dari sumber yang diizinkan.",
    scopeTitle: "Ruang kerja Penanggung Jawab Workspace",
  },
  member: {
    persona: "member",
    homeDescription: "Ruang kerja personal untuk tugas, dokumen, approval, dan bantuan ARA yang relevan dengan akses Anda.",
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
    scopeDescription: "Administrator IT menyiapkan konfigurasi dan UAT. Approval terhadap perubahan dibuat oleh reviewer independen yang berbeda.",
    scopeTitle: "Ruang operasi IT",
  },
  deputy_it: {
    persona: "deputy_it",
    homeDescription: "Pantau kontrol, evidence, hasil UAT, dan item yang memerlukan pemeriksaan independen.",
    homeEyebrow: "ALOS / GOVERNANCE REVIEW",
    homeLabel: "Governance Workspace",
    homeTitle: "Governance Workspace",
    scopeDescription: "Reviewer independen memeriksa kontrol lintas workspace dan tidak menyetujui perubahan yang dibuatnya sendiri.",
    scopeTitle: "Ruang pemeriksaan independen",
  },
};

export function getDashboardProfile(roles: readonly string[], divisionCodes: readonly string[]): DashboardProfile {
  const persona = selectPersona(roles);
  return {
    ...profileContent[persona],
    divisionLabel: formatDivisionLabel(divisionCodes),
    governanceVisible: isGovernanceNavigationVisible(roles),
    roleLabel: formatRoleLabel(roles),
  };
}

export function isGovernanceNavigationVisible(roles: readonly string[]): boolean {
  return roles.some((role) => ["EXECUTIVE", "IT_ADMIN", "QA_ASSURANCE", "TECHNICAL_REVIEWER", "BUSINESS_REVIEWER"].includes(role));
}

export function formatDivisionLabel(divisionCodes: readonly string[]): string | null {
  const labels = [...new Set(divisionCodes.map((code) => divisionLabels[code] ?? code))];
  return labels.length > 0 ? labels.join(" · ") : null;
}

export function formatRoleLabel(roles: readonly string[]): string {
  // An account may hold several roles, but a workspace UI needs one concise
  // active-role label.  The remaining roles are still enforced by Backend;
  // they must not be rendered as an unreadable, authority-looking string.
  const precedence = [
    "EXECUTIVE",
    "IT_ADMIN",
    "AI_ADMIN",
    "QA_ASSURANCE",
    "TECHNICAL_REVIEWER",
    "BUSINESS_REVIEWER",
    "WORKSPACE_LEAD",
    "WORKSPACE_MEMBER",
  ];
  const primary = precedence.find((role) => roles.includes(role)) ?? roles[0];
  return primary ? (roleLabels[primary] ?? primary) : "Pengguna ALOS";
}

function selectPersona(roles: readonly string[]): DashboardPersona {
  if (roles.includes("EXECUTIVE")) return "director";
  if (roles.includes("IT_ADMIN")) return "it_lead";
  if (roles.includes("QA_ASSURANCE") || roles.includes("TECHNICAL_REVIEWER")) return "deputy_it";
  if (roles.includes("WORKSPACE_LEAD")) return "division_lead";
  return "member";
}
