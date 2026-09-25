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
} from "lucide-react";

import type { SessionActor } from "@/features/session";
import { isGovernanceNavigationVisible } from "@/features/access-control/dashboard-access";
import { WORKSPACE_ROUTES, getModuleReadiness } from "@/features/workspace-routing";
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
  requiredRole?: readonly string[];
  requiredCapability?: string;
  badge?: number;
}): WorkspaceNavItem {
  const readiness = getModuleReadiness(raw.key);
  const isExplicitBlocked = raw.available === false || readiness.availability === "BLOCKED";
  const availability = isExplicitBlocked ? "BLOCKED" : "READY";
  const href = isExplicitBlocked ? null : raw.href;
  return {
    key: raw.key,
    label: raw.label,
    href,
    icon: raw.icon,
    group: raw.group,
    badge: raw.badge,
    visibility: "VISIBLE",
    availability,
    blockReason: isExplicitBlocked ? (readiness.blockReason ?? "BACKEND_NOT_CONNECTED") : undefined,
    available: !isExplicitBlocked,
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
  const division = (identity.divisionCode || "").toUpperCase();
  const isDirector = roles.includes("EXECUTIVE") || identity.workspaceKey === "executive";

  const items: RawNavItem[] = [];

  // Director IA is structured into COMMAND CENTER, ORGANIZATION, DECISIONS, INFORMATION, AI & CONTROL
  if (isDirector) {
    items.push(
      // Group: COMMAND_CENTER
      {
        key: "overview",
        label: "Overview",
        href: WORKSPACE_ROUTES.executive,
        icon: "LayoutDashboard",
        group: "COMMAND_CENTER",
        available: true,
      },
      {
        key: "brief",
        label: "Executive Brief",
        href: `${WORKSPACE_ROUTES.executive}#brief`,
        icon: "Newspaper",
        group: "COMMAND_CENTER",
        available: true,
      },
      // Group: ORGANIZATION
      {
        key: "divisions",
        label: "Divisi",
        href: "/business/divisions",
        icon: "Building2",
        group: "ORGANIZATION",
        available: true,
      },
      {
        key: "projects",
        label: "Proyek",
        href: WORKSPACE_ROUTES.projects,
        icon: "BriefcaseBusiness",
        group: "ORGANIZATION",
        available: true,
      },
      // Group: DECISIONS
      {
        key: "approvals",
        label: "Approval",
        href: WORKSPACE_ROUTES.approvals,
        icon: "BadgeCheck",
        group: "DECISIONS",
        available: true,
      },
      {
        key: "findings",
        label: "Temuan & Risiko",
        href: WORKSPACE_ROUTES.findings,
        icon: "TriangleAlert",
        group: "DECISIONS",
        available: true,
      },
      // Group: INFORMATION
      {
        key: "documents",
        label: "Dokumen",
        href: WORKSPACE_ROUTES.documents,
        icon: "Files",
        group: "INFORMATION",
        available: true,
      },
      {
        key: "reports",
        label: "Laporan",
        href: WORKSPACE_ROUTES.reports,
        icon: "ChartColumn",
        group: "INFORMATION",
        available: true,
      },
      // Group: AI
      {
        key: "ara",
        label: "ARA",
        href: WORKSPACE_ROUTES.ara,
        icon: "Sparkles",
        group: "AI",
        available: true,
      },
    );

    if (isGovernanceNavigationVisible(roles)) {
      items.push({
        key: "governance",
        label: "Governance",
        href: "/genesis",
        icon: "ShieldCheck",
        group: "CONTROL",
        available: true,
      });
    }

    return items.map(buildNavItem);
  }

  const isFinance = division === "FINANCE" || identity.workspaceKey === "finance";
  const isProperty = division === "PROPERTY" || identity.workspaceKey === "property";
  const isSales = division === "SALES" || division === "SALES_MARKETING" || identity.workspaceKey === "sales";
  const isHr = division === "HR" || division === "PEOPLE" || identity.workspaceKey === "hr";
  const isLegal = division === "LEGAL" || division === "COMPLIANCE" || division === "LEGAL_COMPLIANCE" || identity.workspaceKey === "legal";
  const isIt = division === "IT" || division === "TECHNOLOGY" || identity.workspaceKey === "it";

  // Group 1: UTAMA
  items.push({
    key: "overview",
    label: "Overview",
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
                : "/business",
    icon: "LayoutDashboard",
    group: "UTAMA",
    available: true,
  });

  // IT & Technology Workspace specific IA
  if (isIt) {
    // Group: ALOS_PLATFORM
    if (roles.includes("IT_ADMIN")) items.push(
      { key: "users", label: "Kelola Akun", href: "/workspace/it/users", icon: "UsersRound", group: "IDENTITY_ACCESS", available: true },
      { key: "register-user", label: "Register Akun", href: "/workspace/it/users/register", icon: "UserPlus", group: "IDENTITY_ACCESS", available: true },
    );
    items.push(
      { key: "systems", label: "Systems", href: "/workspace/it/systems", icon: "Server", group: "ALOS_PLATFORM", available: true },
      { key: "integrations", label: "Integrations", href: "/workspace/it/integrations", icon: "Cable", group: "ALOS_PLATFORM", available: false },
      { key: "database", label: "Database", href: "/workspace/it/database", icon: "Database", group: "ALOS_PLATFORM", available: false },
      { key: "environments", label: "Environments", href: "/workspace/it/environments", icon: "Boxes", group: "ALOS_PLATFORM", available: false },
    );

    // Group: ENGINEERING
    items.push(
      { key: "repositories", label: "Repositories", href: "/workspace/it/repositories", icon: "GitBranch", group: "ENGINEERING", available: false },
      { key: "cicd", label: "CI/CD", href: "/workspace/it/cicd", icon: "Workflow", group: "ENGINEERING", available: false },
      { key: "releases", label: "Releases", href: "/workspace/it/releases", icon: "Rocket", group: "ENGINEERING", available: false },
      { key: "tech-debt", label: "Technical Debt", href: "/workspace/it/tech-debt", icon: "Wrench", group: "ENGINEERING", available: false },
    );

    // Group: OPERATIONS
    items.push(
      { key: "monitoring", label: "Monitoring", href: "/workspace/it/monitoring", icon: "Activity", group: "OPERATIONS", available: true },
      { key: "incidents", label: "Incidents", href: "/workspace/it/incidents", icon: "Siren", group: "OPERATIONS", available: false },
      { key: "security", label: "Security", href: "/workspace/it/security", icon: "ShieldCheck", group: "OPERATIONS", available: false },
      { key: "backup", label: "Backup & DR", href: "/workspace/it/backup", icon: "DatabaseBackup", group: "OPERATIONS", available: false },
    );

    // Group: GENESIS (reusing existing canonical control plane routes!)
    items.push(
      { key: "control-plane", label: "Control Plane", href: "/genesis", icon: "Bot", group: "GENESIS", available: true },
      { key: "agents", label: "Agents", href: WORKSPACE_ROUTES.agents, icon: "Bot", group: "GENESIS", available: true },
      { key: "skills", label: "Skills", href: "/workspace/it/skills", icon: "Blocks", group: "GENESIS", available: false },
      { key: "research", label: "Research", href: "/research", icon: "SearchCheck", group: "GENESIS", available: true },
      { key: "models", label: "Models & Tools", href: "/workspace/it/models", icon: "BrainCircuit", group: "GENESIS", available: false },
    );

    // Group: GOVERNANCE
    items.push(
      { key: "evidence", label: "Evidence", href: "/governance", icon: "Fingerprint", group: "GOVERNANCE", available: true },
      { key: "uat", label: "UAT & Gates", href: "/workspace/it/uat", icon: "FlaskConical", group: "GOVERNANCE", available: false },
      { key: "decisions", label: "Decisions", href: WORKSPACE_ROUTES.approvals, icon: "BadgeCheck", group: "GOVERNANCE", available: true },
    );

    // Group: AI
    items.push(
      { key: "ara", label: "ARA", href: WORKSPACE_ROUTES.ara, icon: "Sparkles", group: "AI", available: true },
    );

    return items.map(buildNavItem);
  }

  // Legal & Compliance Workspace specific IA
  if (isLegal) {
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
      { key: "tasks", label: "Tasks", href: WORKSPACE_ROUTES.tasks, icon: "ListChecks", group: "PEKERJAAN", available: true },
      { key: "approvals", label: "Approvals", href: WORKSPACE_ROUTES.approvals, icon: "Scale", group: "PEKERJAAN", available: true },
      { key: "documents", label: "Documents", href: WORKSPACE_ROUTES.documents, icon: "Files", group: "PEKERJAAN", available: true },
      { key: "reports", label: "Reports", href: WORKSPACE_ROUTES.reports, icon: "ChartColumn", group: "PEKERJAAN", available: true },
    );

    // Group: AI
    items.push(
      { key: "ara", label: "ARA", href: WORKSPACE_ROUTES.ara, icon: "Sparkles", group: "AI", available: true },
      { key: "agents", label: "Agent workforce", href: WORKSPACE_ROUTES.agents, icon: "Bot", group: "AI", available: true },
    );

    return items.map(buildNavItem);
  }

  // HR & People Workspace specific IA
  if (isHr) {
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
      { key: "tasks", label: "Tasks", href: WORKSPACE_ROUTES.tasks, icon: "ListChecks", group: "PEKERJAAN", available: true },
      { key: "approvals", label: "Approvals", href: WORKSPACE_ROUTES.approvals, icon: "BadgeCheck", group: "PEKERJAAN", available: true },
      { key: "documents", label: "Documents", href: WORKSPACE_ROUTES.documents, icon: "Files", group: "PEKERJAAN", available: true },
      { key: "reports", label: "Reports", href: WORKSPACE_ROUTES.reports, icon: "ChartColumn", group: "PEKERJAAN", available: true },
    );

    // Group: AI
    items.push(
      { key: "ara", label: "ARA", href: WORKSPACE_ROUTES.ara, icon: "Sparkles", group: "AI", available: true },
      { key: "agents", label: "Agent workforce", href: WORKSPACE_ROUTES.agents, icon: "Bot", group: "AI", available: true },
    );

    return items.map(buildNavItem);
  }

  // Sales & Marketing Workspace specific IA
  if (isSales) {
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
      { key: "tasks", label: "Tasks", href: WORKSPACE_ROUTES.tasks, icon: "ListChecks", group: "PEKERJAAN", available: true },
      { key: "approvals", label: "Approvals", href: WORKSPACE_ROUTES.approvals, icon: "BadgeCheck", group: "PEKERJAAN", available: true },
      { key: "documents", label: "Documents", href: WORKSPACE_ROUTES.documents, icon: "Files", group: "PEKERJAAN", available: true },
      { key: "reports", label: "Reports", href: WORKSPACE_ROUTES.reports, icon: "ChartColumn", group: "PEKERJAAN", available: true },
    );

    // Group: AI
    items.push(
      { key: "ara", label: "ARA", href: WORKSPACE_ROUTES.ara, icon: "Sparkles", group: "AI", available: true },
      { key: "agents", label: "Agent workforce", href: WORKSPACE_ROUTES.agents, icon: "Bot", group: "AI", available: true },
    );

    return items.map(buildNavItem);
  }

  // Property Workspace specific IA
  if (isProperty) {
    // Group: PROJECT
    items.push(
      { key: "projects", label: "Projects", href: WORKSPACE_ROUTES.projects, icon: "BriefcaseBusiness", group: "PROJECT", available: true },
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
      { key: "tasks", label: "Tasks", href: WORKSPACE_ROUTES.tasks, icon: "ListChecks", group: "PEKERJAAN", available: true },
      { key: "approvals", label: "Approvals", href: WORKSPACE_ROUTES.approvals, icon: "BadgeCheck", group: "PEKERJAAN", available: true },
      { key: "documents", label: "Documents", href: WORKSPACE_ROUTES.documents, icon: "Files", group: "PEKERJAAN", available: true },
      { key: "reports", label: "Reports", href: WORKSPACE_ROUTES.reports, icon: "ChartColumn", group: "PEKERJAAN", available: true },
    );

    // Group: AI
    items.push(
      { key: "ara", label: "ARA", href: WORKSPACE_ROUTES.ara, icon: "Sparkles", group: "AI", available: true },
      { key: "agents", label: "Agent workforce", href: WORKSPACE_ROUTES.agents, icon: "Bot", group: "AI", available: true },
    );

    return items.map(buildNavItem);
  }

  // Group 2: DIVISI / KEUANGAN (Workspace-specific)
  if (isFinance) {
    items.push(
      { key: "cash", label: "Cash & Bank", href: "/workspace/finance/cash", icon: "Landmark", group: "KEUANGAN", available: false },
      { key: "receivables", label: "Receivables", href: "/workspace/finance/receivables", icon: "CircleDollarSign", group: "KEUANGAN", available: false },
      { key: "payables", label: "Payables", href: "/workspace/finance/payables", icon: "ReceiptText", group: "KEUANGAN", available: false },
      { key: "budget", label: "Budget", href: "/workspace/finance/budget", icon: "ChartNoAxesCombined", group: "KEUANGAN", available: false },
      { key: "reconciliation", label: "Reconciliation", href: "/workspace/finance/reconciliation", icon: "RefreshCcw", group: "KEUANGAN", available: false },
      { key: "tax", label: "Tax", href: "/workspace/finance/tax", icon: "FileCheck2", group: "COMPLIANCE", available: false },
      { key: "close", label: "Month Close", href: "/workspace/finance/close", icon: "CalendarCheck2", group: "COMPLIANCE", available: false },
    );
  } else if (division === "HR") {
    items.push(
      { key: "employees", label: "Karyawan", href: "/workspace/hr/employees", icon: "UserRound", group: "DIVISION", available: false },
      { key: "attendance", label: "Kehadiran", href: "/workspace/hr/attendance", icon: "ListChecks", group: "DIVISION", available: false },
      { key: "leave", label: "Cuti", href: "/workspace/hr/leave", icon: "BadgeCheck", group: "DIVISION", available: false },
      { key: "recruitment", label: "Rekrutmen", href: "/workspace/hr/recruitment", icon: "BriefcaseBusiness", group: "DIVISION", available: false },
    );
  } else if (division === "LEGAL") {
    items.push(
      { key: "permits", label: "Perizinan", href: "/workspace/legal/permits", icon: "Files", group: "DIVISION", available: false },
      { key: "contracts", label: "Kontrak", href: "/workspace/legal/contracts", icon: "Files", group: "DIVISION", available: false },
      { key: "compliance", label: "Kepatuhan", href: "/workspace/legal/compliance", icon: "ShieldCheck", group: "DIVISION", available: false },
    );
  } else if (division === "PROPERTY") {
    items.push(
      { key: "land-pipeline", label: "Pipeline Lahan", href: "/workspace/property/land", icon: "Building2", group: "DIVISION", available: false },
      { key: "construction", label: "Konstruksi", href: "/workspace/property/construction", icon: "BriefcaseBusiness", group: "DIVISION", available: false },
    );
  } else if (division === "SALES_MARKETING" || division === "SALES") {
    items.push(
      { key: "crm", label: "Leads & CRM", href: "/workspace/sales/crm", icon: "CircleDollarSign", group: "DIVISION", available: false },
      { key: "inventory", label: "Inventory Unit", href: "/workspace/sales/inventory", icon: "Building2", group: "DIVISION", available: false },
    );
  } else if (division === "IT") {
    items.push(
      { key: "systems", label: "Sistem & Integrasi", href: "/workspace/it/systems", icon: "BriefcaseBusiness", group: "DIVISION", available: false },
      { key: "monitoring", label: "Rilis & Monitoring", href: "/workspace/it/monitoring", icon: "ChartColumn", group: "DIVISION", available: false },
    );
  }

  // Group 3: PEKERJAAN (Cross-functional work modules)
  items.push(
    { key: "projects", label: "Proyek", href: WORKSPACE_ROUTES.projects, icon: "BriefcaseBusiness", group: "PEKERJAAN", available: true },
    { key: "tasks", label: "Tugas", href: WORKSPACE_ROUTES.tasks, icon: "ListChecks", group: "PEKERJAAN", available: true },
    { key: "approvals", label: "Approval", href: WORKSPACE_ROUTES.approvals, icon: "BadgeCheck", group: "PEKERJAAN", available: true },
    { key: "documents", label: "Dokumen", href: WORKSPACE_ROUTES.documents, icon: "Files", group: "PEKERJAAN", available: true },
    { key: "reports", label: "Laporan", href: WORKSPACE_ROUTES.reports, icon: "ChartColumn", group: "PEKERJAAN", available: true },
    { key: "findings", label: "Temuan", href: WORKSPACE_ROUTES.findings, icon: "TriangleAlert", group: "PEKERJAAN", available: true },
  );

  // Group 4: AI
  items.push({
    key: "ara",
    label: "ARA",
    href: WORKSPACE_ROUTES.ara,
    icon: "Sparkles",
    group: "AI",
    available: true,
  });

  if (canSeeAgents(roles)) {
    items.push({
      key: "agents",
      label: "Agent Workforce",
      href: WORKSPACE_ROUTES.agents,
      icon: "Bot",
      group: "AI",
      available: true,
    });
  }

  // Group 5: CONTROL / GOVERNANCE
  if (isGovernanceNavigationVisible(roles)) {
    items.push({
      key: "governance",
      label: "Governance & Agent Control",
      href: "/genesis",
      icon: "ShieldCheck",
      group: "CONTROL",
      available: true,
    });
  }

  return items.map(buildNavItem);
}
