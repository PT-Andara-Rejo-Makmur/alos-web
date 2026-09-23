export type SearchResult = {
  entity_type: "DIVISION" | "PROJECT" | "TASK" | "DOCUMENT" | "REPORT" | "FINDING" | "AGENT";
  entity_id: string; title: string; subtitle: string; href: string;
  division_code: string | null; updated_at: string;
};

export type Notification = {
  notification_id: string; workspace_id: string | null; notification_type: string;
  title: string; body: string; entity_type: string; entity_id: string;
  read_at: string | null; created_at: string;
};
