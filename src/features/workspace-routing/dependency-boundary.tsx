"use client";

import type { ReactNode } from "react";

import { getBackendBaseUrl } from "@/lib/api";

export function DependencyBoundary({
  children,
  dependencies,
}: Readonly<{ children: ReactNode; dependencies: readonly string[] }>) {
  if (getBackendBaseUrl()) return children;

  return (
    <section className="panel workspace-panel dependency-unavailable-state" role="status">
      <p className="eyebrow">DEPENDENCY STATUS</p>
      <h2>Backend belum dikonfigurasi</h2>
      <p>
        UI tersedia, tetapi tidak akan memakai mock sebagai state authoritative.
        Atur <code>NEXT_PUBLIC_ALOS_API_BASE_URL</code> ke ALOS Backend untuk mengaktifkannya.
      </p>
      <p>Dependency API: {dependencies.join(", ")}</p>
    </section>
  );
}
