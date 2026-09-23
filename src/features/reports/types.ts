export type ReportDefinition = {
  report_definition_id: string; workspace_id: string; division_code: string | null; project_id: string | null;
  name: string; template_key: string; scope: string; period: string; sections: unknown[];
  data_sources: unknown[]; status: string; review_required: boolean; recipient_user_ids: string[];
  owner_user_id: string; created_at: string; updated_at: string; schedule_expression: string | null;
  timezone: string | null; next_run_at: string | null;
};

export type Report = {
  report_id: string; report_definition_id: string; workspace_id: string; status: string;
  content: Record<string, unknown>; provenance: Array<Record<string, unknown>>;
  idempotency_key: string; created_at: string; updated_at: string;
};
