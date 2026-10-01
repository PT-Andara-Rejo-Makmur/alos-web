import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecordPanel } from "@/features/business-records/record-panel";
import { DomainOverview } from "@/features/business-records/overview";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { financeResources } from "@/features/finance/resources";
import { salesResources } from "@/features/sales/resources";
import { marketingResources } from "@/features/marketing/resources";
import { propertyResources } from "@/features/property/resources";
import type { Resource } from "@/features/business-records/resource";
import type { SessionProjection } from "@/features/session";
import type { AuthenticatedPrincipalProjection, ExecutiveSourceStatus, FinanceBankAccountProjection, SalesCustomerProjection, FinanceOverview } from "@/lib/contracts";
import * as api from "@/lib/api";

const stamp = "2027-01-02T03:04:05Z";
const source = (status: ExecutiveSourceStatus["status"], name = "finance"): ExecutiveSourceStatus => ({ source: name, status, authoritative: true, last_updated_at: status === "CONNECTED" ? stamp : null });
const bank: FinanceBankAccountProjection = { bank_account_id: "bank_1", account_name: "Recorded Bank", bank_name: "Internal", account_number_masked: null, currency: "USD", status: "ACTIVE", tenant_id: "tenant_1", organization_id: "org_1", workspace_id: "workspace_1", created_at: stamp, updated_at: stamp, allowed_transitions: ["INACTIVE"] };
const customer: SalesCustomerProjection = { customer_id: "customer_1", customer_code: "C1", customer_type: "INDIVIDUAL", name: "Recorded Customer", email: null, phone: null, status: "ACTIVE", tenant_id: "tenant_1", organization_id: "org_1", workspace_id: "workspace_1", created_at: stamp, updated_at: stamp, allowed_transitions: ["INACTIVE"] };

function session(workspace = "workspace_1", write = true): SessionProjection {
  const principal: AuthenticatedPrincipalProjection = {
    actor: { actor_id: "actor_1", tenant_id: "tenant_1", organization_id: "org_1", active: true, display_name: "Owner" },
    active_workspace: { active: true, role_refs: ["DIVISION_LEAD"], permission_refs: write ? ["finance.write", "sales.write", "marketing.write", "property.write"] : [], scope_refs: [], data_scope: "WORKSPACE",
      workspace: { workspace_id: workspace, workspace_key: workspace, workspace_name: "Business", workspace_type: "BUSINESS", division_code: "FINANCE", organization_id: "org_1", active: true } },
    workspace_access: [], issued_at: stamp, expires_at: "2028-01-01T00:00:00Z", email: "owner@example.test",
  };
  return { authenticated: true, principal };
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("loads all canonical reference pages before enabling a real form", async () => {
  const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation((path) => {
    if (path.includes("/customers?")) {
      const second = path.includes("offset=1");
      return Promise.resolve({ items: [{ ...customer, customer_id: second ? "customer_2" : "customer_1", name: second ? "Second page buyer" : "First page buyer" }], total: 2, source: source("CONNECTED", "sales") });
    }
    return Promise.resolve({ items: [], total: 0, source: source("CONNECTED_EMPTY", "sales") });
  });
  render(<RecordPanel resource={salesResources.leads} session={session()} />);
  fireEvent.click(await screen.findByRole("button", { name: "Tambah Prospek & Lead" }));
  expect(await screen.findByRole("option", { name: /Second page buyer/ })).toBeInTheDocument();
  expect(request).toHaveBeenCalledWith("/api/v1/sales/customers?limit=200&offset=1", expect.anything());
  expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled();
});

describe.each([salesResources.customers, marketingResources.campaigns, propertyResources.property_units, financeResources.bank_accounts])("canonical $domain source states", (resource: Resource) => {
  it("renders loading without fabricated data", () => {
    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(() => new Promise(() => {}));
    render(<RecordPanel resource={resource} session={session()} />);
    expect(screen.getByLabelText("Memuat data authoritative…")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: `Tambah ${resource.title}` })).not.toBeInTheDocument();
  });
  it.each(["CONNECTED_EMPTY", "UNAVAILABLE", "ERROR"] as const)("keeps %s distinct", async (status) => {
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [], total: 0, source: source(status, resource.domain) });
    render(<RecordPanel resource={resource} session={session()} />);
    expect(await screen.findByText(status === "CONNECTED_EMPTY" ? "Belum ada data" : status === "ERROR" ? "Gagal Memuat" : "Belum Tersedia", { selector: "h3, p" })).toBeInTheDocument();
    if (status !== "CONNECTED_EMPTY") expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(/Rp\s*0/)).not.toBeInTheDocument();
  });
  it("keeps retrieval failure an error", async () => {
    vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(new api.ApiError(503, "Source failed", null));
    render(<RecordPanel resource={resource} session={session()} />);
    expect(await screen.findByText("Gagal Memuat", { selector: "h3, p" })).toBeInTheDocument();
    expect(screen.queryByText("Belum ada data")).not.toBeInTheDocument();
  });
});

it("renders connected records with exact source timestamp and canonical action", async () => {
  const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [bank], total: 1, source: source("CONNECTED") });
  render(<RecordPanel resource={financeResources.bank_accounts} session={session()} />);
  expect(await screen.findByText("Recorded Bank")).toBeInTheDocument();
  expect(screen.getByText(/Pembaruan sumber:/)).toHaveTextContent("2027");
  fireEvent.click(screen.getByRole("button", { name: "Lihat detail" }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByRole("button", { name: "INACTIVE" })).toBeInTheDocument();
  expect(within(dialog).queryByRole("button", { name: "CLOSED" })).not.toBeInTheDocument();
  request.mockImplementation((_path, options) => Promise.resolve(options?.method === "POST" ? bank : { items: [bank], total: 1, source: source("CONNECTED") }));
  fireEvent.click(within(dialog).getByRole("button", { name: "INACTIVE" }));
  await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/finance/bank-accounts/bank_1/transition", { method: "POST", body: { status: "INACTIVE" } }));
});

it("hides mutation buttons without canonical write permission", async () => {
  vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [bank], total: 1, source: source("CONNECTED") });
  render(<RecordPanel resource={financeResources.bank_accounts} session={session("workspace_1", false)} />);
  expect(await screen.findByText("Recorded Bank")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Tambah/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Lihat detail" }));
  expect(screen.queryByRole("button", { name: "INACTIVE" })).not.toBeInTheDocument();
});

it.each([true, false])("reports mutation success only after Backend success=%s", async (success) => {
  const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [], total: 0, source: source("CONNECTED_EMPTY", "sales") });
  render(<RecordPanel resource={salesResources.customers} session={session()} />);
  fireEvent.click(await screen.findByRole("button", { name: "Tambah Customer" }));
  fireEvent.change(screen.getByLabelText(/Kode Customer/), { target: { value: "C1" } });
  fireEvent.change(screen.getByLabelText(/^Nama/), { target: { value: "Recorded Customer" } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled());
  let resolve: (value: unknown) => void = () => {};
  let reject: (error: Error) => void = () => {};
  request.mockImplementation((_path, options) => options?.method === "POST" ? new Promise((yes, no) => { resolve = yes; reject = no; }) : Promise.resolve({ items: [], total: 0, source: source("CONNECTED_EMPTY", "sales") }));
  fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
  expect(screen.queryByText("Rekaman tersimpan.")).not.toBeInTheDocument();
  await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/sales/customers", { method: "POST", body: { customer_code: "C1", name: "Recorded Customer" } }));
  if (success) { resolve(customer); expect(await screen.findByText("Rekaman tersimpan.")).toBeInTheDocument(); }
  else { reject(new Error("Denied")); expect(await screen.findByText("Perubahan belum tersimpan", { selector: "h3, p" })).toBeInTheDocument(); expect(screen.queryByText("Rekaman tersimpan.")).not.toBeInTheDocument(); }
});

it("clears old records when authoritative workspace changes", async () => {
  vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce({ items: [bank], total: 1, source: source("CONNECTED") }).mockResolvedValue({ items: [], total: 0, source: source("CONNECTED_EMPTY") });
  const { rerender } = render(<BusinessDataPage title="Accounts" description="Records" resources={[financeResources.bank_accounts]} session={session()} />);
  expect(await screen.findByText("Recorded Bank")).toBeInTheDocument();
  rerender(<BusinessDataPage title="Accounts" description="Records" resources={[financeResources.bank_accounts]} session={session("workspace_2")} />);
  expect(screen.queryByText("Recorded Bank")).not.toBeInTheDocument();
  expect(await screen.findByText("Belum ada data", { selector: "h3, p" })).toBeInTheDocument();
});

it("keeps financial aggregates unavailable even with a connected ledger", async () => {
  const counts: FinanceOverview["counts"] = { bank_accounts: 1, bank_transactions: 2, receivables: 0, receivable_payments: 0, payables: 0, payable_payments: 0, budgets: 0, budget_lines: 0, reconciliations: 0, reconciliation_items: 0, tax_obligations: 0, tax_documents: 0, month_closes: 0, month_close_items: 0 };
  const read = vi.fn().mockResolvedValue({ source: source("CONNECTED"), counts, last_updated_at: stamp });
  render(<DomainOverview title="Finance" read={read} labels={{ bank_accounts: "Rekening" }} unavailable={["Kas Tersedia"]} />);
  expect(await screen.findByText("Rekening")).toBeInTheDocument();
  expect(screen.getByText("Kas Tersedia").closest("article")).toHaveTextContent("—");
  expect(screen.queryByText(/Rp\s*0/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Segarkan Data" })).not.toBeInTheDocument();
});
