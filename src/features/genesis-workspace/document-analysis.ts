import type { DocumentRecord } from "@/features/documents/policy";

export type GenesisDocumentSource = {
  document_id: string;
  title: string;
  version_number: number;
  content_sha256: string;
  status: "APPROVED" | "ACTIVE";
  classification: DocumentRecord["classification"];
};

export type GenesisDocumentAnalysisResult = {
  conversation: {
    conversation_id: string;
    created_at: string;
  };
  source: GenesisDocumentSource;
  analysis: {
    artifact_id: string;
    digest: string;
    content: {
      prompt: string;
      reading: {
        content_characters: number;
        source_bound: boolean;
        source_modified: boolean;
      };
    };
  };
  draft: DocumentRecord;
  workflow: {
    workflow_id: string;
    status: "ANALYSIS_DRAFT";
  };
  semantic: {
    analysis_run_id: string;
    provider: "openai" | "anthropic" | "gemini" | "local" | "fake";
    model: string;
    answer: string;
    input_tokens: number;
    output_tokens: number;
    latency_milliseconds: number;
    estimated_cost_usd: string;
    source_characters: number;
  } | null;
};

export function canGenesisReadDocument(document: DocumentRecord): boolean {
  return document.origin === "MANUAL"
    && document.classification === "INTERNAL"
    && (document.status === "APPROVED" || document.status === "ACTIVE");
}
