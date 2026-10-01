import { authenticatedApiRequest } from "@/lib/api";

/** Transport only; lifecycle, money and visibility remain Backend-owned. */
export function recordApi<Create extends object, Update extends object, Projection extends object, List extends object, Transition extends object>(path: string) {
  return {
    list(signal?: AbortSignal, offset = 0) {
      return authenticatedApiRequest<List>(`${path}?limit=100&offset=${offset}`, { signal });
    },
    detail(identity: string, signal?: AbortSignal) {
      return authenticatedApiRequest<Projection>(`${path}/${encodeURIComponent(identity)}`, { signal });
    },
    create(body: Create) {
      return authenticatedApiRequest<Projection>(path, { method: "POST", body });
    },
    update(identity: string, body: Update) {
      return authenticatedApiRequest<Projection>(`${path}/${encodeURIComponent(identity)}`, { method: "PATCH", body });
    },
    transition(identity: string, body: Transition) {
      return authenticatedApiRequest<Projection>(`${path}/${encodeURIComponent(identity)}/transition`, { method: "POST", body });
    },
  };
}
