"use client";

import { useEffect, useState } from "react";

import { GenesisChat } from "@/features/mvp1/components/genesis-chat";
import type { SessionActor } from "@/features/mvp1/lib/governance";
import { Mvp1MigrationBoundary } from "@/features/mvp1/migration-boundary";
import { apiMessage, apiRequest } from "@/lib/api";

export function AraMvp1Workspace() {
  return (
    <Mvp1MigrationBoundary
      dependencies={[
        "GET /api/v1/whoami",
        "/api/v1/genesis/conversations",
        "/api/v1/genesis/context-options",
        "/api/v1/agents",
      ]}
    >
      <ActorBoundAra />
    </Mvp1MigrationBoundary>
  );
}

function ActorBoundAra() {
  const [actor, setActor] = useState<SessionActor | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void apiRequest<SessionActor>("/api/v1/whoami", { signal: controller.signal })
      .then(setActor)
      .catch((failure: unknown) => setError(apiMessage(failure)));
    return () => controller.abort();
  }, []);

  if (error) return <p className="alos-error" role="alert">{error}</p>;
  if (!actor) return <p className="alos-loading-shell">Memuat workspace ARA dari Backend…</p>;
  return <GenesisChat actor={actor} />;
}
