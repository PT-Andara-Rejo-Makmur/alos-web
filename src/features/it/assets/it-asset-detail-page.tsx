import { UnavailableFeature } from "@/components/unavailable-feature";

import { ItLayout } from "../it-layout";

export function ItAssetDetailPage({
  workspaceKey,
}: Readonly<{ assetId: string; workspaceKey?: string }>) {
  return <ItLayout workspaceKey={workspaceKey}>{() => <UnavailableFeature feature="Aset IT" backHref={workspaceKey ? `/workspace/${encodeURIComponent(workspaceKey)}/summary` : "/workspace"} backLabel="Kembali ke Ringkasan IT" />}</ItLayout>;
}
