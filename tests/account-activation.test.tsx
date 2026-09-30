import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as activate } from "@/app/api/session/activate/route";
import { AccountActivationForm } from "@/features/session/account-activation-form";
import { LoginForm } from "@/features/session/login-form";
import { sessionApiRequest } from "@/lib/api";
import * as api from "@/lib/api";

const replace = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const token = "activation-token-with-sufficient-length";
const originalInternalUrl = process.env.ALOS_BACKEND_INTERNAL_URL;

beforeEach(() => {
  process.env.ALOS_BACKEND_INTERNAL_URL = "http://backend.test";
  window.history.replaceState(null, "", `/activate-account?token=${token}`);
  replace.mockReset();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
  if (originalInternalUrl === undefined) delete process.env.ALOS_BACKEND_INTERNAL_URL;
  else process.env.ALOS_BACKEND_INTERNAL_URL = originalInternalUrl;
});

function fillForm(password = "StrongPass!123", confirmation = "StrongPass!123") {
  fireEvent.change(screen.getByLabelText("Kata Sandi Baru *"), { target: { value: password } });
  fireEvent.change(screen.getByLabelText("Konfirmasi Kata Sandi *"), { target: { value: confirmation } });
  fireEvent.click(screen.getByRole("button", { name: "Aktifkan Akun" }));
}

describe("employee activation", () => {
  it("shows the exact success message on login", () => {
    render(<LoginForm activated />);
    expect(screen.getByRole("status")).toHaveTextContent("Akun berhasil diaktifkan. Silakan masuk ke ALOS.");
  });

  it("sends a valid form only to the same-origin boundary, hides the token, and directs to login", async () => {
    const browserFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ actor_id: "actor_01", activation_state: "ACTIVATED" }), {
      status: 200, headers: { "content-type": "application/json" },
    }));
    const persist = vi.spyOn(Storage.prototype, "setItem");
    vi.stubGlobal("fetch", browserFetch);
    render(<AccountActivationForm />);
    await waitFor(() => expect(window.location.search).toBe(""));
    expect(screen.queryByText(token)).not.toBeInTheDocument();
    fillForm();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?activated=1"));
    expect(browserFetch).toHaveBeenCalledWith("/api/session/activate", expect.objectContaining({
      method: "POST", credentials: "same-origin",
    }));
    expect(persist).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords before a request", async () => {
    const browserFetch = vi.fn();
    vi.stubGlobal("fetch", browserFetch);
    render(<AccountActivationForm />);
    fillForm("StrongPass!123", "DifferentPass!123");
    expect(await screen.findByRole("alert")).toHaveTextContent("Konfirmasi kata sandi tidak cocok.");
    expect(browserFetch).not.toHaveBeenCalled();
  });

  it.each(["invalid", "expired"])("shows a safe error for an %s token", async () => {
    vi.spyOn(api, "sessionApiRequest").mockRejectedValue(new Error("Tautan aktivasi tidak valid atau telah kedaluwarsa."));
    render(<AccountActivationForm />);
    fillForm();
    expect(await screen.findByRole("alert")).toHaveTextContent("Tautan aktivasi tidak valid atau telah kedaluwarsa.");
    expect(replace).not.toHaveBeenCalled();
  });

  it("rejects password mismatch at the server boundary without forwarding", async () => {
    const backendFetch = vi.fn();
    vi.stubGlobal("fetch", backendFetch);
    const response = await activate(new NextRequest("http://web.test/api/session/activate", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password: "StrongPass!123", password_confirmation: "DifferentPass!123" }),
    }));
    expect(response.status).toBe(422);
    expect((await response.json()).code).toBe("PASSWORD_CONFIRMATION_MISMATCH");
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it.each(["invalid", "expired"])("returns a safe boundary error for an %s challenge", async () => {
    const backendFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: "ACTIVATION_CHALLENGE_INVALID", message: "internal credential detail",
    }), { status: 422, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", backendFetch);
    const response = await activate(new NextRequest("http://web.test/api/session/activate", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password: "StrongPass!123", password_confirmation: "StrongPass!123" }),
    }));
    expect(response.status).toBe(422);
    expect((await response.json()).message).toBe("Tautan aktivasi tidak valid atau telah kedaluwarsa.");
  });

  it("forwards activation to Backend without session and returns no session cookie", async () => {
    const backendFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      actor_id: "actor_01", activation_state: "ACTIVATED",
    }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", backendFetch);
    const response = await activate(new NextRequest("http://web.test/api/session/activate", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password: "StrongPass!123", password_confirmation: "StrongPass!123" }),
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ actor_id: "actor_01", activation_state: "ACTIVATED" });
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(backendFetch).toHaveBeenCalledWith("http://backend.test/api/v1/identity/activate", expect.objectContaining({ method: "POST" }));
    const options = backendFetch.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(options.headers).get("authorization")).toBeNull();
  });

  it("keeps a browser helper on the same origin", async () => {
    const browserFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ actor_id: "actor_01", activation_state: "ACTIVATED" }), {
      status: 200, headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", browserFetch);
    await sessionApiRequest("/activate", { method: "POST", body: { token, password: "StrongPass!123", password_confirmation: "StrongPass!123" } });
    expect(browserFetch.mock.calls[0]?.[0]).toBe("/api/session/activate");
  });
});
