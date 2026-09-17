"use client";

import { getBackendBaseUrl } from "@/lib/api";

/** Returns configuration presence only; it makes no network request or authority decision. */
export function useBackendConfiguration(): { configured: boolean; baseUrl?: string } {
  const baseUrl = getBackendBaseUrl();
  return { configured: Boolean(baseUrl), baseUrl };
}
