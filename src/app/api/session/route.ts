import type { NextRequest } from "next/server";

import { deleteBackendSession, readBackendSession } from "@/lib/api/server-boundary";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  return readBackendSession(request);
}

export function DELETE(request: NextRequest): Promise<Response> {
  return deleteBackendSession(request);
}
