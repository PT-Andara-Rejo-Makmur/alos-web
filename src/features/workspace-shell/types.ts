import type { ReactNode } from "react";
import type { SessionActor } from "@/features/session";

export type WorkspaceIconKey =
  | "LayoutDashboard"
  | "Landmark"
  | "CircleDollarSign"
  | "ReceiptText"
  | "ChartNoAxesCombined"
  | "BriefcaseBusiness"
  | "ListChecks"
  | "BadgeCheck"
  | "Files"
  | "ChartColumn"
  | "TriangleAlert"
  | "Sparkles"
  | "Bot"
  | "ShieldCheck"
  | "ChevronsUpDown"
  | "Building2"
  | "Bell"
  | "Settings"
  | "LogOut"
  | "Menu"
  | "X"
  | "UserRound"
  | "ChevronDown"
  | "ArrowRight"
  | "Newspaper"
  | "FolderKanban"
  | "Gauge"
  | "ClockAlert"
  | "Activity"
  | "Fingerprint"
  | "ScrollText"
  | "RefreshCcw"
  | "FileCheck2"
  | "CalendarCheck2"
  | "Milestone"
  | "HardHat"
  | "ClipboardCheck"
  | "FilePenLine"
  | "KeyRound"
  | "UserRoundPlus"
  | "Funnel"
  | "MapPinCheck"
  | "Megaphone"
  | "RadioTower"
  | "GitBranch"
  | "PhoneCall"
  | "MessageSquareWarning"
  | "UsersRound"
  | "CalendarDays"
  | "UserRoundSearch"
  | "UserPlus"
  | "GraduationCap"
  | "Network"
  | "FileSignature"
  | "FolderLock"
  | "MapPinned"
  | "SearchCheck"
  | "Briefcase"
  | "CalendarClock"
  | "Scale"
  | "Server"
  | "Cable"
  | "Database"
  | "Boxes"
  | "Workflow"
  | "Rocket"
  | "Wrench"
  | "Siren"
  | "DatabaseBackup"
  | "RotateCcw"
  | "Blocks"
  | "BrainCircuit"
  | "Play"
  | "FlaskConical";

export type WorkspaceNavGroup =
  | "UTAMA"
  | "COMMAND_CENTER"
  | "PROJECT"
  | "SALES"
  | "MARKETING"
  | "CUSTOMER"
  | "PEOPLE"
  | "DEVELOPMENT"
  | "EMPLOYEE_RELATIONS"
  | "KEUANGAN"
  | "LEGAL"
  | "COMPLIANCE"
  | "ALOS_PLATFORM"
  | "IDENTITY_ACCESS"
  | "ENGINEERING"
  | "OPERATIONS"
  | "GENESIS"
  | "GOVERNANCE"
  | "ORGANIZATION"
  | "DECISIONS"
  | "INFORMATION"
  | "DIVISION"
  | "PEKERJAAN"
  | "WORK"
  | "AI"
  | "CONTROL"
  | "SYSTEM";

export type {
  ActiveWorkspaceContext,
  WorkspaceNavAvailability,
  WorkspaceNavBlockReason,
  WorkspaceNavVisibility,
} from "@/features/workspace-routing";

import type {
  WorkspaceNavAvailability,
  WorkspaceNavBlockReason,
  WorkspaceNavVisibility,
} from "@/features/workspace-routing";

export type WorkspaceNavItem = {
  readonly key: string;
  readonly label: string;
  readonly href: string | null;
  readonly icon: WorkspaceIconKey;
  readonly group: WorkspaceNavGroup;
  readonly badge?: number;

  // Navigability vs Operational Readiness
  readonly navigable?: boolean;

  // 2-Dimensional Navigation
  readonly visibility?: WorkspaceNavVisibility;
  readonly availability?: WorkspaceNavAvailability;
  readonly blockReason?: WorkspaceNavBlockReason;
  readonly requiredCapabilities?: readonly string[];

  // Compatibility flags
  readonly available?: boolean;
  readonly requiredRole?: readonly string[];
  readonly requiredCapability?: string;
};

export type WorkspaceShellIdentity = {
  readonly workspaceId: string;
  readonly workspaceKey: string;
  readonly workspaceLabel: string;
  readonly divisionCode: string | null;
  readonly roleLabel: string;
  readonly accessLevel?: string | null;
};

export type WorkspaceProjectContext = {
  readonly projectId: string;
  readonly projectCode: string;
  readonly projectName: string;
};

export type WorkspaceBreadcrumbItem = {
  readonly label: string;
  readonly href?: string;
};

export type WorkspaceShellContextValue = {
  readonly identity: WorkspaceShellIdentity;
  readonly actor: SessionActor | null;
  readonly activeProject: WorkspaceProjectContext | null;
  readonly availableProjects: readonly WorkspaceProjectContext[];
  readonly onSelectProject?: (projectId: string) => void;
  readonly activeNavKey: string;
};

export type WorkspaceShellProps = {
  readonly identity: WorkspaceShellIdentity;
  readonly actor?: SessionActor | null;
  readonly availableWorkspaceCount?: number;
  readonly navigation?: readonly WorkspaceNavItem[];
  readonly activeNavKey?: string;
  readonly breadcrumb?: readonly WorkspaceBreadcrumbItem[];
  readonly activeProject?: WorkspaceProjectContext | null;
  readonly availableProjects?: readonly WorkspaceProjectContext[];
  readonly onSelectProject?: (projectId: string) => void;
  readonly onLogout?: () => Promise<void> | void;
  readonly children: ReactNode;
};
