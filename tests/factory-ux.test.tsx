import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  FactoryResultPanel,
  FactoryWorkspace,
  projectFactoryResponse,
} from "@/features/factory";
import type { FactoryAnalysisProjection } from "@/features/factory";

afterEach(cleanup);

const reuseResult: FactoryAnalysisProjection = {
  decision: "REUSE",
  reason: "Backend catalog already satisfies this requirement.",
  correlationId: "corr_factory_reuse_001",
  existingCapabilities: [
    {
      capabilityId: "report.generate",
      version: "1.0.0",
      name: "Generate report",
      capabilityType: "REPORT",
      purpose: "Generate a governed report.",
    },
  ],
  draft: null,
  registryState: null,
};

const createResult: FactoryAnalysisProjection = {
  decision: "CREATE",
  reason: "A new capability proposal is required.",
  correlationId: "corr_factory_create_001",
  existingCapabilities: [],
  draft: {
    identifier: "capability_factory_001",
    version: "0.1.0",
    purpose: "Prepare a governed operational report.",
    capabilityType: "REPORT",
    scope: ["scope.workspace"],
    risk: "MEDIUM",
    tools: ["report.generate"],
    permissions: ["reports.create"],
    lifecycleState: "DRAFT",
    readiness: "REGISTERED_AS_DRAFT",
  },
  registryState: "DRAFT",
};

describe("Factory contract UX", () => {
  it("merender REUSE sebagai existing Backend capability tanpa draft", () => {
    render(<FactoryResultPanel result={reuseResult} />);

    expect(screen.getByText("Keputusan REUSE")).toBeInTheDocument();
    expect(screen.getByText("Generate report")).toBeInTheDocument();
    expect(screen.queryByText("Capability proposal")).not.toBeInTheDocument();
  });

  it("merender CREATE sebagai proposal DRAFT", () => {
    render(<FactoryResultPanel result={createResult} />);

    expect(screen.getByText("Keputusan CREATE")).toBeInTheDocument();
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
    expect(screen.getByText("capability_factory_001")).toBeInTheDocument();
    expect(screen.getByText("reports.create")).toBeInTheDocument();
  });

  it("mengirim requirement melalui typed Backend adapter", async () => {
    const analyze = vi.fn().mockResolvedValue(reuseResult);
    render(<FactoryWorkspace adapter={{ analyze }} />);

    fireEvent.change(screen.getByLabelText("Business requirement"), {
      target: { value: "Buat laporan operasional yang dapat direview oleh manajemen" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analisis melalui Backend" }));

    await waitFor(() => expect(analyze).toHaveBeenCalledWith({
      requirement: "Buat laporan operasional yang dapat direview oleh manajemen",
    }));
    expect(await screen.findByText("Keputusan REUSE")).toBeInTheDocument();
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
    expect(() => projectFactoryResponse({
      correlation_id: "corr_factory_legacy_001",
      resolution: { decision: "CREATE", reason: "Legacy response" },
      existing_capability_refs: [],
      capability_draft: null,
      capability_specification: { lifecycle_state: "DRAFT" },
    })).toThrow(/decision/);
  });
});
