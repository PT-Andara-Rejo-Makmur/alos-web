import { sessionApiRequest } from "@/lib/api";

/** Ends the authenticated browser session through the existing same-origin boundary. */
export function endCurrentSession(): Promise<void> {
  return sessionApiRequest<void>("/", { method: "DELETE" });
}
