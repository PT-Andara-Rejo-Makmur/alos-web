import { describe, expect, it } from "vitest";

import {
  agentCrudPolicy,
  agentStateActions,
  canEditAgentRegistry,
  draftPayloadFromForm,
  eligibleParents,
  emptyAgentDraftForm,
  emptyAgentRunForm,
  registryConflictMessage,
  runPayloadFromForm,
  runtimeBlockedMessage,
  type AgentRecord,
} from "@/features/agents/registry";

const agents: AgentRecord[] = [
  {
    agent_contract_id: "root-id",
    agent_key: "PROPERTY_ROOT",
    name: "Property Root",
    workspace_id: "workspace-1",
    parent_agent_key: null,
    agent_level: 0,
    risk_level: "LOW",
    versions: [],
  },
  {
    agent_contract_id: "leaf-id",
    agent_key: "PROPERTY_LEAF",
    name: "Property Leaf",
    workspace_id: "workspace-1",
    parent_agent_key: "PROPERTY_ROOT",
    agent_level: 2,
    risk_level: "LOW",
    versions: [],
  },
];

describe("Agent Registry Builder helpers", () => {
  it("grants the Registry only to IT Lead", () => {
    expect(canEditAgentRegistry(["IT_LEAD"])).toBe(true);
    expect(canEditAgentRegistry(["DIRECTOR"])).toBe(false);
    expect(canEditAgentRegistry(["DIVISION_OWNER", "QA_SECURITY"])).toBe(false);
  });

  it("renders only safe, actionable registry conflict messages", () => {
    expect(registryConflictMessage("agent key already exists in this organization")).toContain("sudah dipakai");
    expect(registryConflictMessage("unexpected server detail")).toBe(
      "Perubahan ditolak: agent key, parent, atau level hierarchy tidak valid.",
    );
  });

  it("renders a runtime budget block without conflating it with an Agent conflict", () => {
    expect(runtimeBlockedMessage("daily request budget cap reached")).toBe(
      "Limit request harian workspace telah tercapai.",
    );
    expect(runtimeBlockedMessage("unexpected runtime detail")).toContain("kontrol runtime");
  });

  it("excludes itself and level-two Agents from parent options", () => {
    expect(eligibleParents(agents, "PROPERTY_ROOT").map((agent) => agent.agent_key)).toEqual([]);
    expect(eligibleParents(agents).map((agent) => agent.agent_key)).toEqual(["PROPERTY_ROOT"]);
  });

  it("builds a bounded payload without exposing a provider model or credential", () => {
    const form = {
      ...emptyAgentDraftForm(),
      agentKey: "PROPERTY_DAILY_BRIEF",
      name: "Property Daily Brief",
      objective: "Create a read-only operational property brief based on registered internal sources.",
      toolKeys: "SOURCE_REGISTRY_SEARCH, SOURCE_READ_INTERNAL",
      permissionKeys: "SOURCE_READ_INTERNAL",
    };

    expect(draftPayloadFromForm(form, "workspace-1")).toMatchObject({
      workspace_id: "workspace-1",
      agent_key: "PROPERTY_DAILY_BRIEF",
      model_policy: { model_route: "light", usage: "controlled_draft" },
      tool_keys: ["SOURCE_REGISTRY_SEARCH", "SOURCE_READ_INTERNAL"],
    });
  });

  it("blocks a high-risk draft if human approval is disabled", () => {
    expect(() => draftPayloadFromForm({
      ...emptyAgentDraftForm(),
      agentKey: "RISK_CHECK",
      name: "Risk Check",
      objective: "Provide a sufficiently detailed objective for controlled risk validation.",
      riskLevel: "HIGH",
      approvalRequired: false,
    }, "workspace-1")).toThrow("wajib memerlukan persetujuan manusia");
  });

  it("builds a fixture-only run payload without a model, secret, or prompt", () => {
    expect(runPayloadFromForm({
      ...emptyAgentRunForm(),
      input: '{"query":"property opportunity"}',
      requestedToolKeys: "FIXTURE_SOURCE_READ, SOURCE_REGISTRY_SEARCH",
    }, "workspace-1")).toEqual({
      workspace_id: "workspace-1",
      input: { query: "property opportunity" },
      requested_tool_keys: ["FIXTURE_SOURCE_READ", "SOURCE_REGISTRY_SEARCH"],
    });
  });

  it("enforces the lifecycle-safe CRUD and action matrix", () => {
    expect(agentCrudPolicy("DRAFT")).toMatchObject({ update: true, delete: true, createNewVersion: false });
    expect(agentCrudPolicy("ACTIVE")).toMatchObject({ update: false, delete: false, createNewVersion: true });
    expect(agentStateActions("ACTIVE")).toEqual(expect.arrayContaining(["VIEW_RUNTIME", "KILL_SWITCH", "CREATE_NEW_VERSION"]));
    expect(agentStateActions("APPROVED")).toEqual(["RELEASE"]);
  });
});
