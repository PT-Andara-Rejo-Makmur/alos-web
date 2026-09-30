import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SessionProjection } from "@/features/session";
import { FindingDetailView } from "@/features/shared-work/findings/finding-detail-view";
import { adaptFindingProjection, updateFinding } from "@/features/shared-work/findings/finding-model";
import type { SharedWorkFindingProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const projection: SharedWorkFindingProjection = {
  finding_id: "finding_1", tenant_id: "tenant_1", organization_id: "org_1",
  workspace_ids: ["workspace_1"], title: "Finding", description: null,
  severity: "HIGH", status: "OPEN", source_type: "MANUAL",
  owner_actor_id: "actor_owner", created_at: "2026-09-30T00:00:00Z",
  updated_at: "2026-09-30T00:00:00Z",
};

function session(actorId: string, permissions: string[]): SessionProjection {
  return {
    authenticated: true,
    principal: {
      actor: { actor_id: actorId, active: true, display_name: "User", tenant_id: "tenant_1", organization_id: "org_1" },
      active_workspace: {
        active: true, data_scope: "WORKSPACE", permission_refs: permissions,
        role_refs: ["DIVISION_MEMBER"], scope_refs: ["workspace_1"],
        workspace: {
          active: true, division_code: "PROPERTY", organization_id: "org_1",
          workspace_id: "workspace_1", workspace_key: "property",
          workspace_name: "Property", workspace_type: "BUSINESS",
        },
      },
      email: "user@andara.local", expires_at: "2026-10-01T00:00:00Z",
      issued_at: "2026-09-30T00:00:00Z", workspace_access: [],
    },
  } as SessionProjection;
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Finding lifecycle presentation", () => {
  it("uses canonical endpoints and updates state from the Backend response", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest")
      .mockResolvedValueOnce({ ...projection, status: "IN_PROGRESS" })
      .mockResolvedValueOnce({ ...projection, status: "PENDING_VERIFICATION" })
      .mockResolvedValueOnce({ ...projection, title: "Revised" });
    render(<FindingDetailView finding={adaptFindingProjection(projection)} session={session("actor_owner", ["finding.update"])} />);
    fireEvent.click(screen.getByRole("button", { name: "Mulai Tindak Lanjut" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Ajukan Verifikasi" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Ajukan Verifikasi" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Ajukan Verifikasi" })).not.toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Verifikasi" })).not.toBeInTheDocument();
    expect(request).toHaveBeenNthCalledWith(1, "/api/v1/work/findings/finding_1/start", { method: "POST" });
    expect(request).toHaveBeenNthCalledWith(2, "/api/v1/work/findings/finding_1/submit-verification", { method: "POST" });
    await updateFinding("finding_1", { title: "Revised" });
    expect(request).toHaveBeenNthCalledWith(3, "/api/v1/work/findings/finding_1", { method: "PATCH", body: { title: "Revised" } });
  });

  it("requires exact permission and a different actor to verify", async () => {
    const pending = adaptFindingProjection({ ...projection, status: "PENDING_VERIFICATION" });
    const owner = render(<FindingDetailView finding={pending} session={session("actor_owner", ["finding.verify"])} />);
    expect(screen.queryByRole("button", { name: "Verifikasi" })).not.toBeInTheDocument();
    owner.unmount();
    const legacy = render(<FindingDetailView finding={pending} session={session("actor_other", ["work.write"])} />);
    expect(screen.queryByRole("button", { name: "Verifikasi" })).not.toBeInTheDocument();
    legacy.unmount();
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce({ ...projection, status: "VERIFIED" });
    render(<FindingDetailView finding={pending} session={session("actor_other", ["finding.verify"])} />);
    fireEvent.click(screen.getByRole("button", { name: "Verifikasi" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Verifikasi" })).not.toBeInTheDocument());
    expect(request).toHaveBeenCalledWith("/api/v1/work/findings/finding_1/verify", { method: "POST" });
  });

  it("closes only with finding.close and keeps unsourced fields empty", async () => {
    const verified = adaptFindingProjection({ ...projection, status: "VERIFIED" });
    expect(verified.verifierActorId).toBeNull();
    expect(verified.projectId).toBeNull();
    expect(verified.correctiveActionTaskId).toBeNull();
    expect(verified.evidenceCount).toBeNull();
    const unauthorized = render(<FindingDetailView finding={verified} session={session("actor_other", ["finding.verify"])} />);
    expect(screen.queryByRole("button", { name: "Tutup Temuan" })).not.toBeInTheDocument();
    unauthorized.unmount();
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce({ ...projection, status: "CLOSED" });
    render(<FindingDetailView finding={verified} session={session("actor_other", ["finding.close"])} />);
    fireEvent.click(screen.getByRole("button", { name: "Tutup Temuan" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Tutup Temuan" })).not.toBeInTheDocument());
    expect(request).toHaveBeenCalledWith("/api/v1/work/findings/finding_1/close", { method: "POST" });
    fireEvent.click(screen.getByRole("tab", { name: "Bukti" }));
    expect(screen.getByText("Bukti belum terhubung dengan data temuan.")).toBeInTheDocument();
  });
});
