import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SessionProjection } from "@/features/session";
import { SharedWorkChecklistPanel, SharedWorkRelationsPanel } from "@/features/shared-work/shared/shared-work-relations";
import * as api from "@/lib/api";

function session(permissions: string[]): SessionProjection {
  return { authenticated: true, principal: {
    actor: { actor_id: "actor_1" },
    active_workspace: { permission_refs: permissions },
  } } as SessionProjection;
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Shared Work links", () => {
  it("links a visible task to a document through the dedicated API", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, options) => {
      if (options?.method === "POST") return {
        entity_type: "TASK", entity_id: "task_1", title: "Tugas nyata", status: "OPEN",
      } as never;
      if (path === "/api/v1/tasks") return [{ task_id: "task_1", title: "Tugas nyata" }] as never;
      return [] as never;
    });
    render(<SharedWorkRelationsPanel entityType="DOCUMENT" entityId="doc_1"
      session={session(["document.read", "task.read", "approval.read", "work.relation.link"])} />);
    fireEvent.change(await screen.findByRole("combobox", { name: "Objek terkait" }), {
      target: { value: "task_1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Hubungkan" }));
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/documents/doc_1/links", {
      method: "POST", body: JSON.stringify({ target_type: "TASK", target_id: "task_1" }),
    }));
    expect(await screen.findByRole("link", { name: "Tugas nyata" })).toBeInTheDocument();
  });

  it("creates and completes checklist items with exact permission", async () => {
    const created = {
      item_id: "item_1", entity_type: "TASK", entity_id: "task_1", body: "Periksa dokumen",
      completed: false, created_by: "actor_1", created_at: "2026-09-30T00:00:00Z",
    };
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, options) => {
      if (options?.method === "POST" && path.endsWith("/complete")) return { ...created, completed: true } as never;
      if (options?.method === "POST") return created as never;
      return [] as never;
    });
    render(<SharedWorkChecklistPanel entityType="TASK" entityId="task_1"
      session={session(["task.read", "work.checklist.manage"])} />);
    fireEvent.change(await screen.findByRole("textbox", { name: "Item checklist" }), {
      target: { value: "Periksa dokumen" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tambah Item" }));
    await screen.findByText("○ Periksa dokumen");
    fireEvent.click(screen.getByRole("button", { name: "Selesai" }));
    await screen.findByText("✓ Periksa dokumen");
    expect(request).toHaveBeenCalledWith("/api/v1/work/TASK/task_1/checklist/item_1/complete", { method: "POST" });
  });
});
