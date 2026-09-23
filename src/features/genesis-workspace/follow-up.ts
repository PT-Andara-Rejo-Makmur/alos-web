export type GenesisHistoryMessage = {
  message_id: string;
  conversation_id: string;
  actor_kind: "HUMAN" | "SYSTEM";
  actor_user_id: string | null;
  system_actor: "GENESIS" | null;
  content: string;
  created_at: string;
};

export type GenesisFollowUpResponse = {
  status: "SUCCEEDED";
  correlation_id: string;
  idempotent_replay: boolean;
  workflow: {
    workflow_id: string;
    status: "ANALYSIS_DRAFT";
  };
  source: {
    document_id: string;
    title: string;
    version_number: number;
    content_sha256: string;
    classification: "INTERNAL";
  };
  human_message: GenesisHistoryMessage;
  genesis_message: GenesisHistoryMessage;
  model_execution: {
    follow_up_run_id: string;
    provider: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    latency_milliseconds: number;
    estimated_cost_usd: string;
    history_turns_included: number;
    estimated_context_tokens: number;
  };
};

export type GenesisFollowUpFailure = {
  status: "BLOCKED" | "FAILED";
  correlation_id: string;
  error: {
    code: string;
    message: string;
  };
};

export const genesisFollowUpLoadingText = "Genesis sedang menganalisis…";

export function genesisFollowUpFailureTitle(
  status: GenesisFollowUpFailure["status"],
): string {
  return status === "BLOCKED" ? "Genesis belum dapat menjawab" : "Balasan Genesis gagal";
}

export function followUpMessages(
  messages: GenesisHistoryMessage[],
  initialPrompt: string,
): GenesisHistoryMessage[] {
  let initialHumanSkipped = false;
  return messages.filter((message) => {
    if (
      !initialHumanSkipped
      && message.actor_kind === "HUMAN"
      && message.content === initialPrompt
    ) {
      initialHumanSkipped = true;
      return false;
    }
    return true;
  });
}

export function optimisticDirectorMessage(
  conversationId: string,
  correlationId: string,
  content: string,
): GenesisHistoryMessage {
  return {
    message_id: `pending-${correlationId}`,
    conversation_id: conversationId,
    actor_kind: "HUMAN",
    actor_user_id: null,
    system_actor: null,
    content,
    created_at: new Date().toISOString(),
  };
}

export function settleFollowUpMessages(
  messages: GenesisHistoryMessage[],
  correlationId: string,
  response: GenesisFollowUpResponse,
): GenesisHistoryMessage[] {
  return [
    ...messages.filter((message) => message.message_id !== `pending-${correlationId}`),
    response.human_message,
    response.genesis_message,
  ];
}

export function rollbackOptimisticMessage(
  messages: GenesisHistoryMessage[],
  correlationId: string,
): GenesisHistoryMessage[] {
  return messages.filter((message) => message.message_id !== `pending-${correlationId}`);
}

export function isGenesisFollowUpFailure(value: unknown): value is GenesisFollowUpFailure {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GenesisFollowUpFailure>;
  return (candidate.status === "BLOCKED" || candidate.status === "FAILED")
    && typeof candidate.correlation_id === "string"
    && Boolean(candidate.error)
    && typeof candidate.error?.code === "string"
    && typeof candidate.error.message === "string";
}
