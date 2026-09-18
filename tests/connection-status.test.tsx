import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { ConnectionStatus } from "@/components/feedback/connection-status";

const originalBaseUrl = process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalBaseUrl === undefined) delete process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;
  else process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = originalBaseUrl;
});

it("menampilkan explicit not-configured state tanpa fake fallback", () => {
  delete process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;
  render(<ConnectionStatus />);

  expect(screen.getByText("Backend belum dikonfigurasi")).toBeInTheDocument();
  expect(screen.getByText("Atur NEXT_PUBLIC_ALOS_API_BASE_URL.")).toBeInTheDocument();
});

it("menampilkan status integrasi dan correlation ID dari Backend", async () => {
  process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = "https://backend.alos.test";
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          correlation_id: "corr-ui-001",
          status: "connected",
          backend: {
            service: "alos-backend",
            status: "reachable",
            authority: "ALOS_BACKEND",
          },
          genesis: {
            service: "genesis-ai",
            status: "reachable",
            role: "AI_CONTROL_PLANE",
            authoritative_business_state: false,
            provider_required: false,
            correlation_id: "corr-ui-001",
          },
        }),
        { status: 200, headers: { "x-correlation-id": "corr-ui-001" } },
      ),
    ),
  );

  render(<ConnectionStatus />);

  expect(await screen.findByText("Backend dan GENESIS terhubung")).toBeInTheDocument();
  expect(screen.getByText("Correlation: corr-ui-001")).toBeInTheDocument();
});
