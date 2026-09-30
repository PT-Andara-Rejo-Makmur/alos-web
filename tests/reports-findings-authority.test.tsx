import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import type { SessionProjection } from "@/features/session";
import {
  adaptReportProjection,
  fetchReportDefinitions,
  fetchReportDetail,
  fetchReportResults,
} from "@/features/shared-work/reports/report-model";
import {
  adaptFindingProjection,
  fetchFindingDetail,
  fetchFindings,
} from "@/features/shared-work/findings/finding-model";
import { ReportsPage } from "@/features/shared-work/reports";
import { FindingsPage } from "@/features/shared-work/findings";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/property/reports",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));

function mockSession(): SessionProjection {
  return {
    authenticated: true,
    principal: {
      account_id: "acc_1",
      actor: {
        actor_id: "act_1",
        active: true,
        display_name: "Test User",
        organization_id: "org_default",
        tenant_id: "tenant_default",
      },
      active_workspace: {
        active: true,
        data_scope: "WORKSPACE",
        permission_refs: ["report.read", "report.create", "finding.read", "finding.create"],
        role_refs: ["DIVISION_MEMBER"],
        scope_refs: ["workspace_property"],
        workspace: {
          active: true,
          division_code: "PROPERTY",
          organization_id: "org_default",
          workspace_id: "workspace_property",
          workspace_key: "property",
          workspace_name: "Property",
          workspace_type: "BUSINESS",
        },
      },
      email: "test@andara.co.id",
      expires_at: "2026-10-01T00:00:00Z",
      issued_at: "2026-09-27T00:00:00Z",
      workspace_access: [],
    },
  } as unknown as SessionProjection;
}

describe("Reports and Findings Authoritative Integration", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });
  it("adapts canonical ReportProjection without fabricating presentation fields", () => {
    const projection = {
      report_id: "rep_123",
      tenant_id: "tenant_default",
      organization_id: "org_default",
      workspace_ids: ["workspace_property"],
      title: "Laporan Keuangan Q1",
      report_type: "FINANCIAL",
      status: "DRAFT" as const,
      owner_actor_id: "act_1",
      created_at: "2026-09-30T10:00:00Z",
      updated_at: "2026-09-30T10:00:00Z",
    };

    const adapted = adaptReportProjection(projection);
    expect(adapted.id).toBe("rep_123");
    expect(adapted.title).toBe("Laporan Keuangan Q1");
    expect(adapted.reportType).toBe("FINANCIAL");
    expect(adapted.status).toBe("DRAFT");
    expect(adapted.ownerActorId).toBe("act_1");
    expect(adapted.createdAt).toBe("2026-09-30T10:00:00Z");
    expect(adapted.workspaceIds).toEqual(["workspace_property"]);

    // Non-authoritative fields must be null
    expect(adapted.description).toBeNull();
    expect(adapted.periodStart).toBeNull();
    expect(adapted.periodEnd).toBeNull();
    expect(adapted.scope).toBeNull();
    expect(adapted.ownerName).toBeNull();
    expect(adapted.workspaceName).toBeNull();
    expect(adapted.publishedAt).toBeNull();
    expect(adapted.evidenceCount).toBeNull();
    expect(adapted.commentsCount).toBeNull();
  });

  it("adapts canonical FindingProjection without fabricating relations or verifier", () => {
    const projection = {
      finding_id: "find_456",
      tenant_id: "tenant_default",
      organization_id: "org_default",
      workspace_ids: ["workspace_property"],
      title: "Temuan Retak Struktur",
      description: "Dinding retak di blok B",
      severity: "HIGH" as const,
      status: "OPEN" as const,
      source_type: "MANUAL",
      owner_actor_id: "act_1",
      created_at: "2026-09-30T11:00:00Z",
      updated_at: "2026-09-30T11:00:00Z",
    };

    const adapted = adaptFindingProjection(projection);
    expect(adapted.id).toBe("find_456");
    expect(adapted.title).toBe("Temuan Retak Struktur");
    expect(adapted.description).toBe("Dinding retak di blok B");
    expect(adapted.severity).toBe("HIGH");
    expect(adapted.status).toBe("OPEN");
    expect(adapted.sourceType).toBe("MANUAL");
    expect(adapted.ownerActorId).toBe("act_1");
    expect(adapted.createdAt).toBe("2026-09-30T11:00:00Z");
    expect(adapted.identifiedAt).toBe("2026-09-30T11:00:00Z");
    expect(adapted.workspaceIds).toEqual(["workspace_property"]);

    // Relations without backend authority remain null
    expect(adapted.projectId).toBeNull();
    expect(adapted.projectName).toBeNull();
    expect(adapted.ownerName).toBeNull();
    expect(adapted.verifierActorId).toBeNull();
    expect(adapted.verifierName).toBeNull();
    expect(adapted.dueDate).toBeNull();
    expect(adapted.correctiveActionTaskId).toBeNull();
    expect(adapted.correctiveActionTaskTitle).toBeNull();
    expect(adapted.evidenceCount).toBeNull();
    expect(adapted.tasksCount).toBeNull();
  });

  it("fetches report results from dedicated API and keeps definitions unavailable", async () => {
    const apiSpy = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([
      {
        report_id: "rep_999",
        tenant_id: "tenant_default",
        organization_id: "org_default",
        workspace_ids: ["workspace_property"],
        title: "Laporan Hasil Audit",
        report_type: "AUDIT",
        status: "DRAFT",
        owner_actor_id: "act_1",
        created_at: "2026-09-30T12:00:00Z",
        updated_at: "2026-09-30T12:00:00Z",
      },
    ]);

    const results = await fetchReportResults({ status: "DRAFT", search: "Audit" });
    expect(results.connected).toBe(true);
    expect(results.data).toHaveLength(1);
    expect(results.data[0].id).toBe("rep_999");
    expect(apiSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/work/reports/results?search=Audit&status=DRAFT"),
      expect.anything(),
    );

    // Definitions must be unavailable and not call backend
    const defs = await fetchReportDefinitions();
    expect(defs.connected).toBe(false);
    expect(defs.sourceState).toBe("unavailable");
    expect(defs.data).toEqual([]);
  });

  it("fetches findings from dedicated API without sending unsupported project_id filter", async () => {
    const apiSpy = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([
      {
        finding_id: "find_999",
        tenant_id: "tenant_default",
        organization_id: "org_default",
        workspace_ids: ["workspace_property"],
        title: "Temuan Sanitasi",
        description: null,
        severity: "LOW",
        status: "OPEN",
        source_type: "MANUAL",
        owner_actor_id: "act_1",
        created_at: "2026-09-30T12:30:00Z",
        updated_at: "2026-09-30T12:30:00Z",
      },
    ]);

    const findings = await fetchFindings({
      projectId: "proj_should_be_ignored",
      severity: "LOW",
      status: "OPEN",
    });
    expect(findings.connected).toBe(true);
    expect(findings.data).toHaveLength(1);
    expect(findings.data[0].id).toBe("find_999");

    const calledPath = apiSpy.mock.calls[0][0];
    expect(calledPath).toContain("/api/v1/work/findings");
    expect(calledPath).toContain("severity=LOW");
    expect(calledPath).toContain("status=OPEN");
    expect(calledPath).not.toContain("project_id");
  });

  it("renders ReportsPage with connected results and honest definition unavailable notice", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(mockSession());
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([
      {
        report_id: "rep_100",
        tenant_id: "tenant_default",
        organization_id: "org_default",
        workspace_ids: ["workspace_property"],
        title: "Laporan Kemajuan Proyek",
        report_type: "PROJECT",
        status: "DRAFT",
        owner_actor_id: "act_1",
        created_at: "2026-09-30T10:00:00Z",
        updated_at: "2026-09-30T10:00:00Z",
      },
    ]);

    render(<ReportsPage workspaceKey="property" />);

    await waitFor(() => {
      expect(screen.getByText("Laporan Kemajuan Proyek")).toBeInTheDocument();
    });

    // Ensure non-authoritative columns display "—"
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
  });

  it("fetches report and finding details from dedicated endpoints", async () => {
    const reportSpy = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce({
      report_id: "rep_single",
      tenant_id: "tenant_default",
      organization_id: "org_default",
      workspace_ids: ["workspace_property"],
      title: "Detail Laporan",
      report_type: "AUDIT",
      status: "DRAFT",
      owner_actor_id: "act_1",
      created_at: "2026-09-30T10:00:00Z",
      updated_at: "2026-09-30T10:00:00Z",
    });

    const reportDetail = await fetchReportDetail("rep_single");
    expect(reportDetail.connected).toBe(true);
    expect(reportDetail.data?.id).toBe("rep_single");
    expect(reportSpy).toHaveBeenCalledWith("/api/v1/work/reports/results/rep_single", expect.anything());

    const findingSpy = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce({
      finding_id: "find_single",
      tenant_id: "tenant_default",
      organization_id: "org_default",
      workspace_ids: ["workspace_property"],
      title: "Detail Temuan",
      description: "Deskripsi",
      severity: "LOW",
      status: "OPEN",
      source_type: "MANUAL",
      owner_actor_id: "act_1",
      created_at: "2026-09-30T10:00:00Z",
      updated_at: "2026-09-30T10:00:00Z",
    });

    const findingDetail = await fetchFindingDetail("find_single");
    expect(findingDetail.connected).toBe(true);
    expect(findingDetail.data?.id).toBe("find_single");
    expect(findingSpy).toHaveBeenCalledWith("/api/v1/work/findings/find_single", expect.anything());
  });

  it("renders FindingsPage with connected findings data", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(mockSession());
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([
      {
        finding_id: "find_100",
        tenant_id: "tenant_default",
        organization_id: "org_default",
        workspace_ids: ["workspace_property"],
        title: "Temuan Lapangan Utama",
        description: "Catatan temuan",
        severity: "MEDIUM",
        status: "OPEN",
        source_type: "MANUAL",
        owner_actor_id: "act_1",
        created_at: "2026-09-30T10:00:00Z",
        updated_at: "2026-09-30T10:00:00Z",
      },
    ]);

    render(<FindingsPage workspaceKey="property" />);

    await waitFor(() => {
      expect(screen.getByText("Temuan Lapangan Utama")).toBeInTheDocument();
    });
  });
});
