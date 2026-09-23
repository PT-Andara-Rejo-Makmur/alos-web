export type HrSourceReadinessKey =
  | "EMPLOYEES"
  | "ATTENDANCE"
  | "TRAINING"
  | "CONTRACTS"
  | "PERFORMANCE"
  | "GRIEVANCE"
  | "PERSONNEL_FILES";

export type HrSourceState = "LIVE" | "PARTIAL" | "NOT_CONNECTED";

export interface HrSourceReadinessItem {
  readonly key: HrSourceReadinessKey;
  readonly label: string;
  readonly state: HrSourceState;
}

export interface HrMetricItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly helper: string;
  readonly state: HrSourceState;
}

export interface HrAttendanceCapacityItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface HrDevelopmentItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface HrEmployeeRelationsItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface HrCadenceItem {
  readonly frequency: "Harian" | "Mingguan" | "Bulanan";
  readonly controlId: string;
  readonly controlName: string;
  readonly workEvidence: string;
  readonly readinessStatus: HrSourceState;
}

export interface HrAgentSupportItem {
  readonly agentId: string;
  readonly roleName: string;
  readonly taskDescription: string;
  readonly status: "Target capability" | "Active";
}

export interface HrDashboardSnapshot {
  readonly readiness: readonly HrSourceReadinessItem[];
  readonly metrics: readonly HrMetricItem[];
  readonly attendanceCapacity: readonly HrAttendanceCapacityItem[];
  readonly development: readonly HrDevelopmentItem[];
  readonly employeeRelations: readonly HrEmployeeRelationsItem[];
  readonly cadence: readonly HrCadenceItem[];
  readonly agents: readonly HrAgentSupportItem[];
}
