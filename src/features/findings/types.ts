export type Finding = {
  finding_id: string; workspace_id: string; division_code: string | null; project_id: string | null;
  source_kind: string; source_id: string | null; title: string; description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED";
  recommendation: string; resolution: string | null; due_date: string | null;
  created_at: string; updated_at: string;
};
