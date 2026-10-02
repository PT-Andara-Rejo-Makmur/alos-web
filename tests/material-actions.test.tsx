import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MaterialActions } from "@/features/business-records/material-actions";
import { RecordPanel } from "@/features/business-records/record-panel";
import { salesResources } from "@/features/sales/resources";
import type { SessionProjection } from "@/features/session";
import type { SharedWorkApprovalProjection, SharedWorkMaterialActionProjection } from "@/lib/contracts";
import { canonicalPrincipal } from "./helpers/canonical-session";
import * as api from "@/lib/api";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const action: SharedWorkMaterialActionProjection = { subject_type: "SALES_BOOKING", requested_action: "CONFIRM_BOOKING", target_status: "CONFIRMED", approval_required: true, execution_allowed: true };
const approval: SharedWorkApprovalProjection = { approval_id: "approval_1", tenant_id: "tenant_1", organization_id: "org_1", workspace_ids: ["workspace_1"], subject_type: "SALES_BOOKING", subject_id: "booking_1", requested_by: "requester", requested_action: "CONFIRM_BOOKING", status: "APPROVED", requested_at: "2026-01-01T00:00:00Z" };

it("requests an action-scoped approval and keeps business execution separate", async () => {
  const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation((_path, options) => Promise.resolve(options?.method === "POST" ? { ...approval, status: "PENDING" } : []));
  const transition = vi.fn();
  render(<MaterialActions actions={[action]} identity="booking_1" resource={{ ...salesResources.bookings, transition }} canRequest onSaved={vi.fn()} />);
  fireEvent.click(await screen.findByRole("button", { name: "Minta Persetujuan CONFIRMED" }));
  expect(await screen.findByText(/Menunggu Persetujuan/)).toBeInTheDocument();
  expect(request).toHaveBeenCalledWith("/api/v1/approvals", { method: "POST", body: { subject_type: "SALES_BOOKING", subject_id: "booking_1", requested_action: "CONFIRM_BOOKING" } });
  expect(transition).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Eksekusi CONFIRMED" })).not.toBeInTheDocument();
});

it("executes only after an explicit click and sends the approved reference", async () => {
  vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([approval]);
  const transition = vi.fn().mockResolvedValue({ status: "CONFIRMED" });
  const saved = vi.fn();
  render(<MaterialActions actions={[action]} identity="booking_1" resource={{ ...salesResources.bookings, transition }} canRequest onSaved={saved} />);
  expect(await screen.findByText(/Disetujui — Siap Dieksekusi/)).toBeInTheDocument();
  expect(transition).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Eksekusi CONFIRMED" }));
  await waitFor(() => expect(saved).toHaveBeenCalledWith({ status: "CONFIRMED" }));
  expect(transition).toHaveBeenCalledWith("booking_1", "CONFIRMED", "approval_1");
});

it.each(["PENDING", "RETURNED", "REJECTED", "HELD"] as const)("never executes %s approvals", async (status) => {
  vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([{ ...approval, status }]);
  const transition = vi.fn();
  render(<MaterialActions actions={[action]} identity="booking_1" resource={{ ...salesResources.bookings, transition }} canRequest onSaved={vi.fn()} />);
  await waitFor(() => expect(screen.queryByText("Memuat persetujuan…")).not.toBeInTheDocument());
  expect(screen.queryByRole("button", { name: "Eksekusi CONFIRMED" })).not.toBeInTheDocument();
  expect(transition).not.toHaveBeenCalled();
});

it("keeps consumed approvals and denied executor authority unavailable", async () => {
  vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([{ ...approval, consumed_at: "2026-01-02T00:00:00Z" }]);
  render(<MaterialActions actions={[{ ...action, execution_allowed: false }]} identity="booking_1" resource={salesResources.bookings} canRequest={false} onSaved={vi.fn()} />);
  expect(await screen.findByText(/Persetujuan sudah digunakan/)).toBeInTheDocument();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("reports execution failure without optimistic success", async () => {
  vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([approval]);
  const saved = vi.fn();
  render(<MaterialActions actions={[action]} identity="booking_1" resource={{ ...salesResources.bookings, transition: vi.fn().mockRejectedValue(new Error("stale approval")) }} canRequest onSaved={saved} />);
  fireEvent.click(await screen.findByRole("button", { name: "Eksekusi CONFIRMED" }));
  expect(await screen.findByText("Persetujuan belum dapat diproses")).toBeInTheDocument();
  expect(saved).not.toHaveBeenCalled();
});

function session(workspaceId: string): SessionProjection {
  return { authenticated: true, principal: canonicalPrincipal({ actorId: "actor_1", divisionCode: "SALES", workspaceId, workspaceKey: workspaceId, workspaceName: workspaceId, permissions: ["sales.write", "approval.request", "approval.read"] }) };
}

it("resets records on workspace change and ignores the older response", async () => {
  let resolveOld: (value: object) => void = () => {};
  const old = new Promise<object>((resolve) => { resolveOld = resolve; });
  const source = { source: "sales", status: "CONNECTED", authoritative: true, last_updated_at: null };
  vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce(old).mockResolvedValueOnce({ items: [{ customer_id: "new", name: "Current workspace", allowed_transitions: [] }], total: 1, source });
  const view = render(<RecordPanel resource={salesResources.customers} session={session("old")} />);
  view.rerender(<RecordPanel resource={salesResources.customers} session={session("current")} />);
  expect(await screen.findByText("Current workspace")).toBeInTheDocument();
  resolveOld({ items: [{ customer_id: "old", name: "Previous workspace", allowed_transitions: [] }], total: 1, source });
  await waitFor(() => expect(screen.queryByText("Previous workspace")).not.toBeInTheDocument());
  expect(screen.getByText("Current workspace")).toBeInTheDocument();
});
