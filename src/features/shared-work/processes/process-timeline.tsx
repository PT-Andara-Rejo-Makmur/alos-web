import Link from "next/link";
import type { BusinessProcessProjection } from "@/lib/contracts";
import { statusLabel } from "@/lib/presentation";
import styles from "@/components/ui/work-surface.module.css";

export function ProcessTimeline({ process, workspaceKey }: Readonly<{ process: BusinessProcessProjection; workspaceKey: string }>) {
  return <ol className={styles.timeline} aria-label="Alur proses">{process.steps.map(item => <li key={item.step_id} data-current={item.can_act} data-complete={item.status === "COMPLETED"}>
    <strong>{item.workspace_name ?? "Penanggung jawab terkait"}</strong><p>{item.instruction}</p><p>{statusLabel(item.status)}{item.actor_name ? ` · ${item.actor_name}` : ""}</p>
    {item.task_id ? <Link href={`/workspace/${encodeURIComponent(workspaceKey)}/tasks/${encodeURIComponent(item.task_id)}`}>Buka Tugas Pelaksanaan</Link> : null}
  </li>)}</ol>;
}
