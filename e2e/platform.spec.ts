import { randomUUID } from "node:crypto";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const backendURL = process.env.ALOS_E2E_BACKEND_URL ?? "http://127.0.0.1:18000";
const webURL = process.env.ALOS_E2E_WEB_URL ?? "http://127.0.0.1:13000";

test.beforeAll(() => {
  if (process.env.ALOS_E2E_ALLOW_TEST_REGISTRATION !== "1") {
    throw new Error("E2E requires explicit disposable test registration: ALOS_E2E_ALLOW_TEST_REGISTRATION=1");
  }
  for (const address of [backendURL, webURL]) {
    if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(address).hostname)) {
      throw new Error("E2E fixtures may only be registered on a loopback test stack");
    }
  }
});

async function account(request: APIRequestContext, domain: string, extraPermissions: string[] = []) {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const workspaceKey = `audit-${domain}-${suffix}`;
  const shared = ["project.read", "task.read", "task.create", "document.read", "report.read", "finding.read", "approval.read", "work.read"];
  const identity = {
    email: `e2e-${domain}-${suffix}@alos.test`, password: "DisposableTest!2026",
    display_name: `Audit ${domain}`, tenant_id: `tenant_e2e_${suffix}`,
    organization_id: `org_e2e_${suffix}`, workspace_id: `workspace_e2e_${suffix}`,
    workspace_key: workspaceKey, workspace_name: `Audit ${domain}`,
    workspace_type: domain === "executive" ? "EXECUTIVE" : "BUSINESS",
    division_code: domain === "executive" ? null : domain.toUpperCase(),
    role_refs: [domain === "executive" ? "EXECUTIVE" : "DIVISION_LEAD"],
    permission_refs: [domain === "executive" ? "strategy.read" : `${domain}.read`, ...shared, ...extraPermissions],
    scope_refs: ["scope.e2e.business"],
    data_scope: domain === "executive" ? "COMPANY" : "WORKSPACE",
  };
  const registered = await request.post(`${backendURL}/api/v1/auth/register`, { data: identity });
  expect(registered.status(), await registered.text()).toBe(201);
  return { ...identity, workspaceKey };
}

async function login(page: Page, identity: { email: string; password: string }) {
  await page.goto("/login");
  await page.locator("#session-email").fill(identity.email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(identity.password);
  await page.getByRole("button", { name: "Masuk ke ALOS", exact: true }).click();
  await expect(page).toHaveURL(/\/workspace/);
}

for (const domain of ["executive", "sales", "property", "finance", "legal", "hr", "it"]) {
  test(`${domain}: real session, dashboard, Shared Work and responsive layout`, async ({ page, request }, testInfo) => {
    const identity = await account(request, domain);
    const errors: string[] = [];
    const directGenesis: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => {
      const address = new URL(request.url());
      if (address.hostname === "genesis" || address.port === "8100") directGenesis.push(request.url());
    });
    await login(page, identity);
    await page.goto(`/workspace/${identity.workspaceKey}/summary`);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Pilih ruang kerja" })).toBeVisible();
    await expect(page.getByText("Memuat ruang kerja", { exact: false })).toHaveCount(0);
    await expect(page.getByRole("status", { name: /^Memuat/ })).toHaveCount(0);
    await expect(page.getByRole("alert").filter({ hasText: /gagal|tidak dapat|kesalahan/i })).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`${domain}-desktop.png`), fullPage: true });
    await page.goto(`/workspace/${identity.workspaceKey}/tasks`);
    await expect(page.getByRole("heading", { name: "Tugas", exact: true })).toBeVisible();
    await expect(page.getByRole("status", { name: /^Memuat/ })).toHaveCount(0);
    if (domain === "sales") {
      const taskTitle = `Audit pekerjaan ${randomUUID().slice(0, 8)}`;
      await page.getByRole("button", { name: "Tambah Tugas", exact: true }).click();
      await page.getByLabel("Judul Tugas", { exact: false }).fill(taskTitle);
      await page.getByRole("button", { name: "Simpan Tugas", exact: true }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page.getByRole("row").filter({ hasText: taskTitle })).toBeVisible();
      await page.reload();
      await expect(page.getByRole("row").filter({ hasText: taskTitle })).toBeVisible();
    }
    const forged = await page.request.post("/api/backend/api/v1/ara/threads", { data: { tenant_id: "forged" } });
    expect(forged.status()).toBe(422);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("button", { name: "Buka navigasi" })).toBeVisible();
    await page.getByRole("button", { name: "Buka navigasi" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${domain}-mobile.png`), fullPage: true });
    const cookies = await page.context().cookies();
    expect(cookies.some(cookie => cookie.httpOnly && cookie.name.includes("session"))).toBe(true);
    expect(directGenesis).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("Marketing campaign is persisted through its Sales workspace and keeps unknown budget", async ({ page, request }) => {
  const identity = await account(request, "sales", ["marketing.read", "marketing.write"]);
  await login(page, identity);
  await page.goto(`/workspace/${identity.workspaceKey}/campaigns`);
  await expect(page.getByRole("heading", { name: "Kampanye & Saluran", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tambah Campaign", exact: true }).click();
  const name = `Kampanye audit ${randomUUID().slice(0, 8)}`;
  await page.getByRole("dialog").getByLabel("Nama", { exact: false }).fill(name);
  await page.getByRole("dialog").getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Detail Campaign", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText(name);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: name })).toBeVisible();
  const result = await page.request.get("/api/backend/api/v1/marketing/campaigns");
  expect(result.status()).toBe(200);
  const campaign = (await result.json()).items.find((item: { name: string }) => item.name === name);
  expect(campaign).toBeDefined();
  expect(campaign.budget).toBeNull();
  expect(campaign.status).toBe("PLANNED");
});

test("Strategy planning in Executive loads canonical tabs and respects Backend authority", async ({ page, request }) => {
  const identity = await account(request, "executive");
  await login(page, identity);
  await page.goto(`/workspace/${identity.workspaceKey}/planning`);
  await expect(page.getByRole("heading", { name: "Rencana & Target", exact: true })).toBeVisible();
  await expect(page.getByRole("status", { name: /^Memuat/ })).toHaveCount(0);
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toHaveCount(0);
  const authorityResult = await page.request.get("/api/backend/api/v1/strategy/authority");
  expect(authorityResult.status()).toBe(200);
  const authority = await authorityResult.json();
  await expect(page.getByRole("button", { name: "Buat Renstra", exact: true }))
    .toHaveCount(authority.authorized_actions.includes("CREATE_COMPANY_PLAN") ? 1 : 0);
  await expect(page.getByRole("heading", { name: "Rencana Strategis (Renstra)", exact: true })).toBeVisible();
  for (const [tab, heading] of [["RKAP", "Rencana Kerja dan Anggaran (RKAP)"], ["Sasaran", "Sasaran Strategis"], ["Target", "Target Kinerja"], ["Asumsi", "Asumsi Perencanaan"]]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toHaveCount(0);
  }
});

test("ARA persists sourced answers and denies inaccessible financial data", async ({ page, request }) => {
  const identity = await account(request, "sales");
  await login(page, identity);
  await page.goto(`/workspace/${identity.workspaceKey}/ara`);
  await expect(page.getByRole("heading", { name: "Tanya ARA" })).toBeVisible();
  await page.getByLabel("Pesan untuk ARA").fill("Tampilkan lead Sales");
  const answer = page.waitForResponse(response => response.request().method() === "POST"
    && response.url().endsWith("/messages"), { timeout: 45_000 });
  await page.getByRole("button", { name: "Kirim pesan", exact: true }).click();
  const result = await answer;
  expect(result.status()).toBe(200);
  expect((await result.json()).response.response_type).toBe("ANSWER");
  await expect(page.getByText("Sumber yang digunakan", { exact: true })).toBeVisible();
  await expect(page.getByRole("log")).toContainText("Belum ada data");
  await expect(page.getByLabel("Pesan untuk ARA")).toBeFocused();
  await page.reload();
  await expect(page.getByText("Sumber yang digunakan", { exact: true })).toBeVisible();
  await page.getByLabel("Pesan untuk ARA").fill("Tampilkan data Finance");
  await page.getByRole("button", { name: "Kirim pesan", exact: true }).click();
  await expect(page.getByText("Informasi belum dapat diakses", { exact: true })).toBeVisible();
});

test("anonymous BFF requests cannot reach business data", async ({ request }) => {
  const result = await request.get(`${webURL}/api/backend/api/v1/finance/overview`);
  expect(result.status()).toBe(401);
  expect(result.headers()["cache-control"]).toContain("no-store");
});
