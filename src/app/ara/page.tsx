import { Suspense } from "react";
import type { Metadata } from "next";

import { AraWorkspacePage } from "@/features/ara-workspace";

export const metadata: Metadata = {
  title: "ARA Workspace (Compatibility) | ALOS",
  description:
    "Compatibility entry for ARA Human + AI Workspace with verified active workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AraCompatibilityPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#141619",
            color: "#c5a572",
            fontFamily: "Manrope, sans-serif",
          }}
        >
          <p>Memuat ARA Workspace...</p>
        </div>
      }
    >
      <AraWorkspacePage basePath="/ara" />
    </Suspense>
  );
}
