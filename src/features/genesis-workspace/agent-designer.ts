export type GenesisAgentDesignResponse = {
  proposed_design: {
    agent_key: string;
    name: string;
    objective: string;
    capability_keys?: string[];
  };
  normalized_risk_level: string;
  bound_tool_keys: string[];
  proposed_permission_keys?: string[];
  missing_dependencies: string[];
  activation_readiness: "READY_FOR_TESTING" | "NEEDS_CONFIGURATION";
  draft: {
    agent_key: string;
    semantic_version: string;
    lifecycle_status: "DRAFT" | "RETIRED";
    correlation_id: string;
  };
  release_request: { change_request_id: string; state: string };
  generated_tests: Array<{ test_key: string; category: string }>;
};

export function agentDraftPresentation(result: GenesisAgentDesignResponse): string {
  const readiness = result.activation_readiness === "NEEDS_CONFIGURATION"
    ? "NEEDS_CONFIGURATION"
    : "Siap untuk testing";
  return `${result.draft.agent_key} · v${result.draft.semantic_version} · ${result.draft.lifecycle_status} · ${readiness}`;
}
