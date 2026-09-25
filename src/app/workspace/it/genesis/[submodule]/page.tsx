"use client";

import { use } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { SharedResearchWorkspace } from "@/features/research";
import { FactoryWorkspace } from "@/features/factory";
import { ItReviewProjection } from "@/features/reviews/it-review-projection";
import { getModuleReadiness } from "@/features/workspace-routing";

export default function WorkspaceItGenesisSubmodulePage({
  params,
}: {
  params: Promise<{ submodule: string }>;
}) {
  const { submodule } = use(params);

  return (
    <ProtectedDomainWorkspace
      activeNavKey={submodule}
      deniedTitle="Bukan Otoritas IT / GENESIS"
      divisionCodes={["IT", "TECHNOLOGY"]}
      loadingLabel="Memuat Modul GENESIS IT…"
      workspaceKeys={["it", "technology"]}
    >
      {() => {
        if (submodule === "research") {
          return (
            <div style={{ padding: "1.5rem" }}>
              <SharedResearchWorkspace />
            </div>
          );
        }

        if (submodule === "agents") {
          return (
            <div style={{ padding: "1.5rem" }}>
              <FactoryWorkspace />
              <ItReviewProjection />
            </div>
          );
        }

        const readiness = getModuleReadiness(submodule);
        return (
          <section
            className="panel workspace-panel"
            role="status"
            aria-label={`Modul ${submodule} Belum Tersedia`}
            style={{
              padding: "2.5rem",
              maxWidth: "680px",
              margin: "2rem auto",
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e8e6df",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#fffbeb",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <AlertCircle size={28} />
            </div>
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "4px",
                background: "#fef3c7",
                color: "#92400e",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Belum Tersedia
            </span>
            <h2 style={{ fontSize: "1.25rem", margin: "0 0 8px 0", color: "#141619" }}>
              GENESIS {submodule.replace(/-/g, " ").toUpperCase()}
            </h2>
            <p style={{ color: "#666055", fontSize: "14px", lineHeight: 1.6, margin: "0 0 20px 0" }}>
              Modul teknis ini belum tersedia pada sistem ({readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}).
            </p>
            <Link
              href="/workspace/it/genesis"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "#141619",
                color: "#ffffff",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              ← Kembali ke GENESIS Control Plane
            </Link>
          </section>
        );
      }}
    </ProtectedDomainWorkspace>
  );
}
