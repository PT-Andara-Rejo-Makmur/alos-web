"use client";

import { useEffect, useState } from "react";

import { GenesisChat } from "@/features/genesis-workspace/conversation-workspace";
import { loadSessionActor, type SessionActor } from "@/features/session";
import { DependencyBoundary } from "@/features/workspace-routing/dependency-boundary";
import { apiMessage } from "@/lib/api";

import { AraContextPanel } from "./ara-context-panel";

export function AraWorkspace() {
  return (
    <DependencyBoundary
      dependencies={[
        "GET /api/session",
        "/api/v1/genesis/conversations",
        "/api/v1/genesis/context-options",
        "/api/v1/agents",
      ]}
    >
      <ActorBoundAra />
    </DependencyBoundary>
  );
}

function ActorBoundAra() {
  const [actor, setActor] = useState<SessionActor | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void loadSessionActor(controller.signal)
      .then(setActor)
      .catch((failure: unknown) => setError(apiMessage(failure)));
    return () => controller.abort();
  }, []);

  if (error) return <p className="alos-error" role="alert">{error}</p>;
  if (!actor) return <p className="alos-loading-shell">Memuat workspace ARA dari Backend…</p>;
  return (
    <div className="ara-workspace-layout">
      <AraContextPanel />
      <GenesisChat actor={actor} />
    </div>
  );
}
