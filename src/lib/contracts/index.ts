/** Public facade for generated alos-contracts TypeScript exports. */
export const CONTRACT_SOURCE = "alos-contracts/generated/typescript" as const;

/**
 * Narrow bootstrap projection of IntegrationDiagnostic. Replace this declaration
 * with the generated export when alos-contracts is published as a package.
 */
export interface IntegrationDiagnostic {
  readonly correlation_id: string;
  readonly status: "connected";
  readonly backend: {
    readonly service: "alos-backend";
    readonly status: "reachable";
    readonly authority: "ALOS_BACKEND";
  };
  readonly genesis: {
    readonly service: "genesis-ai";
    readonly status: "reachable";
    readonly role: "AI_CONTROL_PLANE";
    readonly authoritative_business_state: false;
    readonly provider_required: false;
    readonly correlation_id: string;
  };
}
