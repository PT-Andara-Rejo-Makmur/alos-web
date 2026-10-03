import { UnavailableFeature } from "@/components/unavailable-feature";

import { PropertyLayout } from "../property-layout";

export function PropertyContractorDetailPage({ workspaceKey }: Readonly<{ contractorId: string; workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{() => <UnavailableFeature feature="Kontraktor" backHref={workspaceKey ? `/workspace/${encodeURIComponent(workspaceKey)}/summary` : "/workspace"} backLabel="Kembali ke Ringkasan Property" />}</PropertyLayout>;
}
