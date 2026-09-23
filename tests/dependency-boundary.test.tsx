import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DependencyBoundary } from "@/features/workspace-routing/dependency-boundary";

const originalBaseUrl = process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;

afterEach(() => {
  if (originalBaseUrl === undefined) delete process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;
  else process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = originalBaseUrl;
});

describe("dependency availability boundary", () => {
  it("menampilkan disconnected state tanpa fake business data", () => {
    delete process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;
    render(
      <DependencyBoundary dependencies={["GET /api/v1/whoami"]}>
        <p>authoritative content</p>
      </DependencyBoundary>,
    );

    expect(screen.getByText("Backend belum dikonfigurasi")).toBeInTheDocument();
    expect(screen.getByText(/GET \/api\/v1\/whoami/)).toBeInTheDocument();
    expect(screen.queryByText("authoritative content")).not.toBeInTheDocument();
  });

  it("merender feature hanya ketika base URL Backend tersedia", () => {
    process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = "https://backend.alos.test";
    render(
      <DependencyBoundary dependencies={[]}>
        <p>authoritative content</p>
      </DependencyBoundary>,
    );

    expect(screen.getByText("authoritative content")).toBeInTheDocument();
  });
});
