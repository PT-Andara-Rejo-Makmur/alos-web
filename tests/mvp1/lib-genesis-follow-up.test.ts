import { describe, expect, it } from "vitest";

import {
  followUpMessages,
  genesisFollowUpFailureTitle,
  genesisFollowUpLoadingText,
  isGenesisFollowUpFailure,
  optimisticDirectorMessage,
  rollbackOptimisticMessage,
  settleFollowUpMessages,
  type GenesisFollowUpResponse,
  type GenesisHistoryMessage,
} from "@/features/mvp1/lib/genesis-follow-up";

const initialPrompt = "Analisa dokumen ini.";

function message(
  id: string,
  actorKind: "HUMAN" | "SYSTEM",
  content: string,
): GenesisHistoryMessage {
  return {
    message_id: id,
    conversation_id: "conversation-1",
    actor_kind: actorKind,
    actor_user_id: actorKind === "HUMAN" ? "director-1" : null,
    system_actor: actorKind === "SYSTEM" ? "GENESIS" : null,
    content,
    created_at: "2026-09-07T00:00:00Z",
  };
}

function response(): GenesisFollowUpResponse {
  return {
    status: "SUCCEEDED",
    correlation_id: "correlation-1",
    idempotent_replay: false,
    workflow: { workflow_id: "workflow-1", status: "ANALYSIS_DRAFT" },
    source: {
      document_id: "document-1",
      title: "SOP",
      version_number: 1,
      content_sha256: "a".repeat(64),
      classification: "INTERNAL",
    },
    human_message: message("human-2", "HUMAN", "Prioritaskan owner."),
    genesis_message: message("system-2", "SYSTEM", "Owner menjadi prioritas."),
    model_execution: {
      follow_up_run_id: "run-1",
      provider: "openai",
      model: "test-model",
      input_tokens: 10,
      output_tokens: 5,
      latency_milliseconds: 10,
      estimated_cost_usd: "0.001",
      history_turns_included: 1,
      estimated_context_tokens: 100,
    },
  };
}

describe("Genesis follow-up chat state", () => {
  it("shows an optimistic Director bubble while Genesis is loading", () => {
    const optimistic = optimisticDirectorMessage(
      "conversation-1",
      "correlation-1",
      "Prioritaskan owner.",
    );

    expect(optimistic.actor_kind).toBe("HUMAN");
    expect(optimistic.message_id).toBe("pending-correlation-1");
    expect(genesisFollowUpLoadingText).toBe("Genesis sedang menganalisis…");
  });

  it("replaces the optimistic bubble with persisted HUMAN and SYSTEM messages", () => {
    const optimistic = optimisticDirectorMessage(
      "conversation-1",
      "correlation-1",
      "Prioritaskan owner.",
    );
    const settled = settleFollowUpMessages([optimistic], "correlation-1", response());

    expect(settled.map((item) => item.actor_kind)).toEqual(["HUMAN", "SYSTEM"]);
    expect(settled.some((item) => item.message_id.startsWith("pending-"))).toBe(false);
  });

  it("restores both sides of the conversation and hides only the initial prompt", () => {
    const restored = followUpMessages([
      message("human-1", "HUMAN", initialPrompt),
      response().human_message,
      response().genesis_message,
    ], initialPrompt);

    expect(restored.map((item) => item.actor_kind)).toEqual(["HUMAN", "SYSTEM"]);
  });

  it("distinguishes BLOCKED from FAILED and rolls back failed optimism", () => {
    const blocked = {
      status: "BLOCKED",
      correlation_id: "correlation-1",
      error: { code: "CONTEXT_LIMIT_EXCEEDED", message: "Konteks terlalu besar." },
    };
    const failed = { ...blocked, status: "FAILED" };
    const optimistic = optimisticDirectorMessage("conversation-1", "correlation-1", "Arah");

    expect(isGenesisFollowUpFailure(blocked)).toBe(true);
    expect(isGenesisFollowUpFailure(failed)).toBe(true);
    expect(genesisFollowUpFailureTitle("BLOCKED")).not.toBe(
      genesisFollowUpFailureTitle("FAILED"),
    );
    expect(rollbackOptimisticMessage([optimistic], "correlation-1")).toEqual([]);
  });
});


