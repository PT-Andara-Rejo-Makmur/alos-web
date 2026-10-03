"use client";

import { UnavailableFeature } from "@/components/unavailable-feature";

import { PropertyLayout } from "../property-layout";

export function PropertyMaterialsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{() => <UnavailableFeature feature="Material & Pengadaan" backHref={workspaceKey ? `/workspace/${encodeURIComponent(workspaceKey)}/summary` : "/workspace"} backLabel="Kembali ke Ringkasan Property" />}</PropertyLayout>;
}
