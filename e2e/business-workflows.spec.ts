import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";

const backendURL = process.env.ALOS_E2E_BACKEND_URL ?? "http://127.0.0.1:18000";
const webURL = process.env.ALOS_E2E_WEB_URL ?? "http://127.0.0.1:13000";
const bff = "/api/backend/api/v1";
type RecordData = Record<string, unknown>;

// Fixtures belong exclusively to the disposable audit stack, never operational data.
test.beforeAll(() => {
  if (process.env.ALOS_E2E_ALLOW_TEST_REGISTRATION !== "1") throw new Error("Explicit disposable test registration is required");
  for (const address of [backendURL, webURL]) {
    const url = new URL(address);
    if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) throw new Error("Business UAT requires a loopback disposable stack");
  }
  const auditPorts = new URL(backendURL).port === "18000" && new URL(webURL).port === "13000";
  const disposableCI = process.env.CI === "true" && process.env.ALOS_E2E_DISPOSABLE_STACK === "1"
    && new URL(backendURL).port === "8000" && new URL(webURL).port === "3000";
  if (!auditPorts && !disposableCI) throw new Error("Business UAT fixtures require the isolated audit stack or explicitly disposable CI");
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== "passed") return;
  const path = testInfo.outputPath("business-uat.png");
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach("business-uat", { path, contentType: "image/png" });
});

async function account(request: APIRequestContext, domain: string, permissions: string[]) {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const identity = {
    email: `uat-${domain}-${suffix}@alos.test`, password: "DisposableTest!2026", display_name: `UAT ${domain}`,
    tenant_id: `tenant_uat_${suffix}`, organization_id: `org_uat_${suffix}`,
    workspace_id: `workspace_uat_${suffix}`, workspace_key: `uat-${domain}-${suffix}`, workspace_name: `UAT ${domain}`,
    workspace_type: "BUSINESS", division_code: domain.toUpperCase(), role_refs: ["DIVISION_LEAD"],
    permission_refs: [...new Set([`${domain}.read`, "project.read", "task.read", "document.read", "approval.read", "work.read", ...permissions])],
    scope_refs: ["scope.e2e.business"], data_scope: "WORKSPACE",
  };
  const registered = await request.post(`${backendURL}/api/v1/auth/register`, { data: identity });
  expect(registered.status(), await registered.text()).toBe(201);
  return identity;
}

async function coworker(request: APIRequestContext, identity: Awaited<ReturnType<typeof account>>, permissions: string[], role = "DIVISION_LEAD") {
  const colleague = { ...identity, email: `uat-reviewer-${randomUUID().slice(0, 8)}@alos.test`, display_name: "UAT Independent Reviewer", permission_refs: permissions, role_refs: [role] };
  const registered = await request.post(`${backendURL}/api/v1/auth/register`, { data: colleague });
  expect(registered.status(), await registered.text()).toBe(201);
  return colleague;
}

async function login(page: Page, identity: { email: string; password: string }) {
  await page.goto("/login");
  await page.locator("#session-email").fill(identity.email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(identity.password);
  await page.getByRole("button", { name: "Masuk ke ALOS", exact: true }).click();
  await expect(page).toHaveURL(/\/workspace/);
}

async function api<T = RecordData>(page: Page, method: "get" | "post", path: string, data?: RecordData, status = method === "post" ? 201 : 200): Promise<T> {
  const result = await page.request[method](`${bff}${path}`, data ? { data } : {});
  expect(result.status(), await result.text()).toBe(status);
  return await result.json() as T;
}

async function clickMutation(page: Page, button: Locator, path: string, expectedStatus = 200): Promise<RecordData> {
  const response = page.waitForResponse(result => result.request().method() === "POST" && new URL(result.url()).pathname === `${bff}${path}`);
  await button.click();
  const result = await response;
  expect(result.status(), await result.text()).toBe(expectedStatus);
  return await result.json() as RecordData;
}

async function saveRecord(page: Page, title: string, path: string, fields: Record<string, string>, selects: string[] = [], update = false) {
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: `${update ? "Ubah" : "Tambah"} ${title}`, exact: true })).toBeVisible();
  const filled = new Set<string>();
  for (let step = 0; step < 8; step++) {
    for (const [field, value] of Object.entries(fields)) {
      const control = dialog.locator(`#record-${field}`);
      if (!await control.isVisible()) continue;
      if (selects.includes(field)) {
        await expect(control).toBeEnabled();
        await expect(control.locator(`option[value="${value}"]`)).toHaveCount(1);
        await control.selectOption(value);
      } else await control.fill(value);
      filled.add(field);
    }
    const next = dialog.getByRole("button", { name: "Lanjut", exact: true });
    if (await next.count()) {
      const heading = dialog.getByRole("heading", { level: 3 });
      const previous = await heading.textContent();
      await next.click();
      await expect(heading).not.toHaveText(previous ?? "");
      continue;
    }
    expect([...filled].sort(), "Every intended input must actually be filled before submitting").toEqual(Object.keys(fields).sort());
    // Updates use PATCH; creation is POST, both must be accepted by Backend.
    const response = page.waitForResponse(result => result.request().method() === (update ? "PATCH" : "POST") && new URL(result.url()).pathname === `${bff}${path}`);
    await dialog.getByRole("button", { name: "Simpan", exact: true }).click();
    const result = await response;
    expect(result.status(), await result.text()).toBe(update ? 200 : 201);
    await expect(dialog.getByRole("heading", { name: `Detail ${title}`, exact: true })).toBeVisible();
    return await result.json() as RecordData;
  }
  throw new Error("Form did not reach its review step");
}

async function closeDetail(page: Page) {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test("Sales customer → related lead → qualification persists after reload", async ({ page, request }) => {
  const actor = await account(request, "sales", ["sales.write"]);
  await login(page, actor);
  await page.goto(`/workspace/${actor.workspace_key}/leads`);
  await page.getByRole("button", { name: "Tambah Customer", exact: true }).click();
  const customerName = `Pelanggan UAT ${randomUUID().slice(0, 8)}`;
  const customer = await saveRecord(page, "Customer", "/sales/customers", { customer_code: "UAT-CUSTOMER", name: customerName });
  await closeDetail(page);
  await page.getByRole("tab", { name: "Prospek & Lead", exact: true }).click();
  await page.getByRole("button", { name: "Tambah Prospek & Lead", exact: true }).click();
  const lead = await saveRecord(page, "Prospek & Lead", "/sales/leads", { customer_id: String(customer.customer_id), source: "UAT browser", interest: "Unit uji terisolasi" }, ["customer_id"]);
  expect(lead.customer_id).toBe(customer.customer_id);
  const qualified = await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Memenuhi Kriteria", exact: true }), `/sales/leads/${lead.lead_id}/transition`);
  expect(qualified.status).toBe("QUALIFIED");
  await closeDetail(page);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: customerName })).toBeVisible();
  expect((await api(page, "get", `/sales/leads/${lead.lead_id}`)).status).toBe("QUALIFIED");
});

test("Property unit editing retains unknown land/building areas", async ({ page, request }) => {
  const actor = await account(request, "property", ["property.write"]);
  await login(page, actor);
  await page.goto(`/workspace/${actor.workspace_key}/units`);
  await page.getByRole("button", { name: "Tambah Unit", exact: true }).click();
  const unit = await saveRecord(page, "Unit", "/property/property-units", { unit_code: "UAT-UNIT", unit_name: "Unit belum diukur" });
  expect(unit.area_land).toBeNull();
  expect(unit.area_building).toBeNull();
  await page.getByRole("dialog").getByRole("button", { name: "Ubah Unit", exact: true }).click();
  await saveRecord(page, "Unit", `/property/property-units/${unit.property_unit_id}`, { unit_name: "Unit setelah pembaruan" }, [], true);
  await closeDetail(page);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: "Unit setelah pembaruan" })).toBeVisible();
  const persisted = await api(page, "get", `/property/property-units/${unit.property_unit_id}`);
  expect(persisted.area_land).toBeNull();
  expect(persisted.area_building).toBeNull();
});

test("Finance bank transaction keeps exact decimal and is immutable", async ({ page, request }) => {
  const actor = await account(request, "finance", ["finance.write"]);
  await login(page, actor);
  await page.goto(`/workspace/${actor.workspace_key}/liquidity`);
  await page.getByRole("button", { name: "Tambah Rekening Bank Internal", exact: true }).click();
  const bank = await saveRecord(page, "Rekening Bank Internal", "/finance/bank-accounts", { account_name: "Rekening UAT", bank_name: "Bank Fixture", account_number_masked: "****1234", currency: "IDR" });
  await closeDetail(page);
  await page.getByRole("tab", { name: "Transaksi Bank Tercatat", exact: true }).click();
  await page.getByRole("button", { name: "Tambah Transaksi Bank Tercatat", exact: true }).click();
  const transaction = await saveRecord(page, "Transaksi Bank Tercatat", "/finance/bank-transactions", {
    bank_account_id: String(bank.bank_account_id), transaction_date: "2026-10-04", reference: "UAT-EXACT-DECIMAL", direction: "IN", amount: "90071992547409.93", currency: "IDR",
  }, ["bank_account_id", "direction"]);
  expect(transaction.amount).toBe("90071992547409.93");
  expect(transaction.currency).toBe("IDR");
  await expect(page.getByRole("dialog").getByRole("button", { name: "Ubah Transaksi Bank Tercatat", exact: true })).toHaveCount(0);
  await closeDetail(page);
  await page.reload();
  await page.getByRole("tab", { name: "Transaksi Bank Tercatat", exact: true }).click();
  await expect(page.getByRole("row").filter({ hasText: "UAT-EXACT-DECIMAL" })).toBeVisible();
  expect((await api(page, "get", `/finance/bank-transactions/${transaction.transaction_id}`)).amount).toBe(transaction.amount);
  const edited = await page.request.patch(`${bff}/finance/bank-transactions/${transaction.transaction_id}`, { data: { amount: "1.00" } });
  expect(edited.status()).toBe(405);
});

test("Legal contract journey stores a draft without inventing dates or approval", async ({ page, request }) => {
  const actor = await account(request, "legal", ["legal.write"]);
  await login(page, actor);
  await page.goto(`/workspace/${actor.workspace_key}/contracts`);
  await page.getByRole("button", { name: "Tambah Kontrak & Perjanjian", exact: true }).click();
  const contract = await saveRecord(page, "Kontrak & Perjanjian", "/legal/contracts", { contract_number: "UAT-LEGAL", contract_type: "TEST_ONLY", counterparty_name: "Pihak Uji Terisolasi" });
  expect(contract.status).toBe("DRAFT");
  expect(contract.start_date).toBeNull();
  expect(contract.end_date).toBeNull();
  await closeDetail(page);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: "UAT-LEGAL" })).toBeVisible();
  expect((await api(page, "get", `/legal/contracts/${contract.contract_id}`)).status).toBe("DRAFT");
});

test("HR facility request moves into work without a fabricated resolution", async ({ page, request }) => {
  const actor = await account(request, "hr", ["hr.write"]);
  await login(page, actor);
  await page.goto(`/workspace/${actor.workspace_key}/ga`);
  await page.getByRole("button", { name: "Tambah Permintaan Fasilitas", exact: true }).click();
  const facility = await saveRecord(page, "Permintaan Fasilitas", "/hr/facility-requests", { facility_code: "UAT-FACILITY", title: "Pemeriksaan fasilitas uji" });
  const changed = await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Sedang Dikerjakan", exact: true }), `/hr/facility-requests/${facility.facility_request_id}/transition`);
  expect(changed.status).toBe("IN_PROGRESS");
  expect(changed.resolution_notes).toBeNull();
  await closeDetail(page);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: "Pemeriksaan fasilitas uji" })).toBeVisible();
  expect((await api(page, "get", `/hr/facility-requests/${facility.facility_request_id}`)).status).toBe("IN_PROGRESS");
});

test("IT system inventory survives editing and does not claim external provisioning", async ({ page, request }) => {
  const actor = await account(request, "it", ["it.write"]);
  await login(page, actor);
  await page.goto(`/workspace/${actor.workspace_key}/systems`);
  await page.getByRole("button", { name: "Tambah Sistem & Aplikasi", exact: true }).click();
  const system = await saveRecord(page, "Sistem & Aplikasi", "/it/systems", { system_code: "UAT-SYSTEM", name: "Sistem Uji", criticality: "HIGH" }, ["criticality"]);
  await page.getByRole("dialog").getByRole("button", { name: "Ubah Sistem & Aplikasi", exact: true }).click();
  await saveRecord(page, "Sistem & Aplikasi", `/it/systems/${system.system_id}`, { name: "Sistem Uji Diperbarui" }, [], true);
  await closeDetail(page);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: "Sistem Uji Diperbarui" })).toBeVisible();
  expect((await api(page, "get", `/it/systems/${system.system_id}`)).criticality).toBe("HIGH");
});

test("Sales booking requires independent approval and explicit one-time execution", async ({ page, request, browser }) => {
  const actor = await account(request, "sales", ["sales.write", "property.read", "property.write", "approval.request", "approval.approve"]);
  const reviewer = await coworker(request, actor, ["sales.read", "approval.read", "approval.approve", "work.read"]);
  await login(page, actor);
  const customer = await api(page, "post", "/sales/customers", { customer_code: "UAT-BOOKING-C", name: "Pelanggan Booking UAT" });
  const unit = await api(page, "post", "/property/property-units", { unit_code: "UAT-BOOKING-U", unit_name: "Unit Booking UAT" });
  await page.goto(`/workspace/${actor.workspace_key}/bookings`);
  await page.getByRole("button", { name: "Tambah Booking", exact: true }).click();
  const booking = await saveRecord(page, "Booking", "/sales/bookings", { customer_id: String(customer.customer_id), property_unit_id: String(unit.property_unit_id), booking_date: "2026-10-04", amount: "10.25" }, ["customer_id", "property_unit_id"]);
  expect(booking.status).toBe("PENDING");
  const denied = await page.request.post(`${bff}/sales/bookings/${booking.booking_id}/transition`, { data: { status: "CONFIRMED" } });
  expect(denied.status()).toBe(409);
  const approval = await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Minta Persetujuan Dikonfirmasi", exact: true }), "/approvals", 201);
  expect(approval.status).toBe("PENDING");
  const self = await page.request.post(`${bff}/approvals/${approval.approval_id}/approve`, { data: {} });
  expect(self.status()).toBe(403);
  const pending = await page.request.post(`${bff}/sales/bookings/${booking.booking_id}/transition`, { data: { status: "CONFIRMED", approval_id: approval.approval_id } });
  expect(pending.status()).toBe(409);
  await expect(page.getByRole("dialog").getByRole("button", { name: "Jalankan Tindakan Dikonfirmasi", exact: true })).toHaveCount(0);
  const reviewContext = await browser.newContext({ baseURL: webURL });
  try {
    const reviewPage = await reviewContext.newPage();
    await login(reviewPage, reviewer);
    await reviewPage.goto(`/workspace/${actor.workspace_key}/approvals/${approval.approval_id}`);
    const approved = await clickMutation(reviewPage, reviewPage.getByRole("button", { name: "Setujui", exact: true }), `/approvals/${approval.approval_id}/approve`);
    expect(approved.status).toBe("APPROVED");
    expect((await api(page, "get", `/sales/bookings/${booking.booking_id}`)).status).toBe("PENDING");
    await page.reload();
    const bookingRow = page.getByRole("table", { name: "Daftar Booking" }).getByRole("row").filter({ has: page.getByRole("button", { name: "Lihat detail", exact: true }) }).first();
    await bookingRow.getByRole("button", { name: "Lihat detail", exact: true }).click();
    const confirmed = await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Jalankan Tindakan Dikonfirmasi", exact: true }), `/sales/bookings/${booking.booking_id}/transition`);
    expect(confirmed.status).toBe("CONFIRMED");
    expect((await api(page, "get", `/approvals/${approval.approval_id}`)).consumed_at).toBeTruthy();
    const replay = await page.request.post(`${bff}/sales/bookings/${booking.booking_id}/transition`, { data: { status: "CONFIRMED", approval_id: approval.approval_id } });
    expect(replay.status()).toBe(409);
  } finally { await reviewContext.close(); }
});

test("Shared Work enforces task dependencies and hides cross-workspace records", async ({ page, request, browser }) => {
  const actor = await account(request, "sales", ["project.create", "task.create", "task.complete", "task.update"]);
  await login(page, actor);
  const project = await api(page, "post", "/projects", { code: "UAT-PROJECT", name: "Proyek Ketergantungan UAT" });
  const task = await api(page, "post", "/tasks", { title: "Tugas akhir UAT", project_id: project.project_id });
  const blocker = await api(page, "post", "/tasks", { title: "Prasyarat UAT" });
  await api(page, "post", `/tasks/${task.task_id}/dependencies`, { blocked_by_task_id: blocker.task_id }, 200);
  await page.goto(`/workspace/${actor.workspace_key}/tasks/${task.task_id}`);
  await page.getByRole("button", { name: "Selesaikan Tugas", exact: true }).click();
  await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Selesaikan", exact: true }), `/tasks/${task.task_id}/complete`, 409);
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
  expect((await api(page, "get", `/tasks/${task.task_id}`)).status).not.toBe("COMPLETED");
  await page.getByRole("dialog").getByRole("button", { name: "Batal", exact: true }).click();
  for (const item of [blocker, task]) {
    await page.goto(`/workspace/${actor.workspace_key}/tasks/${item.task_id}`);
    await page.getByRole("button", { name: "Selesaikan Tugas", exact: true }).click();
    expect((await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Selesaikan", exact: true }), `/tasks/${item.task_id}/complete`)).status).toBe("COMPLETED");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  expect((await api(page, "get", `/projects/${project.project_id}`)).progress_percentage).toBe(100);
  const outsider = await account(request, "sales", ["task.complete"]);
  const foreignContext = await browser.newContext({ baseURL: webURL });
  try {
    const foreignPage = await foreignContext.newPage();
    await login(foreignPage, outsider);
    expect((await foreignPage.request.get(`${bff}/tasks/${task.task_id}`)).status()).toBe(404);
    expect((await foreignPage.request.post(`${bff}/tasks/${task.task_id}/complete`)).status()).toBe(404);
    expect((await api(page, "get", `/tasks/${task.task_id}`)).status).toBe("COMPLETED");
  } finally { await foreignContext.close(); }
});

async function documentInformation(page: Page, title: string) {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Lanjut", exact: true }).click();
  await dialog.getByLabel("Judul", { exact: false }).fill(title);
  await dialog.getByLabel("Kategori", { exact: false }).fill("UAT_ONLY");
  await dialog.getByRole("button", { name: "Lanjut", exact: true }).click();
  await dialog.getByLabel("Klasifikasi Data", { exact: false }).selectOption("INTERNAL");
  await dialog.getByRole("button", { name: "Lanjut", exact: true }).click();
}

test("Document metadata without a file saves once and closes the creation form", async ({ page, request }) => {
  const actor = await account(request, "sales", ["document.create", "document.review"]);
  await login(page, actor);
  await page.goto(`/workspace/${actor.workspace_key}/documents`);
  await page.getByRole("button", { name: "Tambah Dokumen", exact: true }).click();
  const title = `Metadata UAT ${randomUUID().slice(0, 8)}`;
  await documentInformation(page, title);
  const document = await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Simpan Dokumen", exact: true }), "/documents", 201);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: title })).toBeVisible();
  const documents = await api<RecordData[]>(page, "get", "/documents");
  expect(documents.filter(item => item.title === title)).toHaveLength(1);
  await page.goto(`/workspace/${actor.workspace_key}/documents/${document.document_id}`);
  await expect(page.getByRole("button", { name: "Ajukan Review", exact: true })).toBeDisabled();
  expect((await page.request.post(`${bff}/documents/${document.document_id}/review`)).status()).toBe(409);
});

test("Uploaded document is processed by the worker, hash verified and independently approved", async ({ page, request, browser }) => {
  test.setTimeout(120_000);
  const actor = await account(request, "sales", ["document.create", "document.version", "document.review", "document.approve"]);
  const reviewer = await coworker(request, actor, ["document.read", "document.approve", "work.read", "project.read"]);
  await login(page, actor);
  await page.goto(`/workspace/${actor.workspace_key}/documents`);
  await page.getByRole("button", { name: "Tambah Dokumen", exact: true }).click();
  const bytes = Buffer.from("Dokumen uji terisolasi. Nilai fixture: 10.25. Bukan data operasional perusahaan.\n", "utf8");
  await page.locator("#document-file").setInputFiles({ name: "audit-business.txt", mimeType: "text/plain", buffer: bytes });
  await documentInformation(page, "Berkas UAT Terisolasi");
  const uploaded = page.waitForResponse(result => result.request().method() === "POST" && result.url().includes("/uploads?"));
  const document = await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Simpan Dokumen", exact: true }), "/documents", 201);
  const uploadResponse = await uploaded;
  expect(uploadResponse.status(), await uploadResponse.text()).toBe(202);
  const upload = await uploadResponse.json() as RecordData;
  await expect(page.getByRole("dialog").getByText("Versi siap diperiksa", { exact: true })).toBeVisible({ timeout: 60_000 });
  await page.getByRole("dialog").getByRole("button", { name: "Kembali ke Dokumen", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const versions = await api<RecordData[]>(page, "get", `/documents/${document.document_id}/versions`);
  expect(versions).toHaveLength(1);
  expect(versions[0].content_hash).toBe(`sha256:${createHash("sha256").update(bytes).digest("hex")}`);
  expect(versions[0].version).toBe("1");
  // Extraction is not publication: drafts cannot be consumed as business evidence.
  expect((await page.request.get(`${bff}/documents/${document.document_id}/content`)).status()).toBe(409);
  await page.goto(`/workspace/${actor.workspace_key}/documents/${document.document_id}`);
  const reviewed = await clickMutation(page, page.getByRole("button", { name: "Ajukan Review", exact: true }), `/documents/${document.document_id}/review`);
  expect(reviewed.status).toBe("IN_REVIEW");
  await expect(page.getByRole("button", { name: "Setujui", exact: true })).toHaveCount(0);
  expect((await page.request.post(`${bff}/documents/${document.document_id}/approve`)).status()).toBe(403);
  const reviewContext = await browser.newContext({ baseURL: webURL });
  try {
    const reviewPage = await reviewContext.newPage();
    await login(reviewPage, reviewer);
    await reviewPage.goto(`/workspace/${actor.workspace_key}/documents/${document.document_id}`);
    const approved = await clickMutation(reviewPage, reviewPage.getByRole("button", { name: "Setujui", exact: true }), `/documents/${document.document_id}/approve`);
    expect(approved.status).toBe("APPROVED");
    await page.reload();
    expect((await api(page, "get", `/documents/${document.document_id}`)).status).toBe("APPROVED");
    expect((await api<RecordData[]>(page, "get", `/documents/${document.document_id}/versions`))[0].content_hash).toBe(versions[0].content_hash);
    const content = await api(page, "get", `/documents/${document.document_id}/content`);
    expect(content.data_classification).toBe("INTERNAL");
    expect(content.instruction_authority).toBe(false);
    expect(content.content).toContain("Bukan data operasional perusahaan");
  } finally { await reviewContext.close(); }
  const outsider = await account(request, "sales", ["document.version"]);
  const foreignContext = await browser.newContext({ baseURL: webURL });
  try {
    const foreignPage = await foreignContext.newPage();
    await login(foreignPage, outsider);
    for (const path of [`/documents/${document.document_id}`, `/documents/${document.document_id}/content`, `/documents/uploads/${upload.upload_id}`]) {
      expect((await foreignPage.request.get(`${bff}${path}`)).status()).toBe(404);
    }
  } finally { await foreignContext.close(); }
});

test("Permission refs without an authorized division role cannot grant Sales access", async ({ page, request, browser }) => {
  const actor = await account(request, "sales", ["sales.write"]);
  // Division roles receive domain writes by policy. Executive reads its own projections;
  // supplying a Sales permission string alone must not authorize division CRUD.
  const reader = await coworker(request, actor, ["sales.read", "work.read"], "EXECUTIVE");
  await login(page, actor);
  const customer = await api(page, "post", "/sales/customers", { customer_code: "UAT-READ-ONLY", name: "Pelanggan Hak Baca" });
  const readerContext = await browser.newContext({ baseURL: webURL });
  try {
    const readerPage = await readerContext.newPage();
    await login(readerPage, reader);
    await readerPage.goto(`/workspace/${actor.workspace_key}/leads`);
    await expect(readerPage.getByRole("row").filter({ hasText: "Pelanggan Hak Baca" })).toHaveCount(0);
    await expect(readerPage.getByRole("button", { name: "Tambah Customer", exact: true })).toHaveCount(0);
    expect((await readerPage.request.get(`${bff}/sales/customers/${customer.customer_id}`)).status()).toBe(403);
    const denied = await readerPage.request.patch(`${bff}/sales/customers/${customer.customer_id}`, { data: { name: "Forged" } });
    expect(denied.status()).toBe(403);
    expect((await api(page, "get", `/sales/customers/${customer.customer_id}`)).name).toBe("Pelanggan Hak Baca");
  } finally { await readerContext.close(); }
});

test("Editing an approved booking invalidates the old decision and requires a fresh review", async ({ page, request, browser }) => {
  const actor = await account(request, "sales", ["sales.write", "property.read", "property.write", "approval.request"]);
  const reviewer = await coworker(request, actor, ["approval.read", "approval.approve", "work.read"]);
  await login(page, actor);
  const customer = await api(page, "post", "/sales/customers", { customer_code: "UAT-STALE-C", name: "Pelanggan Stale UAT" });
  const unit = await api(page, "post", "/property/property-units", { unit_code: "UAT-STALE-U" });
  const booking = await api(page, "post", "/sales/bookings", { customer_id: customer.customer_id, property_unit_id: unit.property_unit_id, booking_date: "2026-10-04", amount: "10.25" });
  async function openBooking() {
    await page.goto(`/workspace/${actor.workspace_key}/bookings`);
    await page.getByRole("table", { name: "Daftar Booking" }).getByRole("button", { name: "Lihat detail", exact: true }).click();
  }
  await openBooking();
  const old = await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Minta Persetujuan Dikonfirmasi", exact: true }), "/approvals", 201);
  const reviewContext = await browser.newContext({ baseURL: webURL });
  try {
    const reviewPage = await reviewContext.newPage();
    await login(reviewPage, reviewer);
    async function approve(approval: RecordData) {
      await reviewPage.goto(`/workspace/${actor.workspace_key}/approvals/${approval.approval_id}`);
      expect((await clickMutation(reviewPage, reviewPage.getByRole("button", { name: "Setujui", exact: true }), `/approvals/${approval.approval_id}/approve`)).status).toBe("APPROVED");
    }
    await approve(old);
    await openBooking();
    await page.getByRole("dialog").getByRole("button", { name: "Ubah Booking", exact: true }).click();
    const edited = await saveRecord(page, "Booking", `/sales/bookings/${booking.booking_id}`, { booking_date: "2026-10-05" }, [], true);
    expect(edited.booking_date).toBe("2026-10-05");
    await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Jalankan Tindakan Dikonfirmasi", exact: true }), `/sales/bookings/${booking.booking_id}/transition`, 409);
    await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
    expect((await api(page, "get", `/sales/bookings/${booking.booking_id}`)).status).toBe("PENDING");
    expect((await api(page, "get", `/approvals/${old.approval_id}`)).consumed_at).toBeNull();
    const fresh = await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Minta Persetujuan Baru Dikonfirmasi", exact: true }), "/approvals", 201);
    expect(fresh.approval_id).not.toBe(old.approval_id);
    await approve(fresh);
    await openBooking();
    expect((await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Jalankan Tindakan Dikonfirmasi", exact: true }), `/sales/bookings/${booking.booking_id}/transition`)).status).toBe("CONFIRMED");
    expect((await api(page, "get", `/approvals/${old.approval_id}`)).consumed_at).toBeNull();
    expect((await api(page, "get", `/approvals/${fresh.approval_id}`)).consumed_at).toBeTruthy();
  } finally { await reviewContext.close(); }
});

test("DOCX ingestion and version uploads are immutable, idempotent and retain lineage", async ({ page, request }) => {
  test.setTimeout(120_000);
  const actor = await account(request, "sales", ["document.create", "document.version"]);
  await login(page, actor);
  const document = await api(page, "post", "/documents", { title: "DOCX UAT Sintetis", category: "UAT_ONLY", data_classification: "INTERNAL" });
  await page.goto(`/workspace/${actor.workspace_key}/documents/${document.document_id}`);
  await page.getByRole("tab", { name: "Versi", exact: true }).click();
  // A minimal, static OpenXML fixture with three members and explicit synthetic text.
  const docx = Buffer.from(readFileSync("e2e/fixtures/document.base64", "utf8").trim(), "base64");
  const mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const uploadPath = `/documents/${document.document_id}/uploads`;
  await page.locator(`#file-${document.document_id}`).setInputFiles({ name: "uat.docx", mimeType: mime, buffer: docx });
  await page.locator(`#version-${document.document_id}`).fill("1");
  const first = await clickMutation(page, page.getByRole("button", { name: "Unggah Berkas", exact: true }), uploadPath, 202);
  await expect.poll(async () => (await api(page, "get", `/documents/uploads/${first.upload_id}`)).status, { timeout: 60_000 }).toBe("SUCCEEDED");
  await expect(page.getByText("Versi siap diperiksa", { exact: true })).toBeVisible();
  const duplicate = await page.request.post(`${bff}${uploadPath}?filename=uat.docx&version=1`, { data: docx, headers: { "Content-Type": mime } });
  expect(duplicate.status(), await duplicate.text()).toBe(202);
  expect((await duplicate.json() as RecordData).upload_id).toBe(first.upload_id);
  const changed = await page.request.post(`${bff}${uploadPath}?filename=changed.txt&version=1`, { data: Buffer.from("Different fixture"), headers: { "Content-Type": "text/plain" } });
  expect(changed.status()).toBe(409);
  const before = await api<RecordData[]>(page, "get", `/documents/${document.document_id}/versions`);
  expect(before).toHaveLength(1);
  expect(before[0].content_hash).toBe(`sha256:${createHash("sha256").update(docx).digest("hex")}`);
  const bytes = Buffer.from("Versi kedua fixture. Bukan data perusahaan.", "utf8");
  await page.locator(`#file-${document.document_id}`).setInputFiles({ name: "uat-v2.txt", mimeType: "text/plain", buffer: bytes });
  await page.locator(`#version-${document.document_id}`).fill("2");
  const second = await clickMutation(page, page.getByRole("button", { name: "Unggah Berkas", exact: true }), uploadPath, 202);
  await expect.poll(async () => (await api(page, "get", `/documents/uploads/${second.upload_id}`)).status, { timeout: 60_000 }).toBe("SUCCEEDED");
  const after = await api<RecordData[]>(page, "get", `/documents/${document.document_id}/versions`);
  expect(after).toHaveLength(2);
  expect(after[0].version).toBe("2");
  expect(after[0].content_hash).toBe(`sha256:${createHash("sha256").update(bytes).digest("hex")}`);
  expect(after[1]).toEqual(before[0]);
  expect(after[0].source_id).not.toBe(after[1].source_id);
  await page.reload();
  expect((await api(page, "get", `/documents/${document.document_id}`)).current_version).toBe("2");
});

test("Reports and findings require independent review and explicit publishing or closure", async ({ page, request, browser }) => {
  test.setTimeout(120_000);
  const actor = await account(request, "sales", ["report.read", "report.create", "report.review", "finding.read", "finding.create", "finding.update", "finding.verify", "task.create", "task.complete"]);
  const reviewer = await coworker(request, actor, ["report.read", "report.review", "finding.read", "finding.verify", "work.read"]);
  const publisher = await coworker(request, actor, ["report.read", "report.publish", "report.archive", "finding.read", "finding.close", "work.read"]);
  await login(page, actor);
  await page.goto(`/workspace/${actor.workspace_key}/reports`);
  await page.getByRole("button", { name: "Tambah Laporan", exact: true }).click();
  await page.getByRole("dialog").getByLabel("Nama Laporan", { exact: false }).fill("Laporan UAT Sintetis");
  await page.getByRole("dialog").getByLabel("Jenis Laporan", { exact: false }).selectOption("OPERATIONAL");
  const report = await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Simpan Laporan", exact: true }), "/work/reports/results", 201);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const reportPath = `/work/reports/results/${report.report_id}`;
  await page.goto(`/workspace/${actor.workspace_key}/reports/${report.report_id}`);
  expect((await clickMutation(page, page.getByRole("button", { name: "Ajukan Review", exact: true }), `${reportPath}/submit-review`)).status).toBe("IN_REVIEW");
  expect((await page.request.post(`${bff}${reportPath}/review`)).status()).toBe(403);
  const reviewContext = await browser.newContext({ baseURL: webURL });
  const publishContext = await browser.newContext({ baseURL: webURL });
  try {
    const reviewPage = await reviewContext.newPage();
    const publishPage = await publishContext.newPage();
    await login(reviewPage, reviewer);
    await login(publishPage, publisher);
    await reviewPage.goto(`/workspace/${actor.workspace_key}/reports/${report.report_id}`);
    expect((await clickMutation(reviewPage, reviewPage.getByRole("button", { name: "Setujui Laporan", exact: true }), `${reportPath}/review`)).status).toBe("APPROVED");
    expect((await page.request.post(`${bff}${reportPath}/publish`)).status()).toBe(403);
    await publishPage.goto(`/workspace/${actor.workspace_key}/reports/${report.report_id}`);
    const published = await clickMutation(publishPage, publishPage.getByRole("button", { name: "Terbitkan", exact: true }), `${reportPath}/publish`);
    expect(published.status).toBe("PUBLISHED");
    expect(published.published_at).toBeTruthy();
    expect((await clickMutation(publishPage, publishPage.getByRole("button", { name: "Arsipkan", exact: true }), `${reportPath}/archive`)).status).toBe("ARCHIVED");
    const task = await api(page, "post", "/tasks", { title: "Tindakan korektif UAT" });
    await page.goto(`/workspace/${actor.workspace_key}/findings`);
    await page.getByRole("button", { name: "Tambah Temuan", exact: true }).click();
    await page.getByRole("dialog").getByLabel("Judul Temuan", { exact: false }).fill("Temuan UAT Sintetis");
    const corrective = page.getByRole("dialog").getByLabel("Tugas Tindak Lanjut", { exact: true });
    await expect(corrective.locator(`option[value="${task.task_id}"]`)).toHaveCount(1);
    await corrective.selectOption(String(task.task_id));
    const finding = await clickMutation(page, page.getByRole("dialog").getByRole("button", { name: "Simpan Temuan", exact: true }), "/work/findings", 201);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const findingPath = `/work/findings/${finding.finding_id}`;
    await page.goto(`/workspace/${actor.workspace_key}/findings/${finding.finding_id}`);
    expect((await clickMutation(page, page.getByRole("button", { name: "Mulai Tindak Lanjut", exact: true }), `${findingPath}/start`)).status).toBe("IN_PROGRESS");
    expect((await clickMutation(page, page.getByRole("button", { name: "Ajukan Verifikasi", exact: true }), `${findingPath}/submit-verification`)).status).toBe("PENDING_VERIFICATION");
    expect((await page.request.post(`${bff}${findingPath}/verify`)).status()).toBe(403);
    await reviewPage.goto(`/workspace/${actor.workspace_key}/findings/${finding.finding_id}`);
    await clickMutation(reviewPage, reviewPage.getByRole("button", { name: "Verifikasi", exact: true }), `${findingPath}/verify`, 409);
    await expect(reviewPage.getByRole("alert").filter({ hasText: "Selesaikan tugas tindakan korektif" })).toBeVisible();
    expect((await api(page, "get", findingPath)).status).toBe("PENDING_VERIFICATION");
    await api(page, "post", `/tasks/${task.task_id}/complete`, undefined, 200);
    expect((await clickMutation(reviewPage, reviewPage.getByRole("button", { name: "Verifikasi", exact: true }), `${findingPath}/verify`)).status).toBe("VERIFIED");
    await publishPage.goto(`/workspace/${actor.workspace_key}/findings/${finding.finding_id}`);
    expect((await clickMutation(publishPage, publishPage.getByRole("button", { name: "Tutup Temuan", exact: true }), `${findingPath}/close`)).status).toBe("CLOSED");
    expect((await api(page, "get", reportPath)).status).toBe("ARCHIVED");
    expect((await api(page, "get", findingPath)).status).toBe("CLOSED");
  } finally { await reviewContext.close(); await publishContext.close(); }
});
