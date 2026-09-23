import { describe, expect, it } from "vitest";

import { canGenesisReadDocument } from "@/features/genesis-workspace/document-analysis";
import type { DocumentRecord } from "@/features/documents/policy";

function document(overrides: Partial<DocumentRecord>): DocumentRecord {
  return {
    document_id: "document-1",
    organization_id: "organization-1",
    workspace_id: "workspace-1",
    division_code: null,
    genesis_conversation_id: null,
    genesis_upload_id: null,
    title: "SOP Operasional",
    category: "SOP",
    classification: "INTERNAL",
    origin: "MANUAL",
    status: "APPROVED",
    owner_user_id: "user-1",
    created_by_user_id: "user-1",
    version_number: 1,
    created_at: "2026-09-06T00:00:00Z",
    updated_at: "2026-09-06T00:00:00Z",
    ...overrides,
  };
}

describe("Genesis document sources", () => {
  it("allows approved and active INTERNAL canonical documents only", () => {
    expect(canGenesisReadDocument(document({ status: "APPROVED" }))).toBe(true);
    expect(canGenesisReadDocument(document({ status: "ACTIVE" }))).toBe(true);
    expect(canGenesisReadDocument(document({ status: "DRAFT" }))).toBe(false);
    expect(canGenesisReadDocument(document({ classification: "CONFIDENTIAL" }))).toBe(false);
    expect(canGenesisReadDocument(document({ classification: "RESTRICTED" }))).toBe(false);
  });

  it("does not read Genesis-generated drafts as source documents", () => {
    expect(canGenesisReadDocument(document({ origin: "GENESIS" }))).toBe(false);
  });
});
