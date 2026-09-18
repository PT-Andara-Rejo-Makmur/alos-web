import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Mvp1MigrationBoundary } from "@/features/mvp1/migration-boundary";

const originalBaseUrl = process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;

afterEach(() => {
  if (originalBaseUrl === undefined) delete process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;
  else process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = originalBaseUrl;
});

describe("MVP-1 migration boundary", () => {
  it("menampilkan disconnected state tanpa fake business data", () => {
    delete process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;
    render(
      <Mvp1MigrationBoundary dependencies={["GET /api/v1/whoami"]}>
        <p>authoritative content</p>
      </Mvp1MigrationBoundary>,
    );

    expect(screen.getByText("Backend belum dikonfigurasi")).toBeInTheDocument();
    expect(screen.getByText(/GET \/api\/v1\/whoami/)).toBeInTheDocument();
    expect(screen.queryByText("authoritative content")).not.toBeInTheDocument();
  });

  it("merender feature hanya ketika base URL Backend tersedia", () => {
    process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = "https://backend.alos.test";
    render(
      <Mvp1MigrationBoundary dependencies={[]}>
        <p>authoritative content</p>
      </Mvp1MigrationBoundary>,
    );

    expect(screen.getByText("authoritative content")).toBeInTheDocument();
  });
});
