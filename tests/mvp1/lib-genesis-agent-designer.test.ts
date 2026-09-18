import { describe, expect, it } from "vitest";

import { agentDraftPresentation, type GenesisAgentDesignResponse } from "@/features/mvp1/lib/genesis-agent-designer";

describe("GENESIS Agent Designer API contract", () => {
  it("uses the backend's flat AgentDraftResult and string activation readiness", () => {
    const result: GenesisAgentDesignResponse = {
      proposed_design: { agent_key: "PROPERTY_OVERDUE_MONITOR", name: "Property overdue monitor", objective: "Read overdue tasks." },
      normalized_risk_level: "LOW",
      bound_tool_keys: ["task.list"],
      missing_dependencies: [],
      activation_readiness: "READY_FOR_TESTING",
      draft: { agent_key: "PROPERTY_OVERDUE_MONITOR", semantic_version: "0.1.0", lifecycle_status: "DRAFT", correlation_id: "00000000-0000-0000-0000-000000000001" },
      release_request: { change_request_id: "00000000-0000-0000-0000-000000000002", state: "DRAFT" },
      generated_tests: [{ test_key: "PROPERTY_OVERDUE_MONITOR_POSITIVE", category: "POSITIVE" }],
    };

    expect(agentDraftPresentation(result)).toContain("PROPERTY_OVERDUE_MONITOR · v0.1.0 · DRAFT");
  });
});


