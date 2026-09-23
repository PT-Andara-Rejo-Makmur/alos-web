import { Suspense } from "react";
import type { Metadata } from "next";

import { AraWorkspacePage } from "@/features/ara-workspace";

export const metadata: Metadata = {
  title: "ARA Workspace | ALOS",
  description:
    "Human + AI collaboration workspace with verified context, evidence, and human authority.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkspaceAraRoute() {
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
      <AraWorkspacePage basePath="/workspace/ara" />
    </Suspense>
  );
}
