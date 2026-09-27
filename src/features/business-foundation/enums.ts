/** Frontend presentation enums only; not canonical Backend contracts or authority state. */
export const LIFECYCLE_STATES = ["DRAFT", "UNDER_REVIEW", "APPROVED", "ACTIVE", "SUPERSEDED", "ARCHIVED"] as const;
export type LifecycleState = (typeof LIFECYCLE_STATES)[number];

export const PERFORMANCE_STATES = ["NOT_EVALUATED", "ON_TRACK", "AT_RISK", "OFF_TRACK", "ACHIEVED"] as const;
export type PerformanceState = (typeof PERFORMANCE_STATES)[number];

export const REVISION_STATES = ["PROPOSED", "UNDER_REVIEW", "APPROVED", "REJECTED", "SUPERSEDED"] as const;
export type RevisionState = (typeof REVISION_STATES)[number];

export const VERIFICATION_STATES = ["UNVERIFIED", "PENDING_VERIFICATION", "VERIFIED", "CONFLICT", "REJECTED"] as const;
export type VerificationState = (typeof VERIFICATION_STATES)[number];

export const DATA_READINESS_STATES = ["NOT_CONNECTED", "LOADING", "PARTIAL", "LIVE", "STALE", "ERROR"] as const;
export type DataReadinessState = (typeof DATA_READINESS_STATES)[number];

export const MEASUREMENT_TYPES = ["HIGHER_IS_BETTER", "LOWER_IS_BETTER", "RANGE", "EXACT", "PERCENTAGE", "RATIO", "BINARY", "MILESTONE", "CUMULATIVE"] as const;
export type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

export const BUSINESS_UNITS = ["IDR", "COUNT", "PERCENT", "RATIO", "MINUTE", "HOUR", "DAY", "SCORE", "UNIT", "BOOLEAN"] as const;
export type BusinessUnit = (typeof BUSINESS_UNITS)[number];

export const PERIOD_GRANULARITIES = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "ANNUAL", "CUSTOM"] as const;
export type PeriodGranularity = (typeof PERIOD_GRANULARITIES)[number];

export const BUSINESS_SCOPE_TYPES = ["COMPANY", "DIVISION", "PROJECT", "PROPERTY_UNIT", "CHANNEL", "CAMPAIGN", "TEAM", "ROLE", "PROCESS", "SYSTEM"] as const;
export type BusinessScopeType = (typeof BUSINESS_SCOPE_TYPES)[number];

export type MetricValueKind = "TARGET" | "ACTUAL" | "FORECAST" | "ASSUMPTION";
export type CadenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY";
