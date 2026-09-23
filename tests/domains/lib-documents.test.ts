import { describe, expect, it } from "vitest";

import { canApproveDocument, canCheckDocument, isChecklistComplete, type DocumentDetail } from "@/features/documents/policy";
import type { SessionActor } from "@/features/session";

const actor = (roles: string[], userId = "checker"): SessionActor => ({
  user_id: userId,
  organization_id: "org",
  roles,
  division_codes: [],
  workspace_ids: ["workspace"],
  issued_at: "2026-09-05T00:00:00Z",
  expires_at: "2026-09-05T01:00:00Z",
});

function detail(status: DocumentDetail["document"]["status"]): DocumentDetail {
  return {
    document: {
      document_id: "doc", organization_id: "org", workspace_id: "workspace", division_code: null,
      genesis_conversation_id: null, genesis_upload_id: null, title: "SOP", category: "GENERAL", classification: "INTERNAL",
      origin: "GENESIS", status, owner_user_id: "maker", created_by_user_id: "maker",
      version_number: 1, created_at: "2026-09-05T00:00:00Z", updated_at: "2026-09-05T00:00:00Z",
    },
    content: "Draft", content_sha256: "a".repeat(64), reviews: [],
    checklist: [
      { document_checklist_item_id: "one", check_key: "METADATA", label: "Metadata", check_type: "AUTOMATED", required: true, status: "PASSED", notes: null, completed_by_user_id: null, completed_at: null },
      { document_checklist_item_id: "two", check_key: "EVIDENCE", label: "Evidence", check_type: "HUMAN", required: true, status: "PENDING", notes: null, completed_by_user_id: null, completed_at: null },
    ],
  };
}

describe("document dashboard permissions", () => {
  it("allows the Director to complete normal-document checklist items", () => {
    const document = detail("DRAFT");
    expect(canCheckDocument(actor(["BUSINESS_REVIEWER"]), document)).toBe(true);
    expect(canCheckDocument(actor(["BUSINESS_REVIEWER"], "maker"), document)).toBe(false);
    expect(canCheckDocument(actor(["EXECUTIVE"], "maker"), document)).toBe(true);
    expect(canCheckDocument(
      actor(["EXECUTIVE"], "maker"),
      { ...document, document: { ...document.document, classification: "RESTRICTED" } },
    )).toBe(false);
    expect(isChecklistComplete(document)).toBe(false);
  });

  it("lets the Director approve a checklist-complete normal draft", () => {
    const document = detail("DRAFT");
    expect(canApproveDocument(actor(["EXECUTIVE"], "maker"), document)).toBe(true);
    expect(canApproveDocument(actor(["WORKSPACE_LEAD"]), document)).toBe(false);
    expect(canApproveDocument(actor(["EXECUTIVE"]), {
      ...document,
      document: { ...document.document, classification: "RESTRICTED" },
    })).toBe(false);

    const inReview = detail("IN_REVIEW");
    expect(canApproveDocument(actor(["EXECUTIVE"]), inReview)).toBe(true);
    expect(canApproveDocument(actor(["IT_ADMIN"]), document)).toBe(false);
  });
});
