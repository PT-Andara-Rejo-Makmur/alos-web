import type { NextRequest } from "next/server";

import { requestBackendPasswordReset } from "@/lib/api/server-boundary";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<Response> {
  return requestBackendPasswordReset(request);
}
