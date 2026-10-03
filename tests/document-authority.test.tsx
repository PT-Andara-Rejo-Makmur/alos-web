import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DocumentCreateDialog } from "@/features/shared-work/documents/document-create-dialog";
import { DocumentDetailView } from "@/features/shared-work/documents/document-detail-view";
import { DocumentsPage } from "@/features/shared-work/documents/documents-page";
import {
  approveDocument,
  createDocument,
  documentFromProjection,
  documentVersionFromProjection,
  fetchDocumentDetail,
  fetchDocuments,
  retireDocument,
  reviewDocument,
} from "@/features/shared-work/documents/document-model";
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

function session(permissions: string[], actorId = "actor_1"): SessionProjection {
  return {
    authenticated: true,
    principal: {
      actor: {
        actor_id: actorId, active: true, display_name: "Document User",
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
  } as unknown as SessionProjection;
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
    expect(screen.queryByRole("button", { name: "Tambah Versi dari Sumber" })).not.toBeInTheDocument();
  });

  it("creates an immutable version from a verified scoped source selector", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, options) => {
      if (String(path).endsWith("/source-options")) return [{
        source_id: "source_1", source_title: "Verified source",
        source_version: "1", content_hash: version.content_hash,
      }];
      if (String(path).endsWith("/versions") && options?.method === "POST") return version;
      return [];
    });
    render(<DocumentDetailView
      document={{ ...documentFromProjection(document), versions: [] }}
      session={session(["document.version"])}
    />);
    fireEvent.click(screen.getByRole("tab", { name: "Versi" }));
    fireEvent.click(screen.getByRole("button", { name: "Tambah Versi dari Sumber" }));
    expect(await screen.findByRole("option", { name: "Verified source · 1" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Versi" }), { target: { value: "1.0" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Sumber Terverifikasi" }), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Versi" }));
    await waitFor(() => expect(screen.getByText("Hash Integritas: " + version.content_hash)).toBeInTheDocument());
    expect(request).toHaveBeenCalledWith("/api/v1/documents/document_1/versions", {
      method: "POST", body: { version: "1.0", source_id: "source_1", source_version: "1" },
    });
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
      body: { title: "Policy", category: "Governance", data_classification: "INTERNAL", description: null, project_id: null, effective_date: null, expiry_date: null },
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

  it("uses dedicated lifecycle endpoints with exact paths", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue(document);
    await reviewDocument("document_1");
    await approveDocument("document_1");
    await retireDocument("document_1");
    expect(request).toHaveBeenNthCalledWith(1, "/api/v1/documents/document_1/review", { method: "POST" });
    expect(request).toHaveBeenNthCalledWith(2, "/api/v1/documents/document_1/approve", { method: "POST" });
    expect(request).toHaveBeenNthCalledWith(3, "/api/v1/documents/document_1/retire", { method: "POST" });
  });

  it("enforces exact session permissions and separation of duties for lifecycle actions", async () => {
    const baseDoc = documentFromProjection(document); // owner_actor_id: "actor_1", status: "DRAFT"

    // DRAFT without version: review button disabled and shows alert
    const draftNoVersion = render(
      <DocumentDetailView
        document={{ ...baseDoc, versions: [] }}
        session={session(["document.review"], "actor_1")}
      />
    );
    const reviewBtnDisabled = screen.getByRole("button", { name: "Ajukan Review" });
    expect(reviewBtnDisabled).toBeDisabled();
    expect(
      screen.getByText("Minimal satu versi authoritative diperlukan sebelum dokumen dapat diajukan untuk review.")
    ).toBeInTheDocument();
    draftNoVersion.unmount();

    // DRAFT with work.write only: review button not displayed
    const draftLegacy = render(
      <DocumentDetailView
        document={{ ...baseDoc, versions: [documentVersionFromProjection(version)] }}
        session={session(["work.write"], "actor_1")}
      />
    );
    expect(screen.queryByRole("button", { name: "Ajukan Review" })).not.toBeInTheDocument();
    draftLegacy.unmount();

    // DRAFT with version and document.review: review button enabled
    const draftWithVersion = render(
      <DocumentDetailView
        document={{ ...baseDoc, versions: [documentVersionFromProjection(version)] }}
        session={session(["document.review"], "actor_1")}
      />
    );
    const reviewBtn = screen.getByRole("button", { name: "Ajukan Review" });
    expect(reviewBtn).toBeEnabled();
    const reqReview = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
      ...document,
      status: "IN_REVIEW",
    });
    fireEvent.click(reviewBtn);
    await waitFor(() => expect(reqReview).toHaveBeenCalledWith("/api/v1/documents/document_1/review", { method: "POST" }));
    draftWithVersion.unmount();

    // IN_REVIEW: Owner cannot approve (Separation of Duties) even if owner has document.approve
    const inReviewOwner = render(
      <DocumentDetailView
        document={{ ...baseDoc, status: "IN_REVIEW", versions: [documentVersionFromProjection(version)] }}
        session={session(["document.approve"], "actor_1")}
      />
    );
    expect(screen.queryByRole("button", { name: "Setujui" })).not.toBeInTheDocument();
    inReviewOwner.unmount();

    // IN_REVIEW: Non-owner with work.write only cannot approve
    const inReviewLegacy = render(
      <DocumentDetailView
        document={{ ...baseDoc, status: "IN_REVIEW", versions: [documentVersionFromProjection(version)] }}
        session={session(["work.write"], "actor_2")}
      />
    );
    expect(screen.queryByRole("button", { name: "Setujui" })).not.toBeInTheDocument();
    inReviewLegacy.unmount();

    // IN_REVIEW: Non-owner with document.approve can approve
    const inReviewApprover = render(
      <DocumentDetailView
        document={{ ...baseDoc, status: "IN_REVIEW", versions: [documentVersionFromProjection(version)] }}
        session={session(["document.approve"], "actor_2")}
      />
    );
    const approveBtn = screen.getByRole("button", { name: "Setujui" });
    expect(approveBtn).toBeEnabled();
    const reqApprove = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
      ...document,
      status: "APPROVED",
    });
    fireEvent.click(approveBtn);
    await waitFor(() => expect(reqApprove).toHaveBeenCalledWith("/api/v1/documents/document_1/approve", { method: "POST" }));
    inReviewApprover.unmount();

    // APPROVED: with document.retire shows "Tidak Berlaku / Arsipkan"
    const approvedRetirer = render(
      <DocumentDetailView
        document={{ ...baseDoc, status: "APPROVED", versions: [documentVersionFromProjection(version)] }}
        session={session(["document.retire"], "actor_1")}
      />
    );
    const retireBtn = screen.getByRole("button", { name: "Tidak Berlaku / Arsipkan" });
    expect(retireBtn).toBeEnabled();
    const reqRetire = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
      ...document,
      status: "RETIRED",
    });
    fireEvent.click(retireBtn);
    await waitFor(() => expect(reqRetire).toHaveBeenCalledWith("/api/v1/documents/document_1/retire", { method: "POST" }));
    approvedRetirer.unmount();

    // RETIRED: no mutation actions
    render(
      <DocumentDetailView
        document={{ ...baseDoc, status: "RETIRED", versions: [documentVersionFromProjection(version)] }}
        session={session(["document.review", "document.approve", "document.retire"], "actor_2")}
      />
    );
    expect(screen.queryByRole("button", { name: "Ajukan Review" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Setujui" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tidak Berlaku / Arsipkan" })).not.toBeInTheDocument();
  });

  it("informs user that version creation is frozen when document is not in DRAFT", () => {
    render(
      <DocumentDetailView
        document={{ ...documentFromProjection(document), status: "IN_REVIEW", versions: [documentVersionFromProjection(version)] }}
      />
    );
    fireEvent.click(screen.getByRole("tab", { name: "Versi" }));
    expect(
      screen.getByText("Penambahan versi dokumen dibekukan setelah dokumen diajukan untuk review atau disetujui.")
    ).toBeInTheDocument();
  });
});

