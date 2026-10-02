import { vi } from "vitest";
import { araApi } from "@/features/ara/api";
import { sessionApiRequest } from "@/lib/api";
import type { SessionProjection } from "@/features/session";

/** Backend fixture for portability tests; feature tests use explicit authority snapshots. */
export function mockAraBackend() {
  vi.spyOn(araApi, "authority").mockImplementation(async () => {
    const session = await sessionApiRequest<SessionProjection>("/");
    const principal = session.principal;
    if (!principal || !("actor" in principal) || !principal.active_workspace) throw new Error("Unauthenticated");
    return { tenant_id: principal.actor.tenant_id, organization_id: principal.actor.organization_id,
      workspace_id: principal.active_workspace.workspace.workspace_id, actor_id: principal.actor.actor_id,
      status: "ACTIVE", maximum_data_classification: "INTERNAL", scope_refs: principal.active_workspace.scope_refs,
      allowed_tool_ids: [], allowed_capability_ids: ["business.question_answering"],
      execution_budget: { max_tokens: 12000, max_steps: 16 }, runtime_mode: "DETERMINISTIC_TEST",
      production_provider_connected: false };
  });
  vi.spyOn(araApi, "threads").mockResolvedValue([]);
}
