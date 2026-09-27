"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Alert, PageHeader } from "@/components/ui";
import { hasExecutiveContext } from "@/features/executive";
import type { SessionProjection } from "@/features/session";
import { sessionApiRequest } from "@/lib/api";

import { WorkEmptyState, type WorkModuleType } from "./empty-states/work-empty-state";
import { WorkLoading } from "./loading/work-loading";

interface ModulePlaceholderProps {
  readonly description: string;
  readonly eyebrow?: string;
  readonly module: WorkModuleType;
  readonly title: string;
  readonly workspaceKey?: string | null;
}

export function ModulePlaceholder({
  description,
  eyebrow = "PEKERJAAN",
  module,
  title,
  workspaceKey,
}: ModulePlaceholderProps) {
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const nextSession = await sessionApiRequest<SessionProjection>("/");
        if (!cancelled) {
          setSession(nextSession);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !session) {
    return <WorkLoading label="Menyiapkan halaman…" />;
  }

  const canOpenExecutive = hasExecutiveContext(session);

  return (
    <AppShell
      navigationSections={navigationForSession(canOpenExecutive, workspaceKey)}
      session={session}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <PageHeader description={description} eyebrow={eyebrow} title={title} />
        <Alert
          icon={<AlertCircle size={18} strokeWidth={2} />}
          message={`Modul ${title} saat ini berstatus "Belum Terhubung". Tabel database telah disiapkan pada migrasi 0013, namun public API Backend sedang dalam tahap perencanaan setelah review modul Proyek.`}
          title={`Modul ${title} — Belum Terhubung`}
          variant="neutral"
        />
        <WorkEmptyState module={module} />
      </div>
    </AppShell>
  );
}
