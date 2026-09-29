import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { activeItWorkspaceKey, hasItContext, identityRoleLabel, itNavigation } from "@/features/it";
import type { SessionProjection } from "@/features/session";

const itAccess = {
  active: true,
  data_scope: "COMPANY" as const,
  permission_refs: [],
  role_refs: ["IT_ADMIN" as const],
  scope_refs: [],
  workspace: { active: true, division_code: "IT", organization_id: "org_1", workspace_id: "ws_it", workspace_key: "it-utama", workspace_name: "IT", workspace_type: "IT_OPERATIONS" as const },
};

const itSession: SessionProjection = {
  authenticated: true,
  principal: {
    actor: { actor_id: "actor_it", active: true, display_name: "Admin IT", organization_id: "org_1", tenant_id: "tenant_1" },
    email: "it@example.test",
    workspace_access: [itAccess],
    active_workspace: itAccess,
    issued_at: "2026-09-01T00:00:00Z",
    expires_at: "2026-10-01T00:00:00Z",
  },
};

function source(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("IT frontend master matrix", () => {
  it("uses IT domain authority and rejects a workspace-key mismatch", () => {
    expect(hasItContext(itSession, "it-utama")).toBe(true);
    expect(hasItContext(itSession, "it-lain")).toBe(false);
    expect(activeItWorkspaceKey(itSession)).toBe("it-utama");
  });

  it("keeps the exact 20-item master sidebar with encoded workspace identity", () => {
    const sections = itNavigation("it utama");
    expect(sections.flatMap((section) => section.items)).toHaveLength(20);
    expect(sections.map((section) => section.label)).toEqual(["PUSAT IT", "PLATFORM & SISTEM", "AKSES & IDENTITAS", "PERUBAHAN", "OPERASIONAL", "KINERJA", "PEKERJAAN", "ARA"]);
    expect(sections.flatMap((section) => section.items).every((item) => item.href.startsWith("/workspace/it%20utama/"))).toBe(true);
  });

  it("maps role labels without leaking raw canonical enums", () => {
    expect(identityRoleLabel("IT_ADMIN")).toBe("Administrator IT");
    expect(identityRoleLabel("UNKNOWN_ROLE")).toBe("Belum Dinilai");
    expect(identityRoleLabel("IT_ADMIN")).not.toBe("IT_ADMIN");
  });

  it("locks canonical IT dispatch and route shape without a static IT tree", () => {
    const root = source("src/app/workspace/[workspaceKey]/page.tsx");
    const summary = source("src/app/workspace/[workspaceKey]/(domain)/summary/page.tsx");
    const performance = source("src/app/workspace/[workspaceKey]/(domain)/performance/page.tsx");
    expect(root).toContain('resolution.domain === "IT"');
    expect(summary).toContain("ItSummaryPage");
    expect(performance).toContain("ItPerformancePage");
    expect(source("src/features/it/account-management-page.tsx")).not.toContain("new-user-password");
    expect(source("src/features/it/account-management-page.tsx")).not.toContain("ProvisionAccountRequest");
  });

  it("keeps account provisioning source-honest and does not expose internal identity fields", () => {
    const page = source("src/features/it/account-management-page.tsx");
    expect(page).toContain("Pilihan karyawan belum tersedia.");
    expect(page).toContain("Penyediaan akun belum tersedia");
    expect(page).not.toContain("Actor ID");
    expect(page).not.toContain("tenant_id");
    expect(page).not.toContain("organization_id");
    expect(page).not.toContain("activation token");
  });

  it("keeps the same-origin session boundary and avoids duplicated Shared Work/ARA features", () => {
    expect(source("src/features/it/account-management-page.tsx")).not.toContain("selectActiveWorkspace");
    expect(source("src/features/it/it-layout.tsx")).toContain("resolveWorkspaceDomain");
    expect(source("src/features/it/navigation.ts")).toContain("/projects");
    expect(source("src/features/it/navigation.ts")).toContain("/ara");
    expect(source("src/features/it/navigation.ts")).not.toContain("features/shared-work");
    expect(source("src/features/it/navigation.ts")).not.toContain("features/ara");
  });

  it("keeps source states mutually exclusive in the shared IT presentation", () => {
    const ui = source("src/features/it/shared/it-ui.tsx");
    expect(ui).toContain('unavailable: "Belum Terhubung"');
    expect(ui).toContain('error: "Data belum dapat dimuat"');
    expect(ui).toContain('"connected-empty": "Belum ada data"');
    expect(ui).toContain('"connected-data": "Tersedia"');
  });
});
