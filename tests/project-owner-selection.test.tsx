import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProjectCreateDialog } from "@/features/shared-work/projects/project-create-dialog";
import { ProjectDetailView } from "@/features/shared-work/projects/project-detail-view";
import { ProjectDrawer } from "@/features/shared-work/projects/project-drawer";
import { ProjectEditDialog } from "@/features/shared-work/projects/project-edit-dialog";
import { projectFromProjection } from "@/features/shared-work/projects/project-model";
import type { ProjectOwnerSelection } from "@/features/shared-work/projects/project-owner-field";
import { ProjectsPage } from "@/features/shared-work/projects/projects-page";
import type { SessionProjection } from "@/features/session";
import * as api from "@/lib/api";
import type { SharedWorkProjectProjection, SharedWorkWorkspaceMemberProjection } from "@/lib/contracts";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/property/projects",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

const workspaceId = "workspace_property";
const raniId = "a30fda88-132e-4c19-a16a-95c1414e828d";
const dimasId = "b49da85c-12e4-43e2-8a49-d867eaed0b29";
const legacyId = "ce25e5fd-b81e-4986-927c-3601c1a5e3d1";
const realAuthenticatedRequest = api.authenticatedApiRequest;
const creator: ProjectOwnerSelection = { actorId: raniId, name: "Rani Andara" };
const members: readonly SharedWorkWorkspaceMemberProjection[] = [
  { actor_id: raniId, display_name: "Rani Andara", position_title: "Manajer Teknik", workspace_id: workspaceId, role_refs: [], active: true, project_assignable: true, task_assignable: true, finding_assignable: false },
  // Task/finding assignment flags are not Project assignment authority.
  { actor_id: dimasId, display_name: "Dimas Pratama", workspace_id: workspaceId, role_refs: [], active: true, project_assignable: true, task_assignable: false, finding_assignable: false },
];
const projection: SharedWorkProjectProjection = {
  project_id: "project_park", tenant_id: "tenant_andara", organization_id: "org_andara",
  workspace_ids: [workspaceId], workspace_name: "Property & Teknik",
  code: "PRJ-001", name: "Kesiapan Cluster", objective: "Menyiapkan unit cluster", status: "PLANNED",
  owner_actor_id: raniId, owner_name: "Rani Andara",
  created_at: "2026-10-03T00:00:00Z", updated_at: "2026-10-03T00:00:00Z",
};
const session: SessionProjection = {
  authenticated: true,
  principal: {
    actor: { actor_id: raniId, display_name: "Rani Andara", active: true, tenant_id: "tenant_andara", organization_id: "org_andara" },
    active_workspace: {
      active: true, data_scope: "WORKSPACE", permission_refs: ["project.read", "project.create", "project.update"], role_refs: [], scope_refs: [workspaceId],
      workspace: { workspace_id: workspaceId, workspace_key: "property", workspace_name: "Property & Teknik", workspace_type: "BUSINESS", division_code: "PROPERTY", active: true, organization_id: "org_andara" },
    },
    workspace_access: [], email: "rani@andara.test", issued_at: "2026-10-03T00:00:00Z", expires_at: "2026-10-04T00:00:00Z",
  },
};

function mockRequests(directory: readonly SharedWorkWorkspaceMemberProjection[] = members, saved = projection) {
  return vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, options) => {
    if (path === "/api/v1/workspace-members") return directory as never;
    if (options?.method === "POST" || options?.method === "PATCH") return saved as never;
    return [] as never;
  });
}

function renderCreate(currentCreator: ProjectOwnerSelection | null = creator) {
  const onCreated = vi.fn();
  const view = render(<ProjectCreateDialog open onClose={vi.fn()} onCreated={onCreated} workspaceId={workspaceId} workspaceName="Property & Teknik" creator={currentCreator} />);
  fireEvent.change(screen.getByRole("textbox", { name: /Kode Proyek/ }), { target: { value: "PRJ-001" } });
  fireEvent.change(screen.getByRole("textbox", { name: /Nama Proyek/ }), { target: { value: "Kesiapan Cluster" } });
  fireEvent.change(screen.getByRole("textbox", { name: /Tujuan Proyek/ }), { target: { value: "Menyiapkan unit cluster" } });
  fireEvent.click(screen.getByRole("button", { name: "Lanjut" }));
  return { ...view, onCreated };
}

function submitCreate() {
  fireEvent.click(screen.getByRole("button", { name: "Lanjut" }));
  fireEvent.click(screen.getByRole("button", { name: "Lanjut" }));
  fireEvent.click(screen.getByRole("button", { name: "Simpan Proyek" }));
}

function renderEdit(current = projection) {
  const onSaved = vi.fn();
  const view = render(<ProjectEditDialog open project={projectFromProjection(current)} workspaceId={workspaceId} onClose={vi.fn()} onSaved={onSaved} />);
  return { ...view, onSaved };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Project workspace owner selection", () => {
  it("defaults to the authoritative creator and sends the same PIC shown in review", async () => {
    const request = mockRequests();
    const { onCreated } = renderCreate();
    await screen.findByRole("option", { name: "Dimas Pratama" });
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toHaveValue(raniId);
    expect(screen.getByRole("option", { name: "Rani Andara · Manajer Teknik · Anda" })).toBeInTheDocument();
    submitCreate();
    expect(screen.getByText("Rani Andara", { selector: "dd" })).toBeVisible();
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/projects", {
      method: "POST", body: { code: "PRJ-001", name: "Kesiapan Cluster", objective: "Menyiapkan unit cluster", priority: "NORMAL", owner_actor_id: raniId },
    }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(projectFromProjection(projection)));
  });

  it("shows a loading state while keeping the authoritative creator visible", async () => {
    let resolveMembers!: (value: readonly SharedWorkWorkspaceMemberProjection[]) => void;
    const pending = new Promise<readonly SharedWorkWorkspaceMemberProjection[]>(resolve => { resolveMembers = resolve; });
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => (path === "/api/v1/workspace-members" ? await pending : projection) as never);
    const { onCreated } = renderCreate();
    expect(screen.getByText("Memuat daftar penanggung jawab…")).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Rani Andara · Anda" })).toBeInTheDocument();
    submitCreate();
    expect(screen.getByText("Rani Andara", { selector: "dd" })).toBeVisible();
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(request).toHaveBeenCalledWith("/api/v1/projects", expect.objectContaining({ method: "POST", body: expect.objectContaining({ owner_actor_id: raniId }) }));
    resolveMembers(members);
    await waitFor(() => expect(screen.queryByText("Memuat daftar penanggung jawab…")).not.toBeInTheDocument());
  });

  it("keeps the creator-only default separate from replacement eligibility", async () => {
    const request = mockRequests([{ ...members[0], project_assignable: false }, members[1]]);
    renderCreate();
    await screen.findByRole("option", { name: "Dimas Pratama" });
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toHaveValue(raniId);
    expect(screen.getByRole("option", { name: "Rani Andara · Anda" })).toBeInTheDocument();
    submitCreate();
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/projects", expect.objectContaining({ method: "POST", body: expect.objectContaining({ owner_actor_id: raniId }) })));
  });

  it("restores the creator default when an override is cleared", async () => {
    const request = mockRequests();
    renderCreate();
    await screen.findByRole("option", { name: "Dimas Pratama" });
    const select = screen.getByRole("combobox", { name: "Penanggung Jawab" });
    fireEvent.change(select, { target: { value: dimasId } });
    fireEvent.change(select, { target: { value: "" } });
    expect(select).toHaveValue(raniId);
    submitCreate();
    expect(screen.getByText("Rani Andara", { selector: "dd" })).toBeVisible();
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/projects", expect.objectContaining({ method: "POST", body: expect.objectContaining({ owner_actor_id: raniId }) })));
  });

  it("uses human labels and sends the selected canonical actor_id during creation", async () => {
    const request = mockRequests();
    const { container } = renderCreate();
    await screen.findByRole("option", { name: "Dimas Pratama" });
    expect(screen.getByRole("option", { name: "Rani Andara · Manajer Teknik · Anda" })).toBeInTheDocument();
    expect(screen.getByText("Property & Teknik")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Penanggung Jawab" }), { target: { value: dimasId } });
    fireEvent.click(screen.getByRole("button", { name: "Lanjut" }));
    fireEvent.click(screen.getByRole("button", { name: "Lanjut" }));
    expect(screen.getByText("Dimas Pratama", { selector: "dd" })).toBeVisible();
    expect(container.textContent).not.toContain(dimasId);
    expect(container.textContent).not.toContain(raniId);
    fireEvent.click(screen.getByRole("button", { name: "Simpan Proyek" }));
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/projects", {
      method: "POST", body: { code: "PRJ-001", name: "Kesiapan Cluster", objective: "Menyiapkan unit cluster", priority: "NORMAL", owner_actor_id: dimasId },
    }));
  });

  it("serializes owner_actor_id into the actual authenticated Backend request", async () => {
    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(realAuthenticatedRequest);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(members), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...projection, owner_actor_id: dimasId, owner_name: "Dimas Pratama" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const { onCreated } = renderCreate();
    await screen.findByRole("option", { name: "Dimas Pratama" });
    fireEvent.change(screen.getByRole("combobox", { name: "Penanggung Jawab" }), { target: { value: dimasId } });
    submitCreate();
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/backend/api/v1/workspace-members", expect.objectContaining({ credentials: "same-origin" }));
    const [, options] = fetchMock.mock.calls.find(([path]) => path === "/api/backend/api/v1/projects")!;
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ code: "PRJ-001", name: "Kesiapan Cluster", objective: "Menyiapkan unit cluster", priority: "NORMAL", owner_actor_id: dimasId });
  });

  it("offers only active project-assignable members in the session workspace", async () => {
    const request = mockRequests([
      ...members,
      { ...members[0], actor_id: legacyId, display_name: "Anggota Nonaktif", active: false },
      { ...members[0], actor_id: "remote_actor", display_name: "Anggota Keuangan", workspace_id: "workspace_finance" },
      { ...members[0], actor_id: "task_only", display_name: "Petugas Tugas", project_assignable: false, task_assignable: true, finding_assignable: true },
      { ...members[0], actor_id: "older_projection", display_name: "Anggota tanpa flag", project_assignable: undefined },
    ]);
    renderCreate();
    await screen.findByRole("option", { name: "Dimas Pratama" });
    expect(screen.queryByRole("option", { name: "Anggota Nonaktif" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Anggota Keuangan" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Petugas Tugas" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Anggota tanpa flag" })).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledExactlyOnceWith("/api/v1/workspace-members");
  });

  it("reuses the searchable EntitySelect for a larger member directory", async () => {
    mockRequests([...members, ...Array.from({ length: 8 }, (_, index) => ({ ...members[1], actor_id: `member_${index}`, display_name: `Anggota ${index}` }))]);
    renderCreate();
    const search = await screen.findByRole("searchbox", { name: "Cari Penanggung Jawab" });
    fireEvent.change(search, { target: { value: "dimas" } });
    expect(screen.getByRole("option", { name: "Dimas Pratama" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toHaveValue(raniId);
    expect(screen.getByRole("option", { name: "Rani Andara · Manajer Teknik · Anda" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Anggota 0" })).not.toBeInTheDocument();
  });

  it("disables the picker while loading and permits unrelated edits without losing the owner", async () => {
    let resolveMembers!: (value: readonly SharedWorkWorkspaceMemberProjection[]) => void;
    const pending = new Promise<readonly SharedWorkWorkspaceMemberProjection[]>(resolve => { resolveMembers = resolve; });
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => (path === "/api/v1/workspace-members" ? await pending : projection) as never);
    const { onSaved } = renderEdit();
    expect(screen.getByText("Memuat daftar penanggung jawab…")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toHaveValue(raniId);
    fireEvent.change(screen.getByRole("textbox", { name: /Nama Proyek/ }), { target: { value: "Nama Baru" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(request).toHaveBeenCalledWith("/api/v1/projects/project_park", { method: "PATCH", body: { name: "Nama Baru", description: null, start_date: null, target_end_date: null } });
    resolveMembers(members);
    await screen.findByRole("option", { name: "Dimas Pratama" });
  });

  it("handles an empty directory without losing the authoritative creator default", async () => {
    const request = mockRequests([]);
    renderCreate();
    await screen.findByText("Belum ada anggota lain yang dapat dipilih. Penanggung jawab bawaan adalah pembuat proyek.");
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toHaveValue(raniId);
    submitCreate();
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/projects", expect.objectContaining({ method: "POST", body: expect.objectContaining({ owner_actor_id: raniId }) })));
  });

  it("shows a recoverable member error without crashing or sending a fake owner", async () => {
    let attempts = 0;
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
      if (path === "/api/v1/workspace-members") {
        if (attempts++ === 0) throw new Error("fetch failed");
        return members as never;
      }
      return projection as never;
    });
    renderCreate();
    await screen.findByText("Daftar penanggung jawab belum dapat dimuat. Coba lagi.");
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    await screen.findByRole("option", { name: "Dimas Pratama" });
    expect(screen.queryByText("Daftar penanggung jawab belum dapat dimuat. Coba lagi.")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toHaveValue(raniId);
    submitCreate();
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/projects", expect.objectContaining({ method: "POST", body: expect.objectContaining({ owner_actor_id: raniId }) })));
  });

  it("preserves the current owner when the member API fails during an edit", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
      if (path === "/api/v1/workspace-members") throw new api.ApiError(503, "MEMBER_DIRECTORY_FAILED", null);
      return projection as never;
    });
    const { container, onSaved } = renderEdit();
    await screen.findByText("Daftar penanggung jawab belum dapat dimuat. Coba lagi.");
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toHaveValue(raniId);
    expect(screen.getByRole("option", { name: "Rani Andara" })).toBeInTheDocument();
    expect(container.textContent).not.toContain(raniId);
    expect(container.textContent).not.toContain("MEMBER_DIRECTORY_FAILED");
    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(request).toHaveBeenCalledWith("/api/v1/projects/project_park", { method: "PATCH", body: { name: projection.name, description: null, start_date: null, target_end_date: null } });
  });

  it("explains and submits the creator default when the member directory fails", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
      if (path === "/api/v1/workspace-members") throw new api.ApiError(503, "MEMBER_DIRECTORY_FAILED", null);
      return projection as never;
    });
    const { onCreated } = renderCreate();
    await screen.findByText("Daftar penanggung jawab belum dapat dimuat. Coba lagi.");
    expect(screen.getByText("Jika melanjutkan tanpa memilih pengganti, pembuat proyek tetap menjadi penanggung jawab.")).toBeVisible();
    expect(screen.getByRole("option", { name: "Rani Andara · Anda" })).toBeInTheDocument();
    submitCreate();
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(request).toHaveBeenCalledWith("/api/v1/projects", { method: "POST", body: { code: "PRJ-001", name: "Kesiapan Cluster", objective: "Menyiapkan unit cluster", priority: "NORMAL", owner_actor_id: raniId } });
  });

  it("truthfully describes the creator fallback when authoritative actor data is unavailable", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
      if (path === "/api/v1/workspace-members") throw new Error("fetch failed");
      return projection as never;
    });
    const { onCreated } = renderCreate(null);
    await screen.findByText("Daftar penanggung jawab belum dapat dimuat. Coba lagi.");
    expect(screen.getByRole("option", { name: "Pembuat proyek (Anda)" })).toBeInTheDocument();
    submitCreate();
    expect(screen.getByText("Pembuat proyek (Anda)", { selector: "dd" })).toBeVisible();
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(request).toHaveBeenCalledWith("/api/v1/projects", { method: "POST", body: { code: "PRJ-001", name: "Kesiapan Cluster", objective: "Menyiapkan unit cluster", priority: "NORMAL" } });
  });

  it("initializes the current owner and omits owner_actor_id when only other fields change", async () => {
    const request = mockRequests();
    const { onSaved } = renderEdit();
    await screen.findByRole("option", { name: "Rani Andara · Manajer Teknik" });
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toHaveValue(raniId);
    fireEvent.change(screen.getByRole("textbox", { name: "Deskripsi" }), { target: { value: "Deskripsi diperbarui" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(projectFromProjection(projection)));
    expect(request).toHaveBeenCalledWith("/api/v1/projects/project_park", { method: "PATCH", body: { name: projection.name, description: "Deskripsi diperbarui", start_date: null, target_end_date: null } });
  });

  it("changes the owner through the authorized Project edit action and canonical PATCH", async () => {
    const updated = { ...projection, owner_actor_id: dimasId, owner_name: "Dimas Pratama" };
    const request = mockRequests(members, updated);
    render(<ProjectDetailView project={projectFromProjection(projection)} session={session} workspaceKey="property" />);
    fireEvent.click(screen.getByRole("button", { name: "Ubah Proyek" }));
    await screen.findByRole("option", { name: "Dimas Pratama" });
    fireEvent.change(screen.getByRole("combobox", { name: "Penanggung Jawab" }), { target: { value: dimasId } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Ubah Proyek" })).not.toBeInTheDocument());
    expect(request).toHaveBeenCalledWith("/api/v1/projects/project_park", { method: "PATCH", body: { name: projection.name, description: null, start_date: null, target_end_date: null, owner_actor_id: dimasId } });
    expect(screen.getByText("Dimas Pratama", { selector: "dd" })).toBeInTheDocument();
  });

  it("filters replacement owners during edit without clearing an ineligible current owner", async () => {
    const request = mockRequests([
      { ...members[0], project_assignable: false }, members[1],
      { ...members[1], actor_id: "task_only", display_name: "Petugas Tugas", project_assignable: false, task_assignable: true },
    ]);
    renderEdit();
    await screen.findByText(/Penanggung jawab tersimpan tidak ada dalam daftar anggota yang dapat dipilih/);
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toHaveValue(raniId);
    expect(screen.getByRole("option", { name: "Rani Andara" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Petugas Tugas" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Penanggung Jawab" }), { target: { value: dimasId } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/projects/project_park", expect.objectContaining({ method: "PATCH", body: expect.objectContaining({ owner_actor_id: dimasId }) })));
  });

  it("preserves an inactive legacy owner absent from the directory without exposing its ID", async () => {
    const current = { ...projection, owner_actor_id: legacyId, owner_name: "Sari Wulandari" };
    const request = mockRequests(members, current);
    const { container, onSaved } = renderEdit(current);
    await screen.findByText(/Penanggung jawab tersimpan tidak ada dalam daftar anggota yang dapat dipilih/);
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toHaveValue(legacyId);
    expect(screen.getByRole("option", { name: "Sari Wulandari" })).toBeInTheDocument();
    expect(container.textContent).not.toContain(legacyId);
    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(projectFromProjection(current)));
    expect(request).toHaveBeenCalledWith("/api/v1/projects/project_park", { method: "PATCH", body: { name: projection.name, description: null, start_date: null, target_end_date: null } });
  });

  it("keeps an unnamed legacy assignment instead of replacing its label with the actor ID", async () => {
    const current = { ...projection, owner_actor_id: legacyId, owner_name: null };
    const request = mockRequests(members, current);
    const { container, onSaved } = renderEdit(current);
    await screen.findByText(/Penanggung jawab tersimpan tidak ada dalam daftar anggota yang dapat dipilih/);
    expect(screen.getByRole("combobox", { name: "Penanggung Jawab" })).toHaveValue(legacyId);
    expect(container.textContent).not.toContain(legacyId);
    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(request).toHaveBeenCalledWith("/api/v1/projects/project_park", { method: "PATCH", body: { name: projection.name, description: null, start_date: null, target_end_date: null } });
  });

  it("sends null only when the user explicitly clears an existing assignment", async () => {
    const request = mockRequests();
    renderEdit();
    await screen.findByRole("option", { name: "Dimas Pratama" });
    fireEvent.change(screen.getByRole("combobox", { name: "Penanggung Jawab" }), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/projects/project_park", { method: "PATCH", body: { name: projection.name, description: null, start_date: null, target_end_date: null, owner_actor_id: null } }));
  });

  it.each(["create", "update"] as const)("humanizes the Backend owner rejection during %s and keeps the form open", async (operation) => {
    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
      if (path === "/api/v1/workspace-members") return members as never;
      throw new api.ApiError(404, "Work record was not found.", null, { code: "WORK_RECORD_NOT_FOUND" });
    });
    const { container } = operation === "create" ? renderCreate() : renderEdit();
    await screen.findByRole("option", { name: "Dimas Pratama" });
    fireEvent.change(screen.getByRole("combobox", { name: "Penanggung Jawab" }), { target: { value: dimasId } });
    if (operation === "create") submitCreate();
    else fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await screen.findByText("Penanggung jawab yang dipilih tidak memiliki akses ke ruang kerja proyek ini, atau proyek sudah tidak tersedia. Muat ulang data lalu coba lagi.");
    expect(screen.getByRole("dialog", { name: operation === "create" ? "Tambah Proyek" : "Ubah Proyek" })).toBeInTheDocument();
    expect(container.textContent).not.toContain("WORK_RECORD_NOT_FOUND");
    expect(container.textContent).not.toContain(dimasId);
  });

  it.each(["detail", "drawer"] as const)("uses Belum ditentukan in the %s when owner_name is absent", async (surface) => {
    mockRequests();
    const current = projectFromProjection({ ...projection, owner_name: null });
    const { container } = surface === "detail"
      ? render(<ProjectDetailView project={current} session={session} workspaceKey="property" />)
      : render(<ProjectDrawer project={current} open onClose={vi.fn()} workspaceKey="property" />);
    const term = screen.getByText("Penanggung Jawab", { selector: "dt" });
    expect(term.nextElementSibling).toHaveTextContent("Belum ditentukan");
    expect(container.textContent).not.toContain(raniId);
    if (surface === "detail") await waitFor(() => expect(api.authenticatedApiRequest).toHaveBeenCalled());
  });

  it("uses Belum ditentukan in the Project list and never displays owner_actor_id", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([{ ...projection, owner_name: null }]);
    const { container } = render(<ProjectsPage workspaceKey="property" />);
    const row = await screen.findByRole("row", { name: /PRJ-001/ });
    expect(within(row).getByText("Belum ditentukan")).toBeInTheDocument();
    expect(container.textContent).not.toContain(raniId);
  });
});
