import { afterEach, describe, expect, it, vi } from "vitest";

import { apiRequest, ApiConfigurationError, ApiRequestError } from "@/lib/api";
import { getLastCorrelationId } from "@/lib/correlation/store";

const originalBaseUrl = process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalBaseUrl === undefined) delete process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;
  else process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = originalBaseUrl;
  window.sessionStorage.clear();
});

describe("Backend API client", () => {
  it("menolak request ketika Backend belum dikonfigurasi", async () => {
    delete process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;

    await expect(apiRequest("/health")).rejects.toBeInstanceOf(ApiConfigurationError);
  });

  it("hanya memakai base URL Backend dan menyimpan correlation ID", async () => {
    process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = "https://backend.alos.test/";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "x-correlation-id": "corr-123" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest<{ status: string }>("/health")).resolves.toEqual({ status: "ok" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.alos.test/health",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(getLastCorrelationId()).toBe("corr-123");
  });

  it("mempertahankan structured error dari Backend", async () => {
    process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = "https://backend.alos.test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "GENESIS_UNAVAILABLE",
            message: "GENESIS transport is unavailable.",
            correlation_id: "corr-error-001",
            retryable: true,
          }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const error = await apiRequest("/api/v1/system/integration").catch(
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({
      code: "GENESIS_UNAVAILABLE",
      status: 503,
      correlationId: "corr-error-001",
      message: "GENESIS transport is unavailable.",
    });
  });
});
