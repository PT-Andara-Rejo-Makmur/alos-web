import type { SessionActor } from "@/features/session";

export type DocumentStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "ACTIVE" | "REJECTED" | "ARCHIVED";
export type DocumentOrigin = "MANUAL" | "GENESIS";

export type DocumentRecord = {
  document_id: string;
  organization_id: string;
  workspace_id: string;
  division_code: string | null;
  genesis_conversation_id: string | null;
  genesis_upload_id: string | null;
  title: string;
  category: string;
  classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  origin: DocumentOrigin;
  status: DocumentStatus;
  owner_user_id: string;
  created_by_user_id: string;
  version_number: number;
  created_at: string;
  updated_at: string;
};

export type DocumentChecklistItem = {
  document_checklist_item_id: string;
  check_key: string;
  label: string;
  check_type: "AUTOMATED" | "HUMAN";
  required: boolean;
  status: "PENDING" | "PASSED" | "WAIVED";
  notes: string | null;
  completed_by_user_id: string | null;
  completed_at: string | null;
};

export type DocumentReview = {
  document_review_request_id: string;
  document_id: string;
  document_version_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submitted_by_user_id: string;
  submitted_at: string;
  reviewer_user_id: string | null;
  decided_at: string | null;
  notes: string | null;
};

export type DocumentDetail = {
  document: DocumentRecord;
  content: string;
  content_sha256: string;
  checklist: DocumentChecklistItem[];
  reviews: DocumentReview[];
};

export type DocumentWorkspace = {
  workspace_id: string;
  workspace_key: string;
  name: string;
  division_code: string | null;
  access_level: string;
};

const checkerRoles = new Set([
  "EXECUTIVE",
  "WORKSPACE_LEAD",
  "IT_ADMIN",
  "TECHNICAL_REVIEWER",
  "BUSINESS_REVIEWER",
  "QA_ASSURANCE",
]);

function usesDirectorStreamlinedFlow(document: DocumentRecord): boolean {
  return document.classification === "PUBLIC" || document.classification === "INTERNAL";
}

export function canCheckDocument(actor: SessionActor, detail: DocumentDetail): boolean {
  if (detail.document.status !== "DRAFT" || !actor.roles.some((role) => checkerRoles.has(role))) {
    return false;
  }
  return detail.document.created_by_user_id !== actor.user_id
    || (actor.roles.includes("EXECUTIVE") && usesDirectorStreamlinedFlow(detail.document));
}

export function canApproveDocument(actor: SessionActor, detail: DocumentDetail): boolean {
  if (!actor.roles.includes("EXECUTIVE")) return false;
  if (usesDirectorStreamlinedFlow(detail.document)) {
    return detail.document.status === "DRAFT" || detail.document.status === "IN_REVIEW";
  }
  return detail.document.status === "IN_REVIEW"
    && detail.document.created_by_user_id !== actor.user_id;
}

export function isChecklistComplete(detail: DocumentDetail): boolean {
  return detail.checklist.every((item) => !item.required || item.status === "PASSED");
}

export function formatDocumentDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
