import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, Button } from "@/components/ui";
import { ApiError } from "@/lib/api";

import styles from "./errors.module.css";

interface WorkErrorStateProps {
  readonly action?: ReactNode;
  readonly error?: unknown;
  readonly onRetry?: () => void;
  readonly title?: string;
}

export function humanizeWorkError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return "Sesi Anda sudah berakhir. Silakan masuk kembali.";
      case 403:
        return "Anda tidak memiliki kewenangan untuk melakukan tindakan ini.";
      case 404:
        return "Data yang Anda cari tidak ditemukan.";
      case 409:
        return "Data telah berubah sejak halaman ini dibuka. Muat versi terbaru sebelum melanjutkan.";
      case 422:
        return "Data belum memenuhi aturan yang berlaku.";
      default:
        return "Data belum dapat dimuat. Silakan coba kembali.";
    }
  }

  return "Data belum dapat dimuat. Silakan coba kembali.";
}

export function WorkErrorState({
  action,
  error,
  onRetry,
  title = "Terjadi Kendala",
}: WorkErrorStateProps) {
  const message = humanizeWorkError(error);

  return (
    <div className={styles.container}>
      <Alert
        action={
          action ?? (onRetry ? (
            <Button onClick={onRetry} size="sm" variant="secondary">
              Coba lagi
            </Button>
          ) : undefined)
        }
        icon={<AlertCircle size={18} strokeWidth={2} />}
        message={message}
        title={title}
        variant="danger"
      />
    </div>
  );
}
