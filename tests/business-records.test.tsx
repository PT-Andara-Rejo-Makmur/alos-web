import { statusLabel } from "@/lib/presentation";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecordPanel } from "@/features/business-records/record-panel";
import { DomainOverview } from "@/features/business-records/overview";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { financeResources } from "@/features/finance/resources";
import { salesResources } from "@/features/sales/resources";
import { marketingResources } from "@/features/marketing/resources";
import { propertyResources } from "@/features/property/resources";
import { legalResources } from "@/features/legal/resources";
import type { Resource } from "@/features/business-records/resource";
import type { SessionProjection } from "@/features/session";
import type { AuthenticatedPrincipalProjection, ExecutiveSourceStatus, FinanceBankAccountProjection, SalesCustomerProjection, FinanceOverview, SalesPricingProjection, FinanceBudgetProjection, FinanceMonthCloseProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

const stamp = "2027-01-02T03:04:05Z";
const source = (status: ExecutiveSourceStatus["status"], name = "finance"): ExecutiveSourceStatus => ({ source: name, status, authoritative: true, last_updated_at: status === "CONNECTED" ? stamp : null });
const bank: FinanceBankAccountProjection = { bank_account_id: "bank_1", account_name: "Recorded Bank", bank_name: "Internal", account_number_masked: null, currency: "USD", status: "ACTIVE", tenant_id: "tenant_1", organization_id: "org_1", workspace_id: "workspace_1", created_at: stamp, updated_at: stamp, allowed_transitions: ["INACTIVE"] };
const customer: SalesCustomerProjection = { customer_id: "customer_1", customer_code: "C1", customer_type: "INDIVIDUAL", name: "Recorded Customer", email: null, phone: null, status: "ACTIVE", tenant_id: "tenant_1", organization_id: "org_1", workspace_id: "workspace_1", created_at: stamp, updated_at: stamp, allowed_transitions: ["INACTIVE"] };

function session(workspace = "workspace_1", write = true, role: "DIVISION_LEAD" | "DIVISION_MEMBER" = "DIVISION_LEAD"): SessionProjection {
  const principal: AuthenticatedPrincipalProjection = {
    actor: { actor_id: "actor_1", tenant_id: "tenant_1", organization_id: "org_1", active: true, display_name: "Owner" },
    active_workspace: { active: true, role_refs: [role], permission_refs: write ? ["finance.write", "sales.write", "marketing.write", "property.write", "legal.write"] : [], scope_refs: [], data_scope: "WORKSPACE",
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
  fireEvent.change(screen.getByLabelText(/^Pelanggan/), { target: { value: "customer_2" } });
  expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled();
});

it.each([[403, "Anda tidak memiliki kewenangan"], [409, "Data atau status pengajuan sudah berubah"], [422, "Periksa kelengkapan isian"], [503, "Layanan belum dapat memproses permintaan"]])("preserves mutation denial %s and input without fake success", async (status, explanation) => {
  const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation((_path, options) => options?.method === "POST"
    ? Promise.reject(new api.ApiError(Number(status), "Canonical rejection", "corr_record_denied"))
    : Promise.resolve({ items: [], total: 0, source: source("CONNECTED_EMPTY", "sales") }));
  render(<RecordPanel resource={salesResources.customers} session={session()} />);
  fireEvent.click(await screen.findByRole("button", { name: "Tambah Customer" }));
  fireEvent.change(screen.getByLabelText(/Kode Pelanggan/), { target: { value: "C1" } });
  fireEvent.change(screen.getByLabelText(/^Nama/), { target: { value: "Retry Customer" } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
  expect(await screen.findByText(new RegExp(String(explanation)))).toBeInTheDocument();
  expect(screen.queryByText(/Canonical rejection|corr_record_denied/)).not.toBeInTheDocument();
  expect(screen.getByLabelText(/^Nama/)).toHaveValue("Retry Customer");
  expect(screen.queryByText("Rekaman tersimpan.")).not.toBeInTheDocument();
  expect(request).toHaveBeenCalledWith("/api/v1/sales/customers", expect.objectContaining({ method: "POST" }));
});

it("preserves transition conflict and the authoritative prior state", async () => {
  vi.spyOn(api, "authenticatedApiRequest").mockImplementation((_path, options) => options?.method === "POST"
    ? Promise.reject(new api.ApiError(409, "State changed", "corr_transition"))
    : Promise.resolve({ items: [bank], total: 1, source: source("CONNECTED") }));
  render(<RecordPanel resource={financeResources.bank_accounts} session={session()} />);
  fireEvent.click(await screen.findByRole("button", { name: "Lihat detail" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Tidak Aktif" }));
  expect(await within(dialog).findByText(/Data atau status pengajuan sudah berubah/)).toBeInTheDocument();
  expect(within(dialog).queryByText(/corr_transition/)).not.toBeInTheDocument();
  expect(within(dialog).getByText("Aktif", { exact: true })).toBeInTheDocument();
  expect(screen.queryByText("Perubahan status tersimpan.")).not.toBeInTheDocument();
});

it("loads scoped Legal subjects for the selected type and clears the previous subject", async () => {
  const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation((path) => {
    const records = path.includes("/contracts?") ? [{ contract_id: "contract_1", contract_number: "Contract A" }]
      : path.includes("/permits?") ? [{ permit_id: "permit_1", permit_number: "Permit B" }] : [];
    return Promise.resolve({ items: records, total: records.length, source: source(records.length ? "CONNECTED" : "CONNECTED_EMPTY", "legal") });
  });
  render(<RecordPanel resource={legalResources.due_diligences} session={session()} />);
  fireEvent.click(await screen.findByRole("button", { name: `Tambah ${legalResources.due_diligences.title}` }));
  const subject = screen.getByLabelText(/^Referensi Internal/);
  expect(subject).toBeDisabled();
  expect(screen.getByRole("button", { name: "Simpan" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText(/^Jenis Referensi Internal/), { target: { value: "CONTRACT" } });
  await screen.findByRole("option", { name: /Contract A/ });
  fireEvent.change(subject, { target: { value: "contract_1" } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled());
  fireEvent.change(screen.getByLabelText(/^Jenis Referensi Internal/), { target: { value: "PERMIT" } });
  expect(subject).toHaveValue("");
  expect(screen.getByRole("button", { name: "Simpan" })).toBeDisabled();
  await screen.findByRole("option", { name: /Permit B/ });
  expect(screen.queryByRole("option", { name: /Contract A/ })).not.toBeInTheDocument();
  expect(request).toHaveBeenCalledWith("/api/v1/legal/permits?limit=200&offset=0", expect.anything());
});

it.each([false, true])("binds immutable version choices to their selected Document; source failure=%s", async (failure) => {
  vi.spyOn(api, "authenticatedApiRequest").mockImplementation((path) => {
    if (path.includes("/documents/doc_a/versions?")) return Promise.resolve([{ version: "1.0" }]);
    if (path.includes("/documents/doc_b/versions?")) return failure ? Promise.reject(new api.ApiError(503, "Source down", null)) : Promise.resolve([{ version: "2.0" }]);
    const items = path.includes("/documents?") ? [{ document_id: "doc_a", title: "Document A" }, { document_id: "doc_b", title: "Document B" }]
      : path.includes("/contracts?") ? [{ contract_id: "contract_1", contract_number: "Contract A" }] : [];
    return Promise.resolve({ items, total: items.length, source: source(items.length ? "CONNECTED" : "CONNECTED_EMPTY", "legal") });
  });
  render(<RecordPanel resource={legalResources.contract_revisions} session={session()} />);
  fireEvent.click(await screen.findByRole("button", { name: `Tambah ${legalResources.contract_revisions.title}` }));
  await screen.findByRole("option", { name: /Document A/ });
  fireEvent.change(screen.getByLabelText(/^Contract Id/), { target: { value: "contract_1" } });
  fireEvent.change(screen.getByLabelText(/^Document Id/), { target: { value: "doc_a" } });
  await screen.findByRole("option", { name: /^1\.0$/ });
  const version = screen.getByLabelText(/^Document Version/);
  fireEvent.change(version, { target: { value: "1.0" } });
  fireEvent.change(screen.getByLabelText(/^Document Id/), { target: { value: "doc_b" } });
  expect(version).toHaveValue("");
  expect(screen.getByRole("button", { name: "Simpan" })).toBeDisabled();
  if (failure) { expect(await screen.findByText("Pilihan terkait belum dapat dimuat", { selector: "h3, p" })).toBeInTheDocument(); expect(version).toBeDisabled(); }
  else { await screen.findByRole("option", { name: /^2\.0$/ }); expect(screen.queryByRole("option", { name: /^1\.0$/ })).not.toBeInTheDocument(); }
});

describe.each([salesResources.customers, marketingResources.campaigns, propertyResources.property_units, financeResources.bank_accounts])("canonical $domain source states", (resource: Resource) => {
  it("renders loading without fabricated data", () => {
    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(() => new Promise(() => {}));
    render(<RecordPanel resource={resource} session={session()} />);
    expect(screen.getByLabelText("Memuat data perusahaan…")).toBeInTheDocument();
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
  expect(screen.getByText(/Diperbarui/)).toHaveTextContent("2027");
  fireEvent.click(screen.getByRole("button", { name: "Lihat detail" }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByRole("button", { name: "Tidak Aktif" })).toBeInTheDocument();
  expect(within(dialog).queryByRole("button", { name: "Selesai" })).not.toBeInTheDocument();
  request.mockImplementation((_path, options) => Promise.resolve(options?.method === "POST" ? bank : { items: [bank], total: 1, source: source("CONNECTED") }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Tidak Aktif" }));
  await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/finance/bank-accounts/bank_1/transition", { method: "POST", body: { status: "INACTIVE" } }));
});

it("hides mutation buttons without canonical write permission", async () => {
  vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [bank], total: 1, source: source("CONNECTED") });
  render(<RecordPanel resource={financeResources.bank_accounts} session={session("workspace_1", false)} />);
  expect(await screen.findByText("Recorded Bank")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Tambah/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Lihat detail" }));
  expect(screen.queryByRole("button", { name: "Tidak Aktif" })).not.toBeInTheDocument();
});

const recordScope = { tenant_id: "tenant_1", organization_id: "org_1", workspace_id: "workspace_1", created_at: stamp, updated_at: stamp };
const pricing: SalesPricingProjection = { ...recordScope, pricing_id: "pricing_1", name: "Prepared Pricing", effective_from: null, effective_to: null, status: "DRAFT", allowed_transitions: [] };
const budget: FinanceBudgetProjection = { ...recordScope, budget_id: "budget_1", name: "Recorded Budget", fiscal_year: 2027, status: "UNDER_REVIEW", allowed_transitions: [] };
const month: FinanceMonthCloseProjection = { ...recordScope, month_close_id: "month_1", period: "2027-01", status: "OPEN", opened_at: stamp, closed_at: null, closed_by: null, allowed_transitions: [] };

describe.each(["DIVISION_MEMBER", "DIVISION_LEAD"] as const)("material commands for %s", (role) => {
  it.each([
    { resource: salesResources.pricings, record: pricing },
    { resource: financeResources.budgets, record: budget },
    ...["APPROVED", "ACTIVE", "CLOSED"].map((status) => ({ resource: financeResources.budgets, record: { ...budget, status } })),
    { resource: financeResources.month_closes, record: month },
    { resource: financeResources.month_closes, record: { ...month, status: "CLOSED", closed_at: stamp } },
  ])("preserves $resource.key $record.status without inventing material actions", async ({ resource, record }) => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [record], total: 1, source: source("CONNECTED", resource.domain) });
    render(<RecordPanel resource={resource} session={session("workspace_1", true, role)} />);
    fireEvent.click(await screen.findByRole("button", { name: "Lihat detail" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(statusLabel(record.status))).toBeInTheDocument();
    for (const status of ["ACTIVE", "APPROVED", "CLOSED"]) {
      expect(within(dialog).queryByRole("button", { name: statusLabel(status) })).not.toBeInTheDocument();
    }
    expect(request).not.toHaveBeenCalledWith(expect.stringContaining("/transition"), expect.anything());
  });
});

it.each([
  { status: "DRAFT", allowed_transitions: ["UNDER_REVIEW"] },
  { status: "UNDER_REVIEW", allowed_transitions: ["DRAFT"] },
] as const)("renders only Backend budget preparation action from $status", async (state) => {
  vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [{ ...budget, ...state } satisfies FinanceBudgetProjection], total: 1, source: source("CONNECTED") });
  render(<RecordPanel resource={financeResources.budgets} session={session()} />);
  fireEvent.click(await screen.findByRole("button", { name: "Lihat detail" }));
  expect(within(screen.getByRole("dialog")).getByRole("button", { name: statusLabel(state.allowed_transitions[0]) })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Disetujui" })).not.toBeInTheDocument();
});

it.each([true, false])("reports mutation success only after Backend success=%s", async (success) => {
  const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [], total: 0, source: source("CONNECTED_EMPTY", "sales") });
  render(<RecordPanel resource={salesResources.customers} session={session()} />);
  fireEvent.click(await screen.findByRole("button", { name: "Tambah Customer" }));
  fireEvent.change(screen.getByLabelText(/Kode Pelanggan/), { target: { value: "C1" } });
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
  expect(screen.getByText("Kas Tersedia").closest("article")).toHaveTextContent("Belum tersedia");
  expect(screen.queryByText(/Rp\s*0/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Segarkan Data" })).not.toBeInTheDocument();
});
