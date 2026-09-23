export const AGENTS_FEATURE_BOUNDARY = "Agent registry and run projections from Backend" as const;

export type { AgentCapabilitySummary } from "./models";
export { AgentCapabilitySummaryCard, AgentCapabilitySummaryList } from "./summary";
export * from "./registry";
