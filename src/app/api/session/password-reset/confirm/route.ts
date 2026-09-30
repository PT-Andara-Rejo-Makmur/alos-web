import type { NextRequest } from "next/server";

import { confirmBackendPasswordReset } from "@/lib/api/server-boundary";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<Response> {
  return confirmBackendPasswordReset(request);
}
