import { describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import {
  backendFactoryAdapter,
  projectFactoryResponse,
} from "@/features/factory";

describe("Factory contract UX and adapter", () => {
  it("mengirim requirement melalui typed Backend adapter", async () => {
    const apiSpy = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce({
      correlation_id: "corr_factory_001",
      decision: "REUSE",
      reason: "Matched",
      existing_capability_refs: [
        {
          capability_id: "report.generate",
          version: "1.0.0",
          name: "Generate report",
          capability_type: "REPORT",
          purpose: "Generate a governed report.",
        },
      ],
      capability_draft: null,
      agent_draft: null,
      registry_result: null,
    });

    const result = await backendFactoryAdapter.analyze({
      requirement: "Buat laporan operasional yang dapat direview oleh manajemen",
    });

    expect(apiSpy).toHaveBeenCalledWith(
      "/api/v1/genesis/factory/analyze",
      expect.objectContaining({
        method: "POST",
        body: { requirement: "Buat laporan operasional yang dapat direview oleh manajemen" },
      }),
    );
    expect(result.decision).toBe("REUSE");
  });

  it("memproyeksikan canonical Backend CREATE response tanpa contract lama", () => {
    const result = projectFactoryResponse({
      correlation_id: "corr_factory_create_002",
      decision: "CREATE",
      reason: "No authorized matching capability exists.",
      existing_capability_refs: [],
      capability_draft: {
        tenant_id: "tenant_default",
        organization_id: "org_default",
        workspace_id: "workspace_operations",
        correlation_id: "corr_factory_create_002",
        capability_id: "capability_weekly_report",
        version: "0.1.0",
        name: "Weekly report",
        purpose: "Prepare an evidence-backed weekly operational report.",
        owner: "actor_requester",
        capability_type: "REPORT",
        output_state: "DRAFT",
        lifecycle_state: "DRAFT",
        scope_refs: ["scope.workspace.operations"],
        tool_ids: ["report.render"],
        permission_refs: ["reports.create"],
        prohibited_actions: ["Do not approve or release the proposal."],
        risk_level: "LOW",
        evidence_requirements: ["Cite authorized operational records."],
        test_requirements: ["Validate the report against a fixture."],
      },
      agent_draft: null,
      registry_result: {
        state: "DRAFT",
        registered_refs: [
          {
            subject_type: "CAPABILITY",
            identifier: "capability_weekly_report",
            version: "0.1.0",
            state: "DRAFT",
          },
        ],
      },
    });

    expect(result).toMatchObject({
      decision: "CREATE",
      correlationId: "corr_factory_create_002",
      registryState: "DRAFT",
      draft: {
        identifier: "capability_weekly_report",
        lifecycleState: "DRAFT",
        readiness: "REGISTERED_AS_DRAFT",
      },
    });
  });

  it("menolak response Factory lama yang bukan canonical public response", () => {
    expect(() =>
      projectFactoryResponse({
        correlation_id: "corr_factory_legacy_001",
        resolution: { decision: "CREATE", reason: "Legacy response" },
        existing_capability_refs: [],
        capability_draft: null,
        capability_specification: { lifecycle_state: "DRAFT" },
      }),
    ).toThrow(/decision/);
  });
});
