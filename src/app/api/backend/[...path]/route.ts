import type { NextRequest } from "next/server";

import { proxyAuthenticatedBackend } from "@/lib/api/server-boundary";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handler(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  return proxyAuthenticatedBackend(request, path);
}

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST, handler as PUT };
