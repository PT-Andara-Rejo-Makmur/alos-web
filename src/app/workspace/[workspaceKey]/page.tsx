"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

/** The destination itself verifies the Backend-selected Sales workspace. */
export default function SalesWorkspaceRoot({
  params,
}: Readonly<{ params: Promise<{ workspaceKey: string }> }>) {
  const { workspaceKey } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/workspace/${encodeURIComponent(workspaceKey)}/summary`);
  }, [router, workspaceKey]);

  return <main aria-live="polite">Menyiapkan ruang kerja…</main>;
}
