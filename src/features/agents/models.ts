/** Backend-owned registry summary projected for IT; this is not a canonical definition. */
export interface AgentCapabilitySummary {
  readonly identifier: string;
  readonly kind: "AGENT" | "CAPABILITY";
  readonly purpose: string;
  readonly capabilityType: string;
  readonly version: string;
  readonly scope: readonly string[];
  readonly risk: string;
  readonly tools: readonly string[];
  readonly lifecycleState: string;
  readonly readiness: string;
}
