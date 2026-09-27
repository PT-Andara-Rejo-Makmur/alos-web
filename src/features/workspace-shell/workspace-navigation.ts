import type { ComponentType } from "react";
import {
  BadgeCheck,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  ChartColumn,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronsUpDown,
  CircleDollarSign,
  ClockAlert,
  Files,
  Fingerprint,
  FolderKanban,
  Gauge,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Newspaper,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
  X,
  Activity,
  ArrowRight,
  CalendarCheck2,
  FileCheck2,
  RefreshCcw,
  Milestone,
  HardHat,
  ClipboardCheck,
  FilePenLine,
  KeyRound,
  UserRoundPlus,
  Funnel,
  MapPinCheck,
  Megaphone,
  RadioTower,
  GitBranch,
  PhoneCall,
  MessageSquareWarning,
  UsersRound,
  CalendarDays,
  UserRoundSearch,
  UserPlus,
  GraduationCap,
  Network,
  FileSignature,
  FolderLock,
  Briefcase,
  CalendarClock,
  MapPinned,
  Scale,
  SearchCheck,
  Server,
  Cable,
  Database,
  Boxes,
  Workflow,
  Rocket,
  Wrench,
  Siren,
  DatabaseBackup,
  RotateCcw,
  Blocks,
  BrainCircuit,
  Play,
  FlaskConical,
  Target,
} from "lucide-react";

import type { SessionActor } from "@/features/session";
import {
  WORKSPACE_ROUTES,
  getModuleReadiness,
  getWorkspaceRoot,
  getWorkspaceModuleRoute,
  getWorkspaceAraRoute,
  getWorkspaceAgentsRoute,
  getGenesisRoute,
  getGovernanceRoute,
  normalizeWorkspaceKey,
} from "@/features/workspace-routing";
import type {
  WorkspaceIconKey,
  WorkspaceNavGroup,
  WorkspaceNavItem,
  WorkspaceShellIdentity,
} from "./types";

/**
 * Registry of official SVG icons via lucide-react.
 * Zero AI-generated SVGs, no emojis, no PNGs.
 */
export const WORKSPACE_ICONS: Record<
  WorkspaceIconKey,
  ComponentType<{ className?: string; size?: number | string; strokeWidth?: number | string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  LayoutDashboard,
  Landmark,
  CircleDollarSign,
  ReceiptText,
  ChartNoAxesCombined,
  BriefcaseBusiness,
  ListChecks,
  BadgeCheck,
  Files,
  ChartColumn,
  TriangleAlert,
  Sparkles,
  Bot,
  ShieldCheck,
  ChevronsUpDown,
  Building2,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  UserRound,
  ChevronDown,
  ArrowRight,
  Newspaper,
  FolderKanban,
  Gauge,
  ClockAlert,
  Activity,
  Fingerprint,
  ScrollText,
  RefreshCcw,
  FileCheck2,
  CalendarCheck2,
  Milestone,
  HardHat,
  ClipboardCheck,
  FilePenLine,
  KeyRound,
  UserRoundPlus,
  Funnel,
  MapPinCheck,
  Megaphone,
  RadioTower,
  GitBranch,
  PhoneCall,
  MessageSquareWarning,
  UsersRound,
  CalendarDays,
  UserRoundSearch,
  UserPlus,
  GraduationCap,
  Network,
  FileSignature,
  FolderLock,
  Briefcase,
  CalendarClock,
  MapPinned,
  Scale,
  SearchCheck,
  Server,
  Cable,
  Database,
  Boxes,
  Workflow,
  Rocket,
  Wrench,
  Siren,
  DatabaseBackup,
  RotateCcw,
  Blocks,
  BrainCircuit,
  Play,
  FlaskConical,
  Target,
};

function canSeeAgents(roles: readonly string[] = []): boolean {
  // Business-facing Agent Workforce is visible to authenticated workspace members
  return roles.length > 0;
}

function buildNavItem(raw: {
  key: string;
  label: string;
  href: string | null;
  icon: WorkspaceIconKey;
  group: WorkspaceNavGroup;
  available?: boolean;
  navigable?: boolean;
  requiredRole?: readonly string[];
  requiredCapability?: string;
  badge?: number;
}): WorkspaceNavItem {
  const readiness = getModuleReadiness(raw.key);
  const isExplicitBlocked = raw.available === false || readiness.availability === "BLOCKED";
  const availability = isExplicitBlocked ? "BLOCKED" : "READY";

  // Separation of Navigability from Backend Readiness:
  // If `navigable` is explicitly specified, respect it.
  // Otherwise, fallback: if raw.available === false or raw.href is null, navigable = false;
  // if available and has href, default to !isExplicitBlocked.
  const navigable = raw.navigable !== undefined
    ? raw.navigable && Boolean(raw.href)
    : !isExplicitBlocked && Boolean(raw.href);

  const href = navigable ? raw.href : null;

  return {
    key: raw.key,
    label: raw.label,
    href,
    icon: raw.icon,
    group: raw.group,
    badge: raw.badge,
    visibility: "VISIBLE",
    availability,
    navigable,
    blockReason: isExplicitBlocked ? (readiness.blockReason ?? "BACKEND_NOT_CONNECTED") : undefined,
    available: navigable,
    requiredRole: raw.requiredRole,
    requiredCapability: raw.requiredCapability,
  };
}

type RawNavItem = {
  key: string;
  label: string;
  href: string | null;
  icon: WorkspaceIconKey;
  group: WorkspaceNavGroup;
  available?: boolean;
  navigable?: boolean;
  requiredRole?: readonly string[];
  requiredCapability?: string;
  badge?: number;
};

/**
 * Builds canonical projected navigation based on workspace identity and actor authority.
 * UX projection only — final security authorization remains strictly enforced by ALOS Backend.
 */
export function projectWorkspaceNavigation(
  identity: WorkspaceShellIdentity,
  actor?: SessionActor | null,
): readonly WorkspaceNavItem[] {
  const roles = actor?.roles ?? [];
  const permissions = actor?.permissions ?? [];
  const division = (identity.divisionCode || "").toUpperCase();

  // Primary routing context: normalize canonical workspace key from verified identity.
  // Division code is strictly a fallback only if workspaceKey is not directly canonical.
  const normalizedKey = normalizeWorkspaceKey(identity.workspaceKey);
  const effectiveWorkspaceKey =
    normalizedKey ??
    (division === "EXECUTIVE" || division === "EXEC"
      ? "executive"
      : division === "FINANCE"
        ? "finance"
        : division === "PROPERTY"
          ? "property"
          : division === "SALES" || division === "SALES_MARKETING"
            ? "sales"
            : division === "HR" || division === "PEOPLE"
              ? "hr"
              : division === "LEGAL" || division === "COMPLIANCE" || division === "LEGAL_COMPLIANCE"
                ? "legal"
                : division === "IT" || division === "TECHNOLOGY"
                  ? "it"
                  : null);

  const isExecutive = effectiveWorkspaceKey === "executive";
  const isFinance = effectiveWorkspaceKey === "finance";
  const isProperty = effectiveWorkspaceKey === "property";
  const isSales = effectiveWorkspaceKey === "sales";
  const isHr = effectiveWorkspaceKey === "hr";
  const isLegal = effectiveWorkspaceKey === "legal";
  const isIt = effectiveWorkspaceKey === "it";

  const items: RawNavItem[] = [];

  // Executive IA is structured into COMMAND CENTER, ORGANIZATION, DECISIONS, INFORMATION & AI
  if (isExecutive) {
    items.push(
      // Group: COMMAND_CENTER (PUSAT KENDALI)
      {
        key: "overview",
        label: "Ringkasan",
        href: getWorkspaceRoot("executive"),
        icon: "LayoutDashboard",
        group: "COMMAND_CENTER",
        available: false,
        navigable: true,
      },
      {
        key: "brief",
        label: "Brief Eksekutif",
        href: "/workspace/executive/brief",
        icon: "Newspaper",
        group: "COMMAND_CENTER",
        available: false,
        navigable: true,
      },
      // Group: STRATEGI_KINERJA
      {
        key: "strategy",
        label: "Overview",
        href: "/workspace/executive/strategy",
        icon: "Target",
        group: "STRATEGI_KINERJA",
        available: false,
        navigable: true,
      },
      { key: "renstra", label: "Renstra", href: "/workspace/executive/strategy/renstra", icon: "Target", group: "STRATEGI_KINERJA", available: false, navigable: true },
      { key: "annual-plan", label: "RKAP & Rencana Kerja", href: "/workspace/executive/strategy/annual-plan", icon: "CalendarDays", group: "STRATEGI_KINERJA", available: false, navigable: true },
      { key: "targets", label: "Target Perusahaan", href: "/workspace/executive/strategy/targets", icon: "Gauge", group: "STRATEGI_KINERJA", available: false, navigable: true },
      {
        key: "objectives",
        label: "Sasaran",
        href: "/workspace/executive/strategy/objectives",
        icon: "Target",
        group: "STRATEGI_KINERJA",
        available: false,
        navigable: true,
      },
      {
        key: "kpis",
        label: "KPI",
        href: "/workspace/executive/strategy/kpis",
        icon: "Target",
        group: "STRATEGI_KINERJA",
        available: false,
        navigable: true,
      },
      {
        key: "initiatives",
        label: "Inisiatif",
        href: "/workspace/executive/strategy/initiatives",
        icon: "BriefcaseBusiness",
        group: "STRATEGI_KINERJA",
        available: false,
        navigable: true,
      },
      {
        key: "reviews",
        label: "Review Kinerja",
        href: "/workspace/executive/strategy/reviews",
        icon: "BadgeCheck",
        group: "STRATEGI_KINERJA",
        available: false,
        navigable: true,
      },
      { key: "revisions", label: "Revisi Target", href: "/workspace/executive/strategy/revisions", icon: "RefreshCcw", group: "STRATEGI_KINERJA", available: false, navigable: true },
      { key: "sources", label: "Sumber Strategis", href: "/workspace/executive/strategy/sources", icon: "Files", group: "STRATEGI_KINERJA", available: false, navigable: true },
      // Group: ORGANIZATION (ORGANISASI)
      {
        key: "divisions",
        label: "Divisi",
        href: "/workspace/executive/divisions",
        icon: "Building2",
        group: "ORGANIZATION",
        available: false,
        navigable: true,
      },
      // Group: PEKERJAAN
      {
        key: "projects",
        label: "Proyek",
        href: getWorkspaceModuleRoute("executive", "projects"),
        icon: "BriefcaseBusiness",
        group: "PEKERJAAN",
        available: false,
        navigable: true,
      },
      {
        key: "tasks",
        label: "Tugas",
        href: getWorkspaceModuleRoute("executive", "tasks"),
        icon: "ListChecks",
        group: "PEKERJAAN",
        available: false,
        navigable: true,
      },
      {
        key: "approvals",
        label: "Persetujuan",
        href: getWorkspaceModuleRoute("executive", "approvals"),
        icon: "BadgeCheck",
        group: "PEKERJAAN",
        available: false,
        navigable: true,
      },
      {
        key: "documents",
        label: "Dokumen",
        href: getWorkspaceModuleRoute("executive", "documents"),
        icon: "Files",
        group: "PEKERJAAN",
        available: false,
        navigable: true,
      },
      {
        key: "reports",
        label: "Laporan",
        href: getWorkspaceModuleRoute("executive", "reports"),
        icon: "ChartColumn",
        group: "PEKERJAAN",
        available: false,
        navigable: true,
      },
      {
        key: "findings",
        label: "Temuan",
        href: getWorkspaceModuleRoute("executive", "findings"),
        icon: "TriangleAlert",
        group: "PEKERJAAN",
        available: false,
        navigable: true,
      },
      // Group: AI
      {
        key: "ara",
        label: "ARA",
        href: getWorkspaceAraRoute("executive"),
        icon: "Sparkles",
        group: "AI",
        available: false,
        navigable: true,
      },
    );

    return items.map(buildNavItem);
  }

  // Group 1: UTAMA
  items.push({
    key: "overview",
    label: isIt ? "Ringkasan" : "Overview",
    href: isFinance
      ? WORKSPACE_ROUTES.finance
      : isProperty
        ? WORKSPACE_ROUTES.property
        : isSales
          ? WORKSPACE_ROUTES.sales
          : isHr
            ? WORKSPACE_ROUTES.hr
            : isLegal
              ? WORKSPACE_ROUTES.legal
              : isIt
                ? WORKSPACE_ROUTES.it
                : WORKSPACE_ROUTES.resolver,
    icon: "LayoutDashboard",
    group: isIt ? "ALOS_PLATFORM" : "UTAMA",
    available: true,
    navigable: isIt ? true : undefined,
  });

  // IT & Technology Workspace specific IA
  if (isIt) {
    // Group: IDENTITY_ACCESS. Visibility is only a Backend-projected UX affordance;
    // every destination still enforces authority independently.
    if (roles.includes("IT_ADMIN") && permissions.includes("identity.accounts.manage")) items.push(
      { key: "users", label: "Kelola Akun", href: "/workspace/it/users", icon: "UsersRound", group: "IDENTITY_ACCESS", available: true, navigable: true },
      { key: "register-user", label: "Daftarkan Akun", href: "/workspace/it/users/register", icon: "UserPlus", group: "IDENTITY_ACCESS", available: true, navigable: true },
      { key: "workspace-access", label: "Akses Workspace", href: "/workspace/it/users/access", icon: "FolderLock", group: "IDENTITY_ACCESS", available: true, navigable: true },
      { key: "access-review", label: "Tinjauan Akses", href: "/workspace/it/users/access-review", icon: "UserRoundSearch", group: "IDENTITY_ACCESS", available: true, navigable: true },
    );
    items.push(
      { key: "systems", label: "Sistem", href: "/workspace/it/systems", icon: "Server", group: "ALOS_PLATFORM", available: false, navigable: true },
      { key: "integrations", label: "Integrasi", href: "/workspace/it/integrations", icon: "Cable", group: "ALOS_PLATFORM", available: false, navigable: true },
      { key: "database", label: "Basis Data", href: "/workspace/it/database", icon: "Database", group: "ALOS_PLATFORM", available: false, navigable: true },
      { key: "environments", label: "Lingkungan", href: "/workspace/it/environments", icon: "Boxes", group: "ALOS_PLATFORM", available: false, navigable: true },
    );

    // Group: ENGINEERING
    items.push(
      { key: "repositories", label: "Repositori", href: "/workspace/it/repositories", icon: "GitBranch", group: "ENGINEERING", available: false, navigable: true },
      { key: "cicd", label: "CI/CD", href: "/workspace/it/cicd", icon: "Workflow", group: "ENGINEERING", available: false, navigable: true },
      { key: "releases", label: "Rilis", href: "/workspace/it/releases", icon: "Rocket", group: "ENGINEERING", available: false, navigable: true },
      { key: "tech-debt", label: "Utang Teknis", href: "/workspace/it/tech-debt", icon: "Wrench", group: "ENGINEERING", available: false, navigable: true },
    );

    // Group: OPERATIONS
    items.push(
      { key: "monitoring", label: "Pemantauan", href: "/workspace/it/monitoring", icon: "Activity", group: "OPERATIONS", available: true, navigable: true },
      { key: "incidents", label: "Insiden", href: "/workspace/it/incidents", icon: "Siren", group: "OPERATIONS", available: false, navigable: true },
      { key: "security", label: "Keamanan", href: "/workspace/it/security", icon: "ShieldCheck", group: "OPERATIONS", available: false, navigable: true },
      { key: "backup", label: "Backup & Pemulihan Bencana", href: "/workspace/it/backup", icon: "DatabaseBackup", group: "OPERATIONS", available: false, navigable: true },
    );

    // Group: GENESIS (canonical control plane routes under IT namespace)
    items.push(
      { key: "control-plane", label: "Pusat Kendali", href: getGenesisRoute(), icon: "Bot", group: "GENESIS", available: true, navigable: true },
      { key: "agents", label: "Agen", href: getGenesisRoute("agents"), icon: "Bot", group: "GENESIS", available: false, navigable: true },
      { key: "skills", label: "Kapabilitas", href: getGenesisRoute("skills"), icon: "Blocks", group: "GENESIS", available: false, navigable: true },
      { key: "research", label: "Riset", href: getGenesisRoute("research"), icon: "SearchCheck", group: "GENESIS", available: false, navigable: true },
      { key: "models-tools", label: "Model & Tools", href: getGenesisRoute("models-tools"), icon: "BrainCircuit", group: "GENESIS", available: false, navigable: true },
    );

    // Group: GOVERNANCE
    items.push(
      { key: "evidence", label: "Bukti", href: getGovernanceRoute("evidence"), icon: "Fingerprint", group: "GOVERNANCE", available: false, navigable: true },
      { key: "uat", label: "UAT & Gerbang", href: getGovernanceRoute("uat"), icon: "FlaskConical", group: "GOVERNANCE", available: false, navigable: true },
      { key: "decisions", label: "Keputusan", href: getGovernanceRoute("decisions"), icon: "BadgeCheck", group: "GOVERNANCE", available: false, navigable: true },
    );

    // Group: WORK (Contextual Work Modules)
    items.push(
      { key: "projects", label: "Proyek", href: getWorkspaceModuleRoute("it", "projects"), icon: "FolderKanban", group: "WORK", available: false, navigable: true },
      { key: "tasks", label: "Tugas", href: getWorkspaceModuleRoute("it", "tasks"), icon: "ListChecks", group: "WORK", available: false, navigable: true },
      { key: "approvals", label: "Persetujuan", href: getWorkspaceModuleRoute("it", "approvals"), icon: "BadgeCheck", group: "WORK", available: false, navigable: true },
      { key: "documents", label: "Dokumen", href: getWorkspaceModuleRoute("it", "documents"), icon: "Files", group: "WORK", available: false, navigable: true },
      { key: "reports", label: "Laporan", href: getWorkspaceModuleRoute("it", "reports"), icon: "ChartColumn", group: "WORK", available: false, navigable: true },
      { key: "findings", label: "Temuan", href: getWorkspaceModuleRoute("it", "findings"), icon: "TriangleAlert", group: "WORK", available: false, navigable: true },
    );

    // Group: AI
    items.push(
      { key: "ara", label: "ARA", href: getWorkspaceAraRoute("it"), icon: "Sparkles", group: "AI", available: true, navigable: true },
    );

    return items.map(buildNavItem);
  }

  // Legal & Compliance Workspace specific IA
  if (isLegal) {
    // Group: STRATEGI_KINERJA
    items.push({
      key: "strategy",
      label: "Strategi & Kinerja",
      href: "/workspace/legal/strategy",
      icon: "Target",
      group: "STRATEGI_KINERJA",
      available: false,
      navigable: true,
    });

    // Group: LEGAL
    items.push(
      { key: "permits", label: "Permits", href: "/workspace/legal/permits", icon: "FileCheck2", group: "LEGAL", available: false },
      { key: "contracts", label: "Contracts", href: "/workspace/legal/contracts", icon: "FileSignature", group: "LEGAL", available: false },
      { key: "land-documents", label: "Land Documents", href: "/workspace/legal/land-documents", icon: "MapPinned", group: "LEGAL", available: false },
      { key: "due-diligence", label: "Due Diligence", href: "/workspace/legal/due-diligence", icon: "SearchCheck", group: "LEGAL", available: false },
      { key: "cases", label: "Legal Cases", href: "/workspace/legal/cases", icon: "Briefcase", group: "LEGAL", available: false },
    );

    // Group: COMPLIANCE
    items.push(
      { key: "expiry", label: "Expiry Monitor", href: "/workspace/legal/expiry", icon: "CalendarClock", group: "COMPLIANCE", available: false },
      { key: "claims", label: "Claims Review", href: "/workspace/legal/claims", icon: "BadgeCheck", group: "COMPLIANCE", available: false },
      { key: "privacy", label: "Privacy & Access", href: "/workspace/legal/privacy", icon: "ShieldCheck", group: "COMPLIANCE", available: false },
      { key: "risk", label: "Risk Register", href: "/workspace/legal/risk", icon: "TriangleAlert", group: "COMPLIANCE", available: false },
    );

    // Group: PEKERJAAN
    items.push(
      { key: "projects", label: "Proyek", href: getWorkspaceModuleRoute("legal", "projects"), icon: "BriefcaseBusiness", group: "PEKERJAAN", available: false, navigable: true },
      { key: "tasks", label: "Tugas", href: getWorkspaceModuleRoute("legal", "tasks"), icon: "ListChecks", group: "PEKERJAAN", available: false, navigable: true },
      { key: "approvals", label: "Persetujuan", href: getWorkspaceModuleRoute("legal", "approvals"), icon: "Scale", group: "PEKERJAAN", available: false, navigable: true },
      { key: "documents", label: "Dokumen", href: getWorkspaceModuleRoute("legal", "documents"), icon: "Files", group: "PEKERJAAN", available: false, navigable: true },
      { key: "reports", label: "Laporan", href: getWorkspaceModuleRoute("legal", "reports"), icon: "ChartColumn", group: "PEKERJAAN", available: false, navigable: true },
      { key: "findings", label: "Temuan", href: getWorkspaceModuleRoute("legal", "findings"), icon: "TriangleAlert", group: "PEKERJAAN", available: false, navigable: true },
    );

    // Group: AI
    items.push(
      { key: "ara", label: "ARA", href: getWorkspaceAraRoute("legal"), icon: "Sparkles", group: "AI", available: true },
      { key: "agents", label: "Agent workforce", href: getWorkspaceAgentsRoute("legal"), icon: "Bot", group: "AI", available: true },
    );

    return items.map(buildNavItem);
  }

  // HR & People Workspace specific IA
  if (isHr) {
    // Group: STRATEGI_KINERJA
    items.push({
      key: "strategy",
      label: "Strategi & Kinerja",
      href: "/workspace/hr/strategy",
      icon: "Target",
      group: "STRATEGI_KINERJA",
      available: false,
      navigable: true,
    });

    // Group: PEOPLE
    items.push(
      { key: "employees", label: "Employees", href: "/workspace/hr/employees", icon: "UsersRound", group: "PEOPLE", available: false },
      { key: "attendance", label: "Attendance", href: "/workspace/hr/attendance", icon: "CalendarCheck2", group: "PEOPLE", available: false },
      { key: "leave", label: "Leave", href: "/workspace/hr/leave", icon: "CalendarDays", group: "PEOPLE", available: false },
      { key: "recruitment", label: "Recruitment", href: "/workspace/hr/recruitment", icon: "UserRoundSearch", group: "PEOPLE", available: false },
      { key: "onboarding", label: "Onboarding", href: "/workspace/hr/onboarding", icon: "UserPlus", group: "PEOPLE", available: false },
    );

    // Group: DEVELOPMENT
    items.push(
      { key: "performance", label: "Performance", href: "/workspace/hr/performance", icon: "ChartNoAxesCombined", group: "DEVELOPMENT", available: false },
      { key: "training", label: "Training", href: "/workspace/hr/training", icon: "GraduationCap", group: "DEVELOPMENT", available: false },
      { key: "succession", label: "Succession", href: "/workspace/hr/succession", icon: "Network", group: "DEVELOPMENT", available: false },
    );

    // Group: EMPLOYEE_RELATIONS
    items.push(
      { key: "grievances", label: "Grievances", href: "/workspace/hr/grievances", icon: "MessageSquareWarning", group: "EMPLOYEE_RELATIONS", available: false },
      { key: "contracts", label: "Contracts", href: "/workspace/hr/contracts", icon: "FileSignature", group: "EMPLOYEE_RELATIONS", available: false },
      { key: "personnel-files", label: "Personnel Files", href: "/workspace/hr/personnel-files", icon: "FolderLock", group: "EMPLOYEE_RELATIONS", available: false },
    );

    // Group: PEKERJAAN
    items.push(
      { key: "projects", label: "Proyek", href: getWorkspaceModuleRoute("hr", "projects"), icon: "BriefcaseBusiness", group: "PEKERJAAN", available: false, navigable: true },
      { key: "tasks", label: "Tugas", href: getWorkspaceModuleRoute("hr", "tasks"), icon: "ListChecks", group: "PEKERJAAN", available: false, navigable: true },
      { key: "approvals", label: "Persetujuan", href: getWorkspaceModuleRoute("hr", "approvals"), icon: "BadgeCheck", group: "PEKERJAAN", available: false, navigable: true },
      { key: "documents", label: "Dokumen", href: getWorkspaceModuleRoute("hr", "documents"), icon: "Files", group: "PEKERJAAN", available: false, navigable: true },
      { key: "reports", label: "Laporan", href: getWorkspaceModuleRoute("hr", "reports"), icon: "ChartColumn", group: "PEKERJAAN", available: false, navigable: true },
      { key: "findings", label: "Temuan", href: getWorkspaceModuleRoute("hr", "findings"), icon: "TriangleAlert", group: "PEKERJAAN", available: false, navigable: true },
    );

    // Group: AI
    items.push(
      { key: "ara", label: "ARA", href: getWorkspaceAraRoute("hr"), icon: "Sparkles", group: "AI", available: true },
      { key: "agents", label: "Agent workforce", href: getWorkspaceAgentsRoute("hr"), icon: "Bot", group: "AI", available: true },
    );

    return items.map(buildNavItem);
  }

  // Sales & Marketing Workspace specific IA
  if (isSales) {
    // Group: STRATEGI_KINERJA
    items.push({
      key: "strategy",
      label: "Strategi & Kinerja",
      href: "/workspace/sales/strategy",
      icon: "Target",
      group: "STRATEGI_KINERJA",
      available: false,
      navigable: true,
    });

    // Group: SALES
    items.push(
      { key: "leads", label: "Leads", href: "/workspace/sales/leads", icon: "UserRoundPlus", group: "SALES", available: false },
      { key: "pipeline", label: "CRM Pipeline", href: "/workspace/sales/pipeline", icon: "Funnel", group: "SALES", available: false },
      { key: "visits", label: "Site Visits", href: "/workspace/sales/visits", icon: "MapPinCheck", group: "SALES", available: false },
      { key: "bookings", label: "Bookings", href: "/workspace/sales/bookings", icon: "CircleDollarSign", group: "SALES", available: false },
      { key: "closings", label: "Closings", href: "/workspace/sales/closings", icon: "BadgeCheck", group: "SALES", available: false },
    );

    // Group: MARKETING
    items.push(
      { key: "campaigns", label: "Campaigns", href: "/workspace/sales/campaigns", icon: "Megaphone", group: "MARKETING", available: false },
      { key: "channels", label: "Channels", href: "/workspace/sales/channels", icon: "RadioTower", group: "MARKETING", available: false },
      { key: "attribution", label: "Attribution", href: "/workspace/sales/attribution", icon: "GitBranch", group: "MARKETING", available: false },
      { key: "content", label: "Content", href: "/workspace/sales/content", icon: "Files", group: "MARKETING", available: false },
    );

    // Group: CUSTOMER
    items.push(
      { key: "follow-up", label: "Follow-up", href: "/workspace/sales/follow-up", icon: "PhoneCall", group: "CUSTOMER", available: false },
      { key: "complaints", label: "Complaints", href: "/workspace/sales/complaints", icon: "MessageSquareWarning", group: "CUSTOMER", available: false },
    );

    // Group: PEKERJAAN
    items.push(
      { key: "projects", label: "Proyek", href: getWorkspaceModuleRoute("sales", "projects"), icon: "BriefcaseBusiness", group: "PEKERJAAN", available: false, navigable: true },
      { key: "tasks", label: "Tugas", href: getWorkspaceModuleRoute("sales", "tasks"), icon: "ListChecks", group: "PEKERJAAN", available: false, navigable: true },
      { key: "approvals", label: "Persetujuan", href: getWorkspaceModuleRoute("sales", "approvals"), icon: "BadgeCheck", group: "PEKERJAAN", available: false, navigable: true },
      { key: "documents", label: "Dokumen", href: getWorkspaceModuleRoute("sales", "documents"), icon: "Files", group: "PEKERJAAN", available: false, navigable: true },
      { key: "reports", label: "Laporan", href: getWorkspaceModuleRoute("sales", "reports"), icon: "ChartColumn", group: "PEKERJAAN", available: false, navigable: true },
      { key: "findings", label: "Temuan", href: getWorkspaceModuleRoute("sales", "findings"), icon: "TriangleAlert", group: "PEKERJAAN", available: false, navigable: true },
    );

    // Group: AI
    items.push(
      { key: "ara", label: "ARA", href: getWorkspaceAraRoute("sales"), icon: "Sparkles", group: "AI", available: true },
      { key: "agents", label: "Agent workforce", href: getWorkspaceAgentsRoute("sales"), icon: "Bot", group: "AI", available: true },
    );

    return items.map(buildNavItem);
  }

  // Property Workspace specific IA
  if (isProperty) {
    // Group: STRATEGI_KINERJA
    items.push({
      key: "strategy",
      label: "Strategi & Kinerja",
      href: "/workspace/property/strategy",
      icon: "Target",
      group: "STRATEGI_KINERJA",
      available: false,
      navigable: true,
    });

    // Group: PROJECT
    items.push(
      { key: "milestones", label: "Milestones", href: "/workspace/property/milestones", icon: "Milestone", group: "PROJECT", available: false },
      { key: "construction", label: "Construction", href: "/workspace/property/construction", icon: "HardHat", group: "PROJECT", available: false },
      { key: "quality", label: "Quality & NCR", href: "/workspace/property/quality", icon: "ClipboardCheck", group: "PROJECT", available: false },
      { key: "k3", label: "K3", href: "/workspace/property/k3", icon: "ShieldCheck", group: "PROJECT", available: false },
    );

    // Group: CONTROL
    items.push(
      { key: "change-orders", label: "Change Orders", href: "/workspace/property/change-orders", icon: "FilePenLine", group: "CONTROL", available: false },
      { key: "payment-certs", label: "Payment Cert.", href: "/workspace/property/payment-certificates", icon: "ReceiptText", group: "CONTROL", available: false },
      { key: "handover", label: "Handover", href: "/workspace/property/handover", icon: "KeyRound", group: "CONTROL", available: false },
    );

    // Group: PEKERJAAN
    items.push(
      { key: "projects", label: "Proyek", href: getWorkspaceModuleRoute("property", "projects"), icon: "BriefcaseBusiness", group: "PEKERJAAN", available: false, navigable: true },
      { key: "tasks", label: "Tugas", href: getWorkspaceModuleRoute("property", "tasks"), icon: "ListChecks", group: "PEKERJAAN", available: false, navigable: true },
      { key: "approvals", label: "Persetujuan", href: getWorkspaceModuleRoute("property", "approvals"), icon: "BadgeCheck", group: "PEKERJAAN", available: false, navigable: true },
      { key: "documents", label: "Dokumen", href: getWorkspaceModuleRoute("property", "documents"), icon: "Files", group: "PEKERJAAN", available: false, navigable: true },
      { key: "reports", label: "Laporan", href: getWorkspaceModuleRoute("property", "reports"), icon: "ChartColumn", group: "PEKERJAAN", available: false, navigable: true },
      { key: "findings", label: "Temuan", href: getWorkspaceModuleRoute("property", "findings"), icon: "TriangleAlert", group: "PEKERJAAN", available: false, navigable: true },
    );

    // Group: AI
    items.push(
      { key: "ara", label: "ARA", href: getWorkspaceAraRoute("property"), icon: "Sparkles", group: "AI", available: true },
      { key: "agents", label: "Agent workforce", href: getWorkspaceAgentsRoute("property"), icon: "Bot", group: "AI", available: true },
    );

    return items.map(buildNavItem);
  }

  // Finance Workspace specific IA
  if (isFinance) {
    // Group: STRATEGI_KINERJA
    items.push({
      key: "strategy",
      label: "Strategi & Kinerja",
      href: "/workspace/finance/strategy",
      icon: "Target",
      group: "STRATEGI_KINERJA",
      available: false,
      navigable: true,
    });

    items.push(
      { key: "cash", label: "Cash & Bank", href: "/workspace/finance/cash", icon: "Landmark", group: "KEUANGAN", available: false },
      { key: "receivables", label: "Receivables", href: "/workspace/finance/receivables", icon: "CircleDollarSign", group: "KEUANGAN", available: false },
      { key: "payables", label: "Payables", href: "/workspace/finance/payables", icon: "ReceiptText", group: "KEUANGAN", available: false },
      { key: "budget", label: "Budget", href: "/workspace/finance/budget", icon: "ChartNoAxesCombined", group: "KEUANGAN", available: false },
      { key: "reconciliation", label: "Reconciliation", href: "/workspace/finance/reconciliation", icon: "RefreshCcw", group: "KEUANGAN", available: false },
      { key: "tax", label: "Tax", href: "/workspace/finance/tax", icon: "FileCheck2", group: "COMPLIANCE", available: false },
      { key: "close", label: "Month Close", href: "/workspace/finance/month-close", icon: "CalendarCheck2", group: "COMPLIANCE", available: false },
    );

    // Group: PEKERJAAN (Cross-functional work modules)
    items.push(
      { key: "projects", label: "Proyek", href: getWorkspaceModuleRoute("finance", "projects"), icon: "BriefcaseBusiness", group: "PEKERJAAN", available: false, navigable: true },
      { key: "tasks", label: "Tugas", href: getWorkspaceModuleRoute("finance", "tasks"), icon: "ListChecks", group: "PEKERJAAN", available: false, navigable: true },
      { key: "approvals", label: "Persetujuan", href: getWorkspaceModuleRoute("finance", "approvals"), icon: "BadgeCheck", group: "PEKERJAAN", available: false, navigable: true },
      { key: "documents", label: "Dokumen", href: getWorkspaceModuleRoute("finance", "documents"), icon: "Files", group: "PEKERJAAN", available: false, navigable: true },
      { key: "reports", label: "Laporan", href: getWorkspaceModuleRoute("finance", "reports"), icon: "ChartColumn", group: "PEKERJAAN", available: false, navigable: true },
      { key: "findings", label: "Temuan", href: getWorkspaceModuleRoute("finance", "findings"), icon: "TriangleAlert", group: "PEKERJAAN", available: false, navigable: true },
    );

    // Group: AI
    items.push({
      key: "ara",
      label: "ARA",
      href: getWorkspaceAraRoute("finance"),
      icon: "Sparkles",
      group: "AI",
      available: true,
    });

    if (canSeeAgents(roles)) {
      items.push({
        key: "agents",
        label: "Agent Workforce",
        href: getWorkspaceAgentsRoute("finance"),
        icon: "Bot",
        group: "AI",
        available: true,
      });
    }

    return items.map(buildNavItem);
  }

  // Unknown/unrecognized workspace context: fail closed to safe resolver navigation.
  // Never default authority or context to Finance.
  return items.map(buildNavItem);
}
