export type Approval = {
  approval_request_id: string; workspace_id: string; division_code: string | null;
  approval_kind: string; subject_type: string; subject_id: string; payload_digest: string;
  title: string; description: string; urgency: "NORMAL" | "URGENT";
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  requested_by_user_id: string | null; approver_user_id: string | null;
  decision_notes: string | null; requested_at: string; decided_at: string | null;
};

export type ProposedAction = {
  proposed_action_id: string; workspace_id: string; division_code: string | null; project_id: string | null;
  action_type: "TASK_CREATE" | "FINDING_CREATE"; payload: Record<string, unknown>;
  payload_digest: string; risk_level: string;
  status: "DRAFT" | "APPROVAL_REQUIRED" | "APPROVED" | "REJECTED" | "EXECUTED" | "FAILED";
  created_at: string; executed_at: string | null; approval_request_id: string | null;
  approval_status: string | null; executed_entity_type: string | null; executed_entity_id: string | null;
};
