import type { ConversationRouteAdapter } from "./types";

export function createAraRouteAdapter(basePath: string = "/workspace/ara"): ConversationRouteAdapter {
  const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  return {
    basePath: normalizedBase,
    conversationUrl(id: string): string {
      return `${normalizedBase}?conversation=${encodeURIComponent(id)}`;
    },
  };
}

export const DEFAULT_ARA_ROUTE_ADAPTER = createAraRouteAdapter("/workspace/ara");
export const COMPATIBILITY_ARA_ROUTE_ADAPTER = createAraRouteAdapter("/ara");
