import { render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { ConnectionStatus } from "@/components/feedback/connection-status";

const originalBaseUrl = process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;

afterEach(() => {
  if (originalBaseUrl === undefined) delete process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;
  else process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = originalBaseUrl;
});

it("menampilkan explicit not-configured state tanpa fake fallback", () => {
  delete process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;
  render(<ConnectionStatus />);

  expect(screen.getByText("Backend belum dikonfigurasi")).toBeInTheDocument();
  expect(screen.getByText("Atur NEXT_PUBLIC_ALOS_API_BASE_URL.")).toBeInTheDocument();
});
