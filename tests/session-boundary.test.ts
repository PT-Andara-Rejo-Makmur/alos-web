import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieGet = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: cookieGet }),
}));

import { GET as proxyGet } from "@/app/api/backend/[...path]/route";
import { POST as login } from "@/app/api/session/login/route";
import { authenticatedApiRequest } from "@/lib/api";

const originalInternalUrl = process.env.ALOS_BACKEND_INTERNAL_URL;

beforeEach(() => {
  process.env.ALOS_BACKEND_INTERNAL_URL = "http://backend.test";
  cookieGet.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalInternalUrl === undefined) delete process.env.ALOS_BACKEND_INTERNAL_URL;
  else process.env.ALOS_BACKEND_INTERNAL_URL = originalInternalUrl;
});

describe("same-origin Backend session boundary", () => {
  it("stores the Backend token only in an HttpOnly cookie", async () => {
    const backendFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "backend-secret-token",
          token_type: "bearer",
          principal: { actor_id: "actor_001", display_name: "Reviewer" },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
            "x-correlation-id": "corr_login_001",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", backendFetch);

    const response = await login(
      new NextRequest("http://web.test/api/session/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "reviewer@andara.local", password: "StrongPass!123" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      authenticated: true,
      principal: { actor_id: "actor_001", display_name: "Reviewer" },
    });
    expect(response.headers.get("set-cookie")).toMatch(
      /^alos_backend_session=backend-secret-token;.*HttpOnly.*SameSite=lax/i,
    );
    expect(JSON.stringify(await backendFetch.mock.results[0]?.value)).not.toContain(
      "backend-secret-token",
    );
    expect(backendFetch).toHaveBeenCalledWith(
      "http://backend.test/api/v1/auth/login",
      expect.objectContaining({ method: "POST", redirect: "manual" }),
    );
  });

  it("forwards a protected request with the server-held Backend token", async () => {
    cookieGet.mockReturnValue({ value: "backend-secret-token" });
    const backendFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ domains: [], correlation_id: "corr_proxy_001" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "x-correlation-id": "corr_proxy_001",
        },
      }),
    );
    vi.stubGlobal("fetch", backendFetch);

    const response = await proxyGet(
      new NextRequest("http://web.test/api/backend/api/v1/research/domain-access", {
        headers: { "x-correlation-id": "corr_proxy_001" },
      }),
      { params: Promise.resolve({ path: ["api", "v1", "research", "domain-access"] }) },
    );

    expect(response.status).toBe(200);
    const request = backendFetch.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(request.headers).get("authorization")).toBe(
      "Bearer backend-secret-token",
    );
    expect(new Headers(request.headers).get("x-correlation-id")).toBe("corr_proxy_001");
  });

  it("fails closed before Backend when no session cookie exists", async () => {
    const backendFetch = vi.fn();
    vi.stubGlobal("fetch", backendFetch);

    const response = await proxyGet(
      new NextRequest("http://web.test/api/backend/api/v1/research/domain-access"),
      { params: Promise.resolve({ path: ["api", "v1", "research", "domain-access"] }) },
    );

    expect(response.status).toBe(401);
    expect((await response.json()).code).toBe("AUTHENTICATION_REQUIRED");
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it("routes protected browser requests only through the same-origin BFF", async () => {
    const browserFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ domains: [], correlation_id: "corr_browser_001" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", browserFetch);

    await authenticatedApiRequest("/api/v1/research/domain-access");

    expect(browserFetch).toHaveBeenCalledWith(
      "/api/backend/api/v1/research/domain-access",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });
});
