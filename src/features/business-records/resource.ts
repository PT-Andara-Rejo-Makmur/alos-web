import type { ExecutiveSourceStatus, SalesCustomerListProjection } from "@/lib/contracts";
import type { recordApi } from "./record-api";

export type Field = Readonly<{
  name: string;
  label: string;
  required: boolean;
  nullable: boolean;
  type: "text" | "date" | "datetime-local" | "integer" | "decimal";
  options?: readonly string[];
  relation?: Readonly<{
    path: string; identifier: string; label: string; array?: boolean;
    dependsOn?: string;
    variants?: Readonly<Record<string, Readonly<{ path: string; identifier: string; label: string }>>>;
  }>;
}>;

/** Presentation metadata only: references, fields and lifecycle are canonical types. */
export type Resource = Readonly<{
  key: string;
  domain: string;
  title: string;
  identifier: string;
  createFields: readonly Field[];
  updateFields: readonly Field[];
  columns: readonly Field[];
  immutable: boolean;
  list: (signal?: AbortSignal, offset?: number) => Promise<Pick<SalesCustomerListProjection, "source" | "total"> & { readonly items: readonly object[] }>;
  create: (values: object) => Promise<object>;
  update: (identity: string, values: object) => Promise<object>;
  transition: (identity: string, status: string, approvalId?: string) => Promise<object>;
  pipeline?: (identity: string, stage: string) => Promise<object>;
}>;

export function defineResource<C extends object, U extends object, P extends object, L extends Pick<SalesCustomerListProjection, "source" | "total"> & { readonly items: readonly P[] }, T extends object>(
  metadata: Omit<Resource, "list" | "create" | "update" | "transition" | "createFields" | "updateFields"> & {
    readonly createFields: readonly (Field & { name: Extract<keyof C, string> })[];
    readonly updateFields: readonly (Field & { name: Extract<keyof U, string> })[];
  }, api: ReturnType<typeof recordApi<C, U, P, L, T>>,
): Resource {
  return { ...metadata, list: api.list, create: (values) => api.create(values as C),
    update: (identity, values) => api.update(identity, values as U),
    transition: (identity, status, approvalId) => api.transition(identity, { status, ...(approvalId ? { approval_id: approvalId } : {}) } as T) };
}

export type SourceState = "loading" | ExecutiveSourceStatus["status"];
