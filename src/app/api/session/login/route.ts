import type { NextRequest } from "next/server";

import { createBackendSession } from "@/lib/api/server-boundary";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<Response> {
  return createBackendSession(request);
}
