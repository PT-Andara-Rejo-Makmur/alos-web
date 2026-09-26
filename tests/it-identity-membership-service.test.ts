import { describe, expect, it, vi } from "vitest";

import {
  saveActorMemberships,
  type DraftMembership,
  type IdentityAccessRequest,
  type Membership,
} from "@/modules/it/identity-access/shared";

function membership(workspaceId: string): Membership {
  return {
    workspace: {
      workspace_id: workspaceId,
      workspace_key: workspaceId,
      workspace_name: workspaceId,
    },
    role_refs: ["IT_ADMIN"],
    permission_refs: ["identity.accounts.manage"],
    scope_refs: [],
    data_scope: "WORKSPACE",
  };
}

function draft(workspaceId: string, originalWorkspaceId: string | null): DraftMembership {
  return { ...membership(workspaceId), original_workspace_id: originalWorkspaceId };
}

function requestSpy() {
  const spy = vi.fn(async () => undefined);
  return { request: spy as unknown as IdentityAccessRequest, spy };
}

describe("layanan membership Identity & Access", () => {
  it("menambah membership baru melalui POST", async () => {
    const { request, spy } = requestSpy();
    await saveActorMemberships({ actorId: "actor_1", originalMemberships: [], draftMemberships: [draft("ws_new", null)], request });

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith("/api/v1/identity/actors/actor_1/memberships", expect.objectContaining({ method: "POST" }));
  });

  it("memperbarui membership workspace yang sama melalui PUT", async () => {
    const { request, spy } = requestSpy();
    await saveActorMemberships({ actorId: "actor_1", originalMemberships: [membership("ws_1")], draftMemberships: [draft("ws_1", "ws_1")], request });

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith("/api/v1/identity/actors/actor_1/memberships", expect.objectContaining({ method: "PUT" }));
  });

  it("memindahkan membership dengan POST baru lalu DELETE workspace lama", async () => {
    const { request, spy } = requestSpy();
    await saveActorMemberships({ actorId: "actor_1", originalMemberships: [membership("ws_old")], draftMemberships: [draft("ws_new", "ws_old")], request });

    expect(spy).toHaveBeenNthCalledWith(1, "/api/v1/identity/actors/actor_1/memberships", expect.objectContaining({ method: "POST" }));
    expect(spy).toHaveBeenNthCalledWith(2, "/api/v1/identity/actors/actor_1/memberships/ws_old", { method: "DELETE" });
  });

  it("menghapus membership yang tidak dipertahankan", async () => {
    const { request, spy } = requestSpy();
    await saveActorMemberships({ actorId: "actor_1", originalMemberships: [membership("ws_removed")], draftMemberships: [], request });

    expect(spy).toHaveBeenCalledWith("/api/v1/identity/actors/actor_1/memberships/ws_removed", { method: "DELETE" });
  });

  it("menolak workspace duplikat sebelum mengirim mutation", async () => {
    const { request, spy } = requestSpy();
    await expect(saveActorMemberships({ actorId: "actor_1", originalMemberships: [], draftMemberships: [draft("ws_1", null), draft("ws_1", null)], request })).rejects.toThrow("Satu workspace hanya boleh memiliki satu membership per akun.");
    expect(spy).not.toHaveBeenCalled();
  });

  it("meneruskan error Backend tanpa menutupinya", async () => {
    const backendError = new Error("Backend menolak perubahan membership.");
    const request = vi.fn(async () => { throw backendError; }) as unknown as IdentityAccessRequest;

    await expect(saveActorMemberships({ actorId: "actor_1", originalMemberships: [], draftMemberships: [draft("ws_1", null)], request })).rejects.toBe(backendError);
  });
});
