import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DocumentCreateDialog } from "@/features/shared-work/documents/document-create-dialog";
import { DocumentDetailView } from "@/features/shared-work/documents/document-detail-view";
import { DocumentsPage } from "@/features/shared-work/documents/documents-page";
import { createDocument, documentFromProjection, fetchDocumentDetail, fetchDocuments } from "@/features/shared-work/documents/document-model";
import type { SessionProjection } from "@/features/session";
import type { SharedWorkDocumentProjection, SharedWorkDocumentVersionProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/property/documents",
  useRouter: () => ({ push: vi.fn() }),
}));

const document: SharedWorkDocumentProjection = {
  document_id: "document_1",
  tenant_id: "tenant_1",
  organization_id: "org_1",
  workspace_id: "workspace_1",
  title: "Policy",
  category: "Governance",
  data_classification: "INTERNAL",
  status: "DRAFT",
  owner_actor_id: "actor_1",
  created_at: "2026-09-30T00:00:00Z",
};

const version: SharedWorkDocumentVersionProjection = {
  document_id: "document_1",
  tenant_id: "tenant_1",
  organization_id: "org_1",
  workspace_id: "workspace_1",
  version: "1.0",
  source_id: "source_1",
  source_version: "1",
  storage_uri: "urn:alos:source:1",
  content_hash: "sha256:" + "a".repeat(64),
  created_by: "actor_2",
  created_at: "2026-09-30T01:00:00Z",
};

function session(permissions: string[]): SessionProjection {
  return {
    authenticated: true,
    principal: {
      actor: {
        actor_id: "actor_1", active: true, display_name: "Document User",
        organization_id: "org_1", tenant_id: "tenant_1",
      },
      active_workspace: {
        active: true, data_scope: "WORKSPACE", permission_refs: permissions,
        role_refs: ["DIVISION_MEMBER"], scope_refs: ["workspace_1"],
        workspace: {
          active: true, division_code: "PROPERTY", organization_id: "org_1",
          workspace_id: "workspace_1", workspace_key: "property",
          workspace_name: "Property", workspace_type: "BUSINESS",
        },
      },
      email: "document@andara.local", expires_at: "2026-10-01T00:00:00Z",
      issued_at: "2026-09-30T00:00:00Z", workspace_access: [],
    },
  } as SessionProjection;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("authoritative document metadata", () => {
  it("maps only canonical fields and leaves unsourced presentation empty", async () => {
    const mapped = documentFromProjection(document);
    expect(mapped.id).toBe("document_1");
    expect(mapped.workspaceIds).toEqual(["workspace_1"]);
    expect(mapped.ownerActorId).toBe("actor_1");
    expect(mapped.updatedAt).toBeNull();
    expect(mapped.currentVersion).toBeNull();
    expect(mapped.projectId).toBeNull();
    expect(mapped.ownerName).toBeNull();
    expect(mapped.tasksCount).toBeNull();
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([document]);
    const response = await fetchDocuments();
    expect(response.data).toEqual([mapped]);
    expect(request).toHaveBeenCalledWith("/api/v1/documents", expect.any(Object));
  });

  it("loads version history from the dedicated endpoint", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest")
      .mockResolvedValueOnce(document)
      .mockResolvedValueOnce([version]);
    const response = await fetchDocumentDetail("document_1");
    expect(response.data?.currentVersion).toBe("1.0");
    expect(response.data?.versions?.[0]?.contentHash).toBe(version.content_hash);
    expect(request).toHaveBeenNthCalledWith(1, "/api/v1/documents/document_1", expect.any(Object));
    expect(request).toHaveBeenNthCalledWith(2, "/api/v1/documents/document_1/versions", expect.any(Object));
  });

  it("shows an empty version history without an invented version or hash", () => {
    render(<DocumentDetailView document={{ ...documentFromProjection(document), versions: [] }} />);
    fireEvent.click(screen.getByRole("tab", { name: "Versi" }));
    expect(screen.getByText("Belum ada versi dokumen yang tercatat.")).toBeInTheDocument();
    expect(screen.queryByText("v1.0")).not.toBeInTheDocument();
    expect(screen.queryByText(/canonical-initial-version/)).not.toBeInTheDocument();
    expect(screen.getByText("Penambahan versi belum tersedia di halaman ini.")).toBeInTheDocument();
  });

  it("submits metadata only and does not offer a file upload", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue(document);
    await createDocument({ title: "Policy", category: "Governance", data_classification: "INTERNAL" });
    expect(request).toHaveBeenCalledWith("/api/v1/documents", {
      method: "POST",
      body: { title: "Policy", category: "Governance", data_classification: "INTERNAL" },
    });
    request.mockClear();
    const onCreated = vi.fn();
    render(<DocumentCreateDialog onClose={vi.fn()} onCreated={onCreated} open />);
    fireEvent.change(screen.getByRole("textbox", { name: /Judul/ }), { target: { value: "Policy" } });
    fireEvent.change(screen.getByRole("textbox", { name: /Kategori/ }), { target: { value: "Governance" } });
    expect(screen.queryByRole("button", { name: /unggah|upload/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simpan Metadata" }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    expect(request).toHaveBeenCalledWith("/api/v1/documents", {
      method: "POST",
      body: { title: "Policy", category: "Governance", data_classification: "INTERNAL" },
    });
  });

  it("shows create metadata only when the session grants create authority", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(session([]));
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([]);
    const denied = render(<DocumentsPage workspaceKey="property" />);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Dokumen" })).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Tambah Metadata" })).not.toBeInTheDocument();
    denied.unmount();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(session(["document.create"]));
    render(<DocumentsPage workspaceKey="property" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Tambah Metadata" })).toBeInTheDocument());
  });
});
