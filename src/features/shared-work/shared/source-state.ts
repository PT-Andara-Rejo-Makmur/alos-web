import { ApiError } from "@/lib/api";

export type SourceState = "unavailable" | "error";

/** A missing public capability is distinct from a source that failed to respond. */
export function sourceStateFor(error: unknown): SourceState {
  return error instanceof ApiError && (error.status === 404 || error.status === 501)
    ? "unavailable"
    : "error";
}
