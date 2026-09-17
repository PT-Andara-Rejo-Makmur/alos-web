"use client";

import { useEffect, useState } from "react";

import { ApiConfigurationError, getBackendBaseUrl, getBackendHealth } from "@/lib/api";

type ConnectionState = "checking" | "connected" | "disconnected" | "not-configured";

export function ConnectionStatus({ compact = false }: Readonly<{ compact?: boolean }>) {
  const [state, setState] = useState<ConnectionState>(
    getBackendBaseUrl() ? "checking" : "not-configured",
  );

  useEffect(() => {
    if (!getBackendBaseUrl()) return;
    const controller = new AbortController();

    getBackendHealth(controller.signal)
      .then(() => setState("connected"))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState(error instanceof ApiConfigurationError ? "not-configured" : "disconnected");
      });

    return () => controller.abort();
  }, []);

  const labels: Record<ConnectionState, { title: string; detail: string }> = {
    checking: { title: "Memeriksa Backend", detail: "Menghubungi authority ALOS…" },
    connected: { title: "Backend terhubung", detail: "Canonical state tersedia." },
    disconnected: { title: "Backend tidak terjangkau", detail: "Tidak ada fallback data lokal." },
    "not-configured": {
      title: "Backend belum dikonfigurasi",
      detail: "Atur NEXT_PUBLIC_ALOS_API_BASE_URL.",
    },
  };

  return (
    <aside className={compact ? "connection-card connection-card--compact" : "connection-card"}>
      <span className={`connection-light connection-light--${state}`} aria-hidden="true" />
      <div>
        <strong>{labels[state].title}</strong>
        <span>{labels[state].detail}</span>
      </div>
    </aside>
  );
}
