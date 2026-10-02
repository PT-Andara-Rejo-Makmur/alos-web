import type { AraAuthorityProjection, AraMessageProjection, AraMessageRequest, AraRunProjection, AraThreadProjection } from "@/lib/contracts";
import { authenticatedApiRequest } from "@/lib/api";

const root = "/api/v1/ara";
export const araApi = {
  authority: () => authenticatedApiRequest<AraAuthorityProjection>(`${root}/authority`),
  threads: () => authenticatedApiRequest<readonly AraThreadProjection[]>(`${root}/threads`),
  create: () => authenticatedApiRequest<AraThreadProjection>(`${root}/threads`, { method: "POST", body: {} }),
  messages: (id: string) => authenticatedApiRequest<readonly AraMessageProjection[]>(`${root}/threads/${encodeURIComponent(id)}/messages`),
  send: (id: string, body: AraMessageRequest) => authenticatedApiRequest<AraRunProjection>(`${root}/threads/${encodeURIComponent(id)}/messages`, { method: "POST", body }),
  cancel: (threadId: string, runId: string) => authenticatedApiRequest<AraRunProjection>(`${root}/threads/${encodeURIComponent(threadId)}/runs/${encodeURIComponent(runId)}/cancel`, { method: "POST" }),
};
