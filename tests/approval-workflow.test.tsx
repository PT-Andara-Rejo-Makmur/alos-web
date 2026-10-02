import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApprovalDetailView } from "@/features/shared-work/approvals/approval-detail-view";
import { ApprovalCreateDialog } from "@/features/shared-work/approvals/approval-create-dialog";
import { approvalFromProjection, createApproval, decideApproval, fetchApprovals } from "@/features/shared-work/approvals/approval-model";
import type { SessionProjection } from "@/features/session";
import type { SharedWorkApprovalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const projection: SharedWorkApprovalProjection = {
  approval_id: "approval_1",
  tenant_id: "tenant_1",
  organization_id: "org_1",
  workspace_ids: ["workspace_1"],
  subject_type: "PROJECT",
  subject_id: "project_1",
  requested_by: "actor_requester",
  approver_actor_id: null,
  status: "PENDING",
  decision: null,
  reason: "Business reason",
  decision_reason: null,
  requested_at: "2026-09-30T00:00:00Z",
  decided_at: null,
};

function session(actorId: string, permissions: string[]): SessionProjection {
  return {
    authenticated: true,
    principal: {
      actor: { actor_id: actorId },
      active_workspace: { permission_refs: permissions },
    },
  } as unknown as SessionProjection;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("canonical approval workflow", () => {
  it("does not offer material review when backend decision authority is absent", () => {
    const material = approvalFromProjection({ ...projection, subject_type: "SALES_BOOKING", requested_action: "CONFIRM_BOOKING", allowed_decisions: [] });
    render(<ApprovalDetailView approval={material} session={session("actor_reviewer", ["approval.approve"])} />);
    expect(screen.queryByRole("button", { name: "Setujui" })).not.toBeInTheDocument();
  });

  it("offers only the material decisions projected by the owner backend", () => {
    const material = approvalFromProjection({ ...projection, subject_type: "SALES_BOOKING", requested_action: "CONFIRM_BOOKING", allowed_decisions: ["RETURNED"] });
    render(<ApprovalDetailView approval={material} session={session("actor_reviewer", ["approval.approve", "approval.return"])} />);
    expect(screen.getByRole("button", { name: "Kembalikan" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Setujui" })).not.toBeInTheDocument();
  });
  it("maps backend projection without invented presentation fields", async () => {
    const mapped = approvalFromProjection(projection);
    expect(mapped.id).toBe("approval_1");
    expect(mapped.subjectTitle).toBeNull();
    expect(mapped.requesterName).toBeNull();
    expect(mapped.approverName).toBeNull();
    expect(mapped.documentsCount).toBeNull();
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([projection]);
    const result = await fetchApprovals();
    expect(result.data).toEqual([mapped]);
    expect(request).toHaveBeenCalledWith("/api/v1/approvals", expect.any(Object));
  });

  it("formats persisted materiality from the canonical response", () => {
    expect(approvalFromProjection({ ...projection, materiality_value: 1250000.50 })
      .materialityValue).toContain("1.250.000,5");
  });

  it("uses dedicated request and decision endpoints with canonical payloads", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue(projection);
    await createApproval({ subject_type: "PROJECT", subject_id: "project_1" });
    await decideApproval("approval_1", "return", { decision_reason: "Needs changes" });
    expect(request).toHaveBeenNthCalledWith(1, "/api/v1/approvals", {
      method: "POST", body: { subject_type: "PROJECT", subject_id: "project_1" },
    });
    expect(request).toHaveBeenNthCalledWith(2, "/api/v1/approvals/approval_1/return", {
      method: "POST", body: { decision_reason: "Needs changes" },
    });
  });

  it("shows decision actions only to a separate actor with the exact permission", async () => {
    const approval = approvalFromProjection(projection);
    const requester = render(<ApprovalDetailView approval={approval} session={session("actor_requester", ["approval.approve"])} />);
    expect(screen.queryByRole("button", { name: "Setujui" })).not.toBeInTheDocument();
    requester.unmount();
    const legacy = render(<ApprovalDetailView approval={approval} session={session("actor_other", ["work.write"])} />);
    expect(screen.queryByRole("button", { name: "Setujui" })).not.toBeInTheDocument();
    legacy.unmount();
    render(<ApprovalDetailView approval={approval} session={session("actor_other", ["approval.approve"])} />);
    expect(screen.getByRole("button", { name: "Setujui" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tolak" })).not.toBeInTheDocument();
    expect(screen.queryByText("Peninjau (Reviewer)")).not.toBeInTheDocument();
  });

  it("offers only Projects and Tasks obtained from dedicated APIs", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest")
      .mockResolvedValueOnce([{
        project_id: "project_1", code: "P-1", name: "Project One", workspace_ids: ["workspace_1"],
        status: "ACTIVE", tenant_id: "tenant_1", organization_id: "org_1",
        created_at: "2026-09-30T00:00:00Z", updated_at: "2026-09-30T00:00:00Z",
      }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(projection);
    const onCreated = vi.fn();
    render(<ApprovalCreateDialog onClose={vi.fn()} onCreated={onCreated} open />);
    await waitFor(() => expect(screen.getByRole("option", { name: "P-1 — Project One" })).toBeInTheDocument());
    expect(screen.queryByRole("option", { name: /budget|contract|payment/i })).not.toBeInTheDocument();
    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: "project_1" } });
    fireEvent.click(screen.getByRole("button", { name: "Ajukan" }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    expect(request).toHaveBeenLastCalledWith("/api/v1/approvals", {
      method: "POST", body: { subject_type: "PROJECT", subject_id: "project_1" },
    });
  });

  it("can request approval for a visible Task without entering an arbitrary ID", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest")
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{
        task_id: "task_1", title: "Task One", workspace_ids: ["workspace_1"],
        status: "OPEN", priority: "NORMAL", created_by: "actor_requester",
        tenant_id: "tenant_1", organization_id: "org_1",
        created_at: "2026-09-30T00:00:00Z", updated_at: "2026-09-30T00:00:00Z",
      }])
      .mockResolvedValueOnce({ ...projection, subject_type: "TASK", subject_id: "task_1" });
    render(<ApprovalCreateDialog onClose={vi.fn()} onCreated={vi.fn()} open />);
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "TASK" } });
    await waitFor(() => expect(screen.getByRole("option", { name: "Task One" })).toBeInTheDocument());
    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: "task_1" } });
    fireEvent.click(screen.getByRole("button", { name: "Ajukan" }));
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/approvals", {
      method: "POST", body: { subject_type: "TASK", subject_id: "task_1" },
    }));
  });
});
