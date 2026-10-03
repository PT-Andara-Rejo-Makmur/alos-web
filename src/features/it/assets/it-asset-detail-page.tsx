"use client";

import { PageHeader, Section } from "@/components/ui";

import { ItLayout } from "../it-layout";
import styles from "../it.module.css";
import { ItSourceStateView } from "../shared/it-ui";

export function ItAssetDetailPage({
  assetId,
  workspaceKey,
}: Readonly<{ assetId: string; workspaceKey?: string }>) {
  return (
    <ItLayout workspaceKey={workspaceKey}>
      {() => (
        <div className={styles.page}>
          <PageHeader
            description="Pantau sistem, pemeriksaan, dan layanan teknologi perusahaan."
            eyebrow="OPERASIONAL IT"
            metadata={`Referensi aset: ${assetId || "—"}`}
            title="Detail Aset IT"
          />
          <Section title="Sumber Data">
            <ItSourceStateView
              description="Detail aset IT belum terhubung. Antarmuka tidak membuat data aset, pengguna, kondisi, atau kepemilikan dari parameter URL."
              state="unavailable"
            />
          </Section>
        </div>
      )}
    </ItLayout>
  );
}
