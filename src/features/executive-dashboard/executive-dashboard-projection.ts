import type {
  BusinessTarget,
  MetricObservation,
  StrategyPlan,
} from "@/lib/contracts";

import type {
  DecisionQueueItem,
  DivisionHealthItem,
  ExecutiveAIContext,
  ExecutiveBriefBlock,
  ExecutiveCorporateTargetRow,
  ExecutiveDataStatusSummary,
  ExecutiveDashboardMetric,
  ExecutiveDashboardSnapshot,
  ExecutiveDomainSummaryCard,
  ExecutiveEarlyWarningItem,
  ExecutiveHeadlineItem,
  ExecutiveSourceInspection,
  SourceConnectionState,
} from "./types";

/* =========================================================================
 * TRANSLATION HELPERS (STRICT INDONESIAN)
 * ========================================================================= */

export function translateSourceReadiness(state: SourceConnectionState): string {
  switch (state) {
    case "LIVE":
      return "Terkini";
    case "PARTIAL":
      return "Sebagian Tersedia";
    case "STALE":
      return "Perlu Diperbarui";
    case "ERROR":
      return "Gagal Memuat";
    case "LOADING":
      return "Sedang Memuat";
    case "NOT_CONNECTED":
    default:
      return "Belum Terhubung";
  }
}

export function translatePerformanceState(state?: string | null): string {
  switch (state) {
    case "ON_TRACK":
      return "Sesuai Target";
    case "AT_RISK":
      return "Berisiko";
    case "OFF_TRACK":
      return "Tidak Sesuai Target";
    case "ACHIEVED":
      return "Tercapai";
    case "NOT_EVALUATED":
    default:
      return "Belum Dinilai";
  }
}

export function translateVerificationState(state?: string | null): string {
  switch (state) {
    case "VERIFIED":
      return "Terverifikasi";
    case "PENDING_VERIFICATION":
      return "Menunggu Verifikasi";
    case "CONFLICT":
      return "Data Tidak Sesuai";
    case "REJECTED":
      return "Ditolak";
    case "UNVERIFIED":
    default:
      return "Belum Diverifikasi";
  }
}

export function translateLifecycleState(state?: string | null): string {
  switch (state) {
    case "DRAFT":
      return "Draf";
    case "UNDER_REVIEW":
      return "Dalam Peninjauan";
    case "APPROVED":
      return "Disetujui";
    case "ACTIVE":
      return "Aktif";
    case "SUPERSEDED":
      return "Digantikan";
    case "ARCHIVED":
      return "Diarsipkan";
    default:
      return "Draf";
  }
}

/* =========================================================================
 * FORMATTING HELPERS
 * ========================================================================= */

export function createEmptyExecutiveSnapshot(): ExecutiveDashboardSnapshot {
  return {
    generated_at: "",
    profile: {
      display_name: "Tidak tersedia",
      organization_name: "PT Andara Rejo Makmur",
      role_label: "Direktur Utama",
    },
    metrics: [
      { key: "active_projects", label: "Proyek Aktif", value: null, unit: "COUNT", tone: "INFO", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
      { key: "pending_approvals", label: "Keputusan Menunggu", value: null, unit: "COUNT", tone: "WARNING", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
      { key: "average_progress", label: "Kemajuan Pekerjaan", value: null, unit: "PERCENT", tone: "INFO", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
      { key: "overdue_tasks", label: "Tugas Terlambat", value: null, unit: "COUNT", tone: "WARNING", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
    ],
    performance: { title: "Kinerja perusahaan", context: "Sumber belum terhubung", points: [] },
    project_distribution: { available: false, total: 0, context: "Sumber belum terhubung", items: [] },
    divisions: [],
    attention_projects: [],
    pending_approvals: [],
  };
}

export function formatMetricDisplayValue(metric: ExecutiveDashboardMetric): string {
  if (metric.value === null || metric.value === undefined) return "—";
  if (metric.unit === "PERCENT") {
    return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(metric.value)}%`;
  }
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(metric.value);
}

export function formatNumberIndonesian(val: number | string | boolean | null | undefined, unit?: string | null): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Ya" : "Tidak";
  if (typeof val === "string") {
    const num = Number(val);
    if (isNaN(num)) return val;
    val = num;
  }
  const formatted = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(val);
  if (!unit) return formatted;
  const upper = unit.toUpperCase();
  if (upper === "PERCENT" || upper === "%") return `${formatted}%`;
  if (upper === "IDR" || upper === "RP") return `Rp${formatted}`;
  if (upper === "COUNT") return formatted;
  if (upper === "UNIT") return `${formatted} unit`;
  if (upper === "SCORE") return `${formatted} poin`;
  if (upper === "DAY") return `${formatted} hari`;
  if (upper === "HOUR") return `${formatted} jam`;
  if (upper === "MINUTE") return `${formatted} menit`;
  return `${formatted} ${unit.toLowerCase()}`;
}

export function formatDateIndonesian(dateInput?: string | Date | null): string {
  if (!dateInput) return "—";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "—";
    const dateFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(d);
    return `${dateFormatted} WIB`;
  } catch {
    return "—";
  }
}

export function translateGranularity(granularity?: string | null): string {
  switch (granularity?.toUpperCase()) {
    case "ANNUAL":
      return "Tahunan";
    case "MONTHLY":
      return "Bulanan";
    case "QUARTERLY":
      return "Kuartalan";
    case "WEEKLY":
      return "Mingguan";
    case "DAILY":
      return "Harian";
    default:
      return "Tahunan";
  }
}

export function approvalKindLabel(kind: "DOCUMENT" | "AGENT_RELEASE" | string): string {
  if (kind === "AGENT_RELEASE") return "Release Agent";
  return "Dokumen";
}

export function approvalAgeLabel(ageDays: number): string {
  if (ageDays === 0) return "Hari ini";
  return `${ageDays} hari`;
}

export function executiveGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export function executiveFirstName(displayName: string): string {
  return displayName.trim().split(/\s+/)[0] || "Direktur";
}

export function formatJakartaDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function formatJakartaTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hour}.${minute} WIB`;
}

export const formatExecutiveMetric = formatMetricDisplayValue;

/* =========================================================================
 * STAGE 2 STRATEGY TARGETS PROJECTION
 * ========================================================================= */

function getObservation(observations: readonly MetricObservation[] | undefined, kind: "TARGET" | "ACTUAL" | "FORECAST" | "ASSUMPTION") {
  return observations?.find((o) => o.kind === kind);
}

export function projectCorporateTargets(targets: readonly BusinessTarget[]): readonly ExecutiveCorporateTargetRow[] {
  const companyTargets = targets.filter((t) => {
    if (!t.scope) return false;
    if (typeof t.scope === "string") return t.scope === "COMPANY";
    return t.scope.type === "COMPANY";
  });

  return companyTargets.map((t) => {
    const targetObs = getObservation(t.observations, "TARGET");
    const actualObs = getObservation(t.observations, "ACTUAL");
    const forecastObs = getObservation(t.observations, "FORECAST");

    const targetVal = targetObs?.value;
    const actualVal = actualObs?.value;
    const forecastVal = forecastObs?.value;

    const targetNum =
      typeof targetVal === "number"
        ? targetVal
        : targetVal !== null && targetVal !== undefined && targetVal !== ""
          ? Number(targetVal)
          : null;
    const actualNum =
      typeof actualVal === "number"
        ? actualVal
        : actualVal !== null && actualVal !== undefined && actualVal !== ""
          ? Number(actualVal)
          : null;

    // Variance strictly actual - target if numeric
    let varianceDisplay = "—";
    if (actualNum !== null && targetNum !== null && !isNaN(actualNum) && !isNaN(targetNum)) {
      const diff = actualNum - targetNum;
      const prefix = diff > 0 ? "+" : "";
      varianceDisplay = `${prefix}${formatNumberIndonesian(diff, t.unit)}`;
    }

    // Achievement percentage: safe calculation only for valid measurement types
    let achievementPercent: number | null = null;
    const isSafeMeasurement =
      t.measurement_type === "HIGHER_IS_BETTER" ||
      t.measurement_type === "CUMULATIVE" ||
      t.measurement_type === "PERCENTAGE";

    if (isSafeMeasurement && targetNum !== null && targetNum > 0 && actualNum !== null && !isNaN(actualNum)) {
      achievementPercent = Math.min(999, Math.max(0, (actualNum / targetNum) * 100));
    }

    // Status mapping
    const statusLabel = translatePerformanceState(t.performance_state);
    let statusTone: ExecutiveCorporateTargetRow["statusTone"] = "NEUTRAL";
    if (t.performance_state === "ON_TRACK" || t.performance_state === "ACHIEVED") {
      statusTone = "SUCCESS";
    } else if (t.performance_state === "AT_RISK") {
      statusTone = "WARNING";
    } else if (t.performance_state === "OFF_TRACK") {
      statusTone = "DANGER";
    }

    // Verification from primary observation (actual if present, else target)
    const primaryObs = actualObs ?? targetObs;
    const verificationLabel = translateVerificationState(primaryObs?.verification_state);

    const periodLabel = t.period?.label || translateGranularity(t.period?.granularity);

    return {
      targetId: t.target_id,
      code: t.code,
      name: t.name,
      periodLabel,
      targetDisplay: formatNumberIndonesian(targetVal, t.unit),
      actualDisplay: formatNumberIndonesian(actualVal, t.unit),
      forecastDisplay: formatNumberIndonesian(forecastVal, t.unit),
      varianceDisplay,
      achievementPercent,
      statusLabel,
      statusTone,
      verificationLabel,
      sourceLabel: t.owner_workspace_id ? `Divisi ${t.owner_workspace_id}` : "Strategi Korporat",
      rawTarget: t,
    };
  });
}

/* =========================================================================
 * 6 HEADLINES PROJECTION
 * ========================================================================= */

export function projectExecutiveHeadlines(
  snapshot: ExecutiveDashboardSnapshot | null,
  targets: readonly BusinessTarget[],
  plans: readonly StrategyPlan[],
  isSnapshotConnected: boolean,
): readonly ExecutiveHeadlineItem[] {
  // Find potential targets matching headline domains
  const revTarget = targets.find((t) => t.code.includes("REV") || t.metric_code.includes("REVENUE") || t.name.toLowerCase().includes("pendapatan"));
  const closingTarget = targets.find((t) => t.code.includes("CLOSING") || t.metric_code.includes("CLOSING") || t.name.toLowerCase().includes("closing") || t.code === "KPI-SM-01");
  const deliveryTarget = targets.find((t) => t.code.includes("DELIVERY") || t.name.toLowerCase().includes("kemajuan") || t.metric_code.includes("PROGRESS"));

  const averageProgressMetric = snapshot?.metrics.find((m) => m.key === "average_progress");

  const earlyWarnings = snapshot ? projectEarlyWarnings(snapshot) : { totalWarnings: 0 };

  // 1. Pendapatan
  const revTargetObs = revTarget ? getObservation(revTarget.observations, "TARGET") : null;
  const revActualObs = revTarget ? getObservation(revTarget.observations, "ACTUAL") : null;
  const revTargetVal = revTargetObs?.value;
  const revActualVal = revActualObs?.value;
  const headlineRevenue: ExecutiveHeadlineItem = {
    id: "revenue",
    label: "Pendapatan",
    primaryValue: revActualVal !== null && revActualVal !== undefined ? formatNumberIndonesian(revActualVal, "IDR") : "—",
    targetValue: revTargetVal !== null && revTargetVal !== undefined ? formatNumberIndonesian(revTargetVal, "IDR") : null,
    actualValue: revActualVal !== null && revActualVal !== undefined ? formatNumberIndonesian(revActualVal, "IDR") : null,
    statusLabel: revActualVal !== null && revActualVal !== undefined
      ? (revTarget?.performance_state ? translatePerformanceState(revTarget.performance_state) : "Belum Dinilai")
      : "Belum Terhubung",
    statusTone: revActualVal !== null && revActualVal !== undefined
      ? (revTarget?.performance_state === "ON_TRACK" || revTarget?.performance_state === "ACHIEVED"
          ? "SUCCESS"
          : revTarget?.performance_state === "AT_RISK"
            ? "WARNING"
            : revTarget?.performance_state === "OFF_TRACK"
              ? "DANGER"
              : "NEUTRAL")
      : "NEUTRAL",
    sourceLabel: "Keuangan & Kas",
    readiness: revActualVal !== null && revActualVal !== undefined ? "LIVE" : "NOT_CONNECTED",
    helperText: revActualVal !== null && revActualVal !== undefined ? undefined : "Sumber data aktual belum terhubung.",
    drilldownHref: "/workspace/finance",
  };

  // 2. Penjualan / Closing
  const closingTargetObs = closingTarget ? getObservation(closingTarget.observations, "TARGET") : null;
  const closingActualObs = closingTarget ? getObservation(closingTarget.observations, "ACTUAL") : null;
  const closingTargetNum = typeof closingTargetObs?.value === "number" ? closingTargetObs.value : null;
  const closingActualNum = typeof closingActualObs?.value === "number" ? closingActualObs.value : null;
  let closingProgress: number | null = null;
  if (closingTargetNum && closingTargetNum > 0 && closingActualNum !== null) {
    closingProgress = (closingActualNum / closingTargetNum) * 100;
  }

  let closingStatusLabel = "Belum Terhubung";
  let closingTone: ExecutiveHeadlineItem["statusTone"] = "NEUTRAL";
  if (closingActualNum !== null) {
    if (closingTarget?.performance_state) {
      closingStatusLabel = translatePerformanceState(closingTarget.performance_state);
      if (closingTarget.performance_state === "ON_TRACK" || closingTarget.performance_state === "ACHIEVED") {
        closingTone = "SUCCESS";
      } else if (closingTarget.performance_state === "AT_RISK") {
        closingTone = "WARNING";
      } else if (closingTarget.performance_state === "OFF_TRACK") {
        closingTone = "DANGER";
      }
    } else {
      closingStatusLabel = "Belum Dinilai";
      closingTone = "NEUTRAL";
    }
  }

  const headlineClosing: ExecutiveHeadlineItem = {
    id: "closing",
    label: "Penjualan / Closing",
    primaryValue: closingActualNum !== null ? `${closingActualNum} unit` : "—",
    targetValue: closingTargetNum !== null ? `${closingTargetNum} unit` : null,
    actualValue: closingActualNum !== null ? `${closingActualNum} unit` : null,
    progressPercent: closingProgress,
    statusLabel: closingStatusLabel,
    statusTone: closingTone,
    sourceLabel: "Penjualan & Komersial",
    readiness: closingActualNum !== null ? "LIVE" : "NOT_CONNECTED",
    helperText: closingActualNum === null ? "Sumber data aktual belum terhubung." : undefined,
    verificationLabel: closingActualObs ? translateVerificationState(closingActualObs.verification_state) : undefined,
    drilldownHref: "/workspace/sales",
  };

  // 3. Kas & Likuiditas
  const headlineCash: ExecutiveHeadlineItem = {
    id: "cash",
    label: "Kas & Likuiditas",
    primaryValue: "—",
    statusLabel: "Belum Terhubung",
    statusTone: "NEUTRAL",
    sourceLabel: "Perbankan & Kas",
    readiness: "NOT_CONNECTED",
    helperText: "Sumber data keuangan belum terhubung.",
    drilldownHref: "/workspace/finance",
  };

  // 4. Progres Proyek
  const avgProgressVal = averageProgressMetric?.value;
  let deliveryStatusLabel = "Belum Terhubung";
  let deliveryTone: ExecutiveHeadlineItem["statusTone"] = "NEUTRAL";
  if (deliveryTarget?.performance_state) {
    deliveryStatusLabel = translatePerformanceState(deliveryTarget.performance_state);
    if (deliveryTarget.performance_state === "ON_TRACK" || deliveryTarget.performance_state === "ACHIEVED") {
      deliveryTone = "SUCCESS";
    } else if (deliveryTarget.performance_state === "AT_RISK") {
      deliveryTone = "WARNING";
    } else if (deliveryTarget.performance_state === "OFF_TRACK") {
      deliveryTone = "DANGER";
    }
  } else if (isSnapshotConnected) {
    deliveryStatusLabel = "Belum Dinilai";
    deliveryTone = "NEUTRAL";
  }

  const headlineDelivery: ExecutiveHeadlineItem = {
    id: "delivery",
    label: "Progres Proyek",
    primaryValue: isSnapshotConnected && avgProgressVal !== null && avgProgressVal !== undefined
      ? `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(avgProgressVal)}%`
      : "—",
    progressPercent: isSnapshotConnected && typeof avgProgressVal === "number" ? avgProgressVal : null,
    targetValue: deliveryTarget ? formatNumberIndonesian(getObservation(deliveryTarget.observations, "TARGET")?.value, "%") : null,
    actualValue: isSnapshotConnected && avgProgressVal !== null && avgProgressVal !== undefined ? `${avgProgressVal}%` : null,
    statusLabel: deliveryStatusLabel,
    statusTone: deliveryTone,
    sourceLabel: "Proyek & Konstruksi",
    readiness: isSnapshotConnected ? "PARTIAL" : "NOT_CONNECTED",
    helperText: isSnapshotConnected ? "Rata-rata progres portofolio proyek" : "Sumber data operasional belum terhubung.",
    drilldownHref: "/workspace/executive/projects",
  };

  // 5. Keputusan Menunggu
  const pendingCount = snapshot?.pending_approvals.length ?? 0;
  const headlineDecisions: ExecutiveHeadlineItem = {
    id: "decisions",
    label: "Keputusan Menunggu",
    primaryValue: isSnapshotConnected ? `${pendingCount} item` : "—",
    statusLabel: isSnapshotConnected ? (pendingCount > 0 ? "Perlu Peninjauan" : "Selesai") : "Belum Terhubung",
    statusTone: isSnapshotConnected ? (pendingCount > 0 ? "WARNING" : "SUCCESS") : "NEUTRAL",
    sourceLabel: "Alur Persetujuan ALOS",
    readiness: isSnapshotConnected ? "LIVE" : "NOT_CONNECTED",
    helperText: isSnapshotConnected ? `${pendingCount} item menunggu persetujuan pimpinan` : "Sumber data persetujuan belum terhubung.",
    drilldownHref: "/workspace/executive/approvals",
  };

  // 6. Risiko / Perhatian
  const totalWarnings = earlyWarnings.totalWarnings;
  const headlineRisk: ExecutiveHeadlineItem = {
    id: "risk",
    label: "Risiko / Perhatian",
    primaryValue: isSnapshotConnected ? `${totalWarnings} perhatian` : "—",
    statusLabel: isSnapshotConnected ? (totalWarnings > 0 ? "Perlu Perhatian" : "Tidak Ada Deviasi") : "Belum Terhubung",
    statusTone: isSnapshotConnected ? (totalWarnings > 0 ? "DANGER" : "SUCCESS") : "NEUTRAL",
    sourceLabel: "Pusat Kendali Eksekutif",
    readiness: isSnapshotConnected ? "PARTIAL" : "NOT_CONNECTED",
    helperText: isSnapshotConnected
      ? (totalWarnings > 0 ? `${totalWarnings} deviasi/peringatan aktif` : "Tidak ada peringatan dari sumber yang tersedia.")
      : "Sumber data peringatan belum terhubung.",
    drilldownHref: "/workspace/executive/approvals",
  };

  return [
    headlineRevenue,
    headlineClosing,
    headlineCash,
    headlineDelivery,
    headlineDecisions,
    headlineRisk,
  ];
}

/* =========================================================================
 * 6 DOMAIN SUMMARIES PROJECTION
 * ========================================================================= */

export function projectDomainSummaries(
  snapshot: ExecutiveDashboardSnapshot | null,
  isSnapshotConnected: boolean,
): readonly ExecutiveDomainSummaryCard[] {
  const activeProjects = snapshot?.metrics.find((m) => m.key === "active_projects")?.value;
  const avgProgress = snapshot?.metrics.find((m) => m.key === "average_progress")?.value;
  const attentionCount = snapshot?.attention_projects.length ?? 0;

  return [
    {
      domainKey: "sales",
      title: "Penjualan & Komersial",
      businessPurpose: "Monitoring prospek, alur pemesanan, dan penyelesaian akad.",
      readiness: "NOT_CONNECTED",
      readinessLabel: "Belum Terhubung",
      facts: [
        { label: "Target Closing", value: "—" },
        { label: "Prospek Berkualitas", value: "—" },
        { label: "Akad KPR", value: "—" },
      ],
      primaryAttention: "Sumber data penjualan belum terhubung.",
      drilldownHref: "/workspace/sales",
      sourceName: "CRM Penjualan",
      lastUpdated: "—",
    },
    {
      domainKey: "finance",
      title: "Kondisi Keuangan",
      businessPurpose: "Likuiditas kas harian, realisasi anggaran, dan rekonsiliasi bank.",
      readiness: "NOT_CONNECTED",
      readinessLabel: "Belum Terhubung",
      facts: [
        { label: "Kas Tersedia", value: "—" },
        { label: "Arus Kas Masuk", value: "—" },
        { label: "Arus Kas Keluar", value: "—" },
      ],
      primaryAttention: "Sumber data keuangan belum terhubung.",
      drilldownHref: "/workspace/finance",
      sourceName: "Buku Besar Keuangan",
      lastUpdated: "—",
    },
    {
      domainKey: "property",
      title: "Proyek & Konstruksi",
      businessPurpose: "Kemajuan fisik proyek, 7 hold points, dan keselamatan kerja.",
      readiness: isSnapshotConnected ? "PARTIAL" : "NOT_CONNECTED",
      readinessLabel: isSnapshotConnected ? "Sebagian Tersedia" : "Belum Terhubung",
      facts: [
        { label: "Proyek Aktif", value: isSnapshotConnected && activeProjects !== null && activeProjects !== undefined ? `${activeProjects} Proyek` : "—" },
        { label: "Rata-rata Kemajuan", value: isSnapshotConnected && avgProgress !== null && avgProgress !== undefined ? `${avgProgress}%` : "—" },
        { label: "Proyek Perlu Perhatian", value: isSnapshotConnected ? `${attentionCount} Proyek` : "—" },
      ],
      primaryAttention: isSnapshotConnected && attentionCount > 0
        ? `${snapshot?.attention_projects[0]?.name} (${snapshot?.attention_projects[0]?.progress_percent}% - ${translatePerformanceState(snapshot?.attention_projects[0]?.status)})`
        : isSnapshotConnected ? "Tidak ada kendala material terdeteksi" : "Sumber data belum terhubung.",
      drilldownHref: "/workspace/executive/projects",
      sourceName: "Manajemen Proyek",
      lastUpdated: isSnapshotConnected && snapshot?.generated_at ? formatDateIndonesian(snapshot.generated_at) : "—",
    },
    {
      domainKey: "legal",
      title: "Legal, Perizinan & KPR",
      businessPurpose: "Legalitas tanah, penerbitan PBG/SLF, dan berkas KPR perbankan.",
      readiness: "NOT_CONNECTED",
      readinessLabel: "Belum Terhubung",
      facts: [
        { label: "Izin PBG/SLF", value: "—" },
        { label: "Kontrak Menunggu", value: "—" },
        { label: "Berkas KPR", value: "—" },
      ],
      primaryAttention: "Sumber data legalitas belum terhubung.",
      drilldownHref: "/workspace/legal",
      sourceName: "Sistem Legalitas & Kepatuhan",
      lastUpdated: "—",
    },
    {
      domainKey: "hr",
      title: "SDM & Organisasi",
      businessPurpose: "Formasi karyawan aktif, absensi, dan pemisahan tugas (SoD).",
      readiness: "NOT_CONNECTED",
      readinessLabel: "Belum Terhubung",
      facts: [
        { label: "Karyawan Aktif", value: "—" },
        { label: "Tingkat Kehadiran", value: "—" },
        { label: "Kepatuhan SoD", value: "—" },
      ],
      primaryAttention: "Sumber data personalia belum terhubung.",
      drilldownHref: "/workspace/hr",
      sourceName: "Sistem Manajemen SDM",
      lastUpdated: "—",
    },
    {
      domainKey: "it",
      title: "Teknologi & ALOS",
      businessPurpose: "Ketersediaan platform, backend API, dan kontrol agen GENESIS.",
      readiness: "NOT_CONNECTED",
      readinessLabel: "Belum Terhubung",
      facts: [
        { label: "Status ALOS", value: "Aktif (Frontend)" },
        { label: "Insiden Kritis", value: "—" },
        { label: "Pencadangan Data", value: "—" },
      ],
      primaryAttention: "Pemantauan runtime operasional IT penuh belum terhubung.",
      drilldownHref: "/workspace/it",
      sourceName: "Operasional IT ALOS",
      lastUpdated: "—",
    },
  ];
}

/* =========================================================================
 * EARLY WARNINGS PROJECTION (EXTENDED)
 * ========================================================================= */

export function projectExecutiveEarlyWarnings(
  snapshot: ExecutiveDashboardSnapshot | null,
): readonly ExecutiveEarlyWarningItem[] {
  if (!snapshot) return [];

  const warnings: ExecutiveEarlyWarningItem[] = [];

  // Critical projects
  snapshot.attention_projects
    .filter((p) => p.status === "CRITICAL")
    .forEach((p) => {
      warnings.push({
        id: `warn-proj-${p.project_id}`,
        title: `Proyek ${p.name}`,
        category: "Konstruksi & Proyek",
        severity: "CRITICAL",
        severityLabel: "Kritis",
        concreteCause: `Kemajuan fisik baru mencapai ${p.progress_percent}%, deviasi kritis terdeteksi.`,
        source: "Proyek & Konstruksi",
        sinceWhen: formatDateIndonesian(snapshot.generated_at),
        actionHref: `/workspace/executive/projects`,
        actionLabel: "Buka Proyek",
      });
    });

  // Overdue decisions
  snapshot.pending_approvals
    .filter((a) => a.urgency === "OVERDUE")
    .forEach((a) => {
      warnings.push({
        id: `warn-appr-${a.approval_id}`,
        title: a.title,
        category: "Keputusan Tertunda",
        severity: "CRITICAL",
        severityLabel: "Terlambat",
        concreteCause: `Persetujuan diajukan oleh ${a.requested_by} (${a.workspace_name}) telah menunggu ${a.age_days} hari melampaui SLA.`,
        source: "Alur Persetujuan ALOS",
        sinceWhen: formatDateIndonesian(a.submitted_at),
        actionHref: `/workspace/executive/approvals`,
        actionLabel: "Tinjau Keputusan",
      });
    });

  // At-risk projects
  snapshot.attention_projects
    .filter((p) => p.status === "AT_RISK")
    .forEach((p) => {
      warnings.push({
        id: `warn-proj-${p.project_id}`,
        title: `Proyek ${p.name}`,
        category: "Konstruksi & Proyek",
        severity: "AT_RISK",
        severityLabel: "Berisiko",
        concreteCause: `Kemajuan fisik sebesar ${p.progress_percent}%, memerlukan perhatian pengawas.`,
        source: "Proyek & Konstruksi",
        sinceWhen: formatDateIndonesian(snapshot.generated_at),
        actionHref: `/workspace/executive/projects`,
        actionLabel: "Buka Proyek",
      });
    });

  // Due soon decisions
  snapshot.pending_approvals
    .filter((a) => a.urgency === "DUE_SOON")
    .forEach((a) => {
      warnings.push({
        id: `warn-appr-${a.approval_id}`,
        title: a.title,
        category: "Keputusan Tertunda",
        severity: "DUE_SOON",
        severityLabel: "Mendekati Tenggat",
        concreteCause: `Persetujuan dari ${a.workspace_name} mendekati batas toleransi waktu tinjauan (${a.age_days} hari).`,
        source: "Alur Persetujuan ALOS",
        sinceWhen: formatDateIndonesian(a.submitted_at),
        actionHref: `/workspace/executive/approvals`,
        actionLabel: "Tinjau Keputusan",
      });
    });

  // Divisions needing attention
  snapshot.divisions
    .filter((d) => d.health === "ATTENTION" || d.health === "CRITICAL")
    .forEach((d) => {
      warnings.push({
        id: `warn-div-${d.division_code}`,
        title: `Divisi ${d.division_name}`,
        category: "Organisasi",
        severity: d.health === "CRITICAL" ? "CRITICAL" : "AT_RISK",
        severityLabel: d.health === "CRITICAL" ? "Kritis" : "Perlu Perhatian",
        concreteCause: `Terdapat ${d.pending_approvals} persetujuan menunggu tindakan dan ${d.document_count} dokumen aktif.`,
        source: "Status Divisi",
        sinceWhen: formatDateIndonesian(snapshot.generated_at),
        actionHref: `/workspace/executive/divisions`,
        actionLabel: "Lihat Divisi",
      });
    });

  return warnings;
}

/* =========================================================================
 * DATA STATUS SUMMARY PROJECTION
 * ========================================================================= */

export function projectDataStatusSummary(
  isSnapshotConnected: boolean,
  isStrategyConnected: boolean,
  snapshotTime?: string | null,
): ExecutiveDataStatusSummary {
  const sources: ExecutiveSourceInspection[] = [
    {
      id: "strategy",
      name: "Rencana & Target Perusahaan (Stage 2)",
      domain: "Strategi",
      state: isStrategyConnected ? "LIVE" : "NOT_CONNECTED",
      stateLabel: isStrategyConnected ? "Terkini" : "Belum Terhubung",
      checked: true,
      detail: isStrategyConnected ? "Terhubung ke Backend Strategy API resmi" : "Endpoint belum memberikan respons",
      lastUpdated: snapshotTime,
    },
    {
      id: "operational",
      name: "Ringkasan Operasional Eksekutif",
      domain: "Operasional",
      state: isSnapshotConnected ? "LIVE" : "NOT_CONNECTED",
      stateLabel: isSnapshotConnected ? "Terkini" : "Belum Terhubung",
      checked: true,
      detail: isSnapshotConnected ? "Snapshot operasional diterima" : "Backend mengembalikan 404 (sumber belum terhubung)",
      lastUpdated: snapshotTime,
    },
    {
      id: "sales",
      name: "Sistem Penjualan & CRM",
      domain: "Penjualan",
      state: "NOT_CONNECTED",
      stateLabel: "Belum Terhubung",
      checked: false,
      detail: "Terdaftar di katalog kebutuhan data bisnis; konektor API penjualan belum diaktifkan.",
    },
    {
      id: "finance",
      name: "Buku Besar Keuangan & Kas",
      domain: "Keuangan",
      state: "NOT_CONNECTED",
      stateLabel: "Belum Terhubung",
      checked: false,
      detail: "Terdaftar di katalog kebutuhan data bisnis; konektor API keuangan belum diaktifkan.",
    },
    {
      id: "property",
      name: "Manajemen Proyek Konstruksi",
      domain: "Proyek",
      state: "NOT_CONNECTED",
      stateLabel: "Belum Terhubung",
      checked: false,
      detail: "Terdaftar di katalog kebutuhan data bisnis; konektor API proyek mandiri belum diaktifkan.",
    },
    {
      id: "legal",
      name: "Dokumen Legal & KPR",
      domain: "Legal",
      state: "NOT_CONNECTED",
      stateLabel: "Belum Terhubung",
      checked: false,
      detail: "Terdaftar di katalog kebutuhan data bisnis; konektor API legalitas belum diaktifkan.",
    },
    {
      id: "hr",
      name: "Personalia & SDM",
      domain: "SDM",
      state: "NOT_CONNECTED",
      stateLabel: "Belum Terhubung",
      checked: false,
      detail: "Terdaftar di katalog kebutuhan data bisnis; konektor API personalia belum diaktifkan.",
    },
    {
      id: "it",
      name: "Telemetri Platform & IT",
      domain: "Teknologi",
      state: "NOT_CONNECTED",
      stateLabel: "Belum Terhubung",
      checked: false,
      detail: "Terdaftar di katalog kebutuhan data bisnis; konektor telemetri belum diaktifkan.",
    },
    {
      id: "genesis",
      name: "Kontrol Agen GENESIS",
      domain: "AI & Pengawasan",
      state: "NOT_CONNECTED",
      stateLabel: "Belum Terhubung",
      checked: false,
      detail: "Terdaftar di katalog kebutuhan data bisnis; layanan penasihat otomatis belum diaktifkan.",
    },
  ];

  const checkedSources = sources.filter((s) => s.checked);
  let liveCount = 0;
  let partialCount = 0;
  let notConnectedCount = 0;
  let staleCount = 0;
  let errorCount = 0;

  for (const src of checkedSources) {
    if (src.state === "LIVE") liveCount++;
    else if (src.state === "PARTIAL") partialCount++;
    else if (src.state === "NOT_CONNECTED") notConnectedCount++;
    else if (src.state === "STALE") staleCount++;
    else if (src.state === "ERROR") errorCount++;
  }

  return {
    totalChecked: checkedSources.length,
    totalInspected: checkedSources.length,
    inspectedCount: checkedSources.length,
    registeredCount: sources.length,
    catalogUnconnectedCount: sources.length - checkedSources.length,
    liveCount,
    partialCount,
    notConnectedCount,
    staleCount,
    errorCount,
    lastUpdatedFormatted: formatDateIndonesian(snapshotTime),
    sources,
  };
}

/* =========================================================================
 * PRESERVED LEGACY PROJECTIONS (MAINTAINING TEST COMPATIBILITY)
 * ========================================================================= */

export function projectExecutiveBrief(
  snapshot: ExecutiveDashboardSnapshot,
): readonly ExecutiveBriefBlock[] {
  const pendingCount = snapshot.pending_approvals.length;
  const hasDivisions = snapshot.divisions.length > 0;

  return [
    {
      key: "health",
      label: "Kesehatan",
      title: "Kesehatan Perusahaan",
      state: hasDivisions ? "PARTIAL" : "NOT_CONNECTED",
      summary: hasDivisions ? "Partial" : "Belum terhubung",
      hint: "Data divisi aktif; 9 lajur strategis penuh belum terhubung.",
    },
    {
      key: "decisions",
      label: "Keputusan",
      title: "Antrean Keputusan",
      state: "LIVE",
      summary: `${pendingCount} pending`,
      hint: `${pendingCount} item menunggu keputusan manusia.`,
      href: "/workspace/executive/approvals",
    },
    {
      key: "early_warning",
      label: "Early Warning",
      title: "Peringatan Dini",
      state: "PARTIAL",
      summary: "Partial",
      hint: "Mencakup perhatian proyek & task; risiko keuangan & legal belum terhubung.",
    },
    {
      key: "cash",
      label: "Kas & Dompet",
      title: "Posisi Kas & Likuiditas",
      state: "NOT_CONNECTED",
      summary: "Belum terhubung",
      hint: "Sumber data arus kas dan dompet belum terintegrasi.",
    },
    {
      key: "agent_overnight",
      label: "Jejak Agent",
      title: "Jejak Agent Semalam",
      state: "NOT_CONNECTED",
      summary: "Belum terhubung",
      hint: "Log dan ringkasan audit agent semalam belum terhubung.",
    },
  ];
}

const URGENCY_WEIGHT: Record<DecisionQueueItem["urgency"], number> = {
  OVERDUE: 3,
  DUE_SOON: 2,
  NORMAL: 1,
};

export function projectDecisionQueue(
  snapshot: ExecutiveDashboardSnapshot,
): readonly DecisionQueueItem[] {
  const items: DecisionQueueItem[] = snapshot.pending_approvals.map((approval) => ({
    approval_id: approval.approval_id,
    kind: approval.kind,
    kindLabel: approval.kind === "DOCUMENT" ? "Dokumen" : "Rilis GENESIS",
    title: approval.title,
    requested_by: approval.requested_by,
    workspace_name: approval.workspace_name,
    submitted_at: approval.submitted_at,
    age_days: approval.age_days,
    ageLabel: approvalAgeLabel(approval.age_days),
    urgency: approval.urgency,
    urgencyLabel:
      approval.urgency === "OVERDUE"
        ? "Terlambat"
        : approval.urgency === "DUE_SOON"
          ? "Mendekati Tenggat"
          : "Normal",
    href: "/workspace/executive/approvals",
  }));

  return items.sort((a, b) => {
    const weightDiff = URGENCY_WEIGHT[b.urgency] - URGENCY_WEIGHT[a.urgency];
    if (weightDiff !== 0) return weightDiff;
    return b.age_days - a.age_days;
  });
}

export function projectDivisionHealth(
  snapshot: ExecutiveDashboardSnapshot,
): readonly DivisionHealthItem[] {
  return snapshot.divisions.map((div) => {
    let healthLabel = "Belum terhubung";
    if (div.health === "HEALTHY") {
      healthLabel = "Sehat";
    } else if (div.health === "ATTENTION") {
      healthLabel = "Perlu Perhatian";
    } else if (div.health === "CRITICAL") {
      healthLabel = "Kritis";
    }

    return {
      division_code: div.division_code,
      division_name: div.division_name,
      health: div.health,
      healthLabel,
      document_count: div.document_count,
      pending_approvals: div.pending_approvals,
      active_genesis_workflows: div.active_genesis_workflows,
    };
  });
}

export function projectEarlyWarnings(snapshot: ExecutiveDashboardSnapshot) {
  const criticalProjects = snapshot.attention_projects.filter((p) => p.status === "CRITICAL");
  const atRiskProjects = snapshot.attention_projects.filter((p) => p.status === "AT_RISK");
  const overdueDecisions = snapshot.pending_approvals.filter((a) => a.urgency === "OVERDUE");
  const attentionDivisions = snapshot.divisions.filter(
    (d) => d.health === "ATTENTION" || d.health === "CRITICAL",
  );

  const totalWarnings =
    criticalProjects.length +
    atRiskProjects.length +
    overdueDecisions.length +
    attentionDivisions.length;

  return {
    totalWarnings,
    criticalProjects,
    atRiskProjects,
    overdueDecisions,
    attentionDivisions,
  };
}

export function projectExecutiveAIContext(
  snapshot: ExecutiveDashboardSnapshot,
): ExecutiveAIContext {
  const activeWorkflows = snapshot.divisions.reduce(
    (sum, div) => sum + (div.active_genesis_workflows || 0),
    0,
  );

  return {
    activeWorkflows,
    evidenceLineageStatus: "Belum tersedia",
    available: true,
    hint: "Total alur kerja analisis GENESIS yang aktif di seluruh divisi.",
  };
}
