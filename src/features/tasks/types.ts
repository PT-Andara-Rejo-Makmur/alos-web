export type TaskStatus = "DRAFT" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED";

export type OperationalTask = {
  task_id: string; workspace_id: string; division_code: string; project_id: string | null;
  project_name: string | null; title: string; description: string; status: TaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; due_date: string | null;
  assignee_user_id: string | null; owner_user_id: string; evidence_required: boolean;
  created_at: string; updated_at: string; completed_at: string | null;
};

export type TaskList = {
  items: OperationalTask[];
  pagination: { page: number; page_size: number; total_items: number; total_pages: number };
};
