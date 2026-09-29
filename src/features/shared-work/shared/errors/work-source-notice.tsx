import { AlertCircle } from "lucide-react";

import { Alert } from "@/components/ui";

import { sourceStateCopy, type SourceState } from "../source-state";
import styles from "./errors.module.css";

export function WorkSourceNotice({
  message,
  state,
  subject,
}: Readonly<{ message?: string | null; state: SourceState; subject: string }>) {
  if (state === "available") return null;
  const copy = sourceStateCopy(state, subject);
  return (
    <div className={styles.container}>
      <Alert
        icon={<AlertCircle size={18} strokeWidth={2} />}
        message={message ?? copy.message}
        title={copy.title}
        variant={copy.variant}
      />
    </div>
  );
}
