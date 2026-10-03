"use client";

import { UnavailableFeature } from "@/components/unavailable-feature";

import { PropertyLayout } from "../property-layout";

export function PropertyBudgetPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{() => <UnavailableFeature feature="Anggaran & RAB" backHref={workspaceKey ? `/workspace/${encodeURIComponent(workspaceKey)}/summary` : "/workspace"} backLabel="Kembali ke Ringkasan Property" />}</PropertyLayout>;
}
