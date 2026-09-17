export type LoadState = "idle" | "loading" | "ready" | "empty" | "error";

export interface UiErrorProjection {
  readonly title: string;
  readonly detail: string;
  readonly correlationId?: string;
}
