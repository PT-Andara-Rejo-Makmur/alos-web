import type { ExecutiveSourceStatus, SalesCustomerListProjection } from "@/lib/contracts";
import type { recordApi } from "./record-api";
import { readableValue, roleLabel, severityLabel, statusLabel } from "@/lib/presentation";

export type Field = Readonly<{
  name: string;
  label: string;
  required: boolean;
  nullable: boolean;
  type: "text" | "date" | "datetime-local" | "integer" | "decimal" | "boolean";
  optionLabels?: Readonly<Record<string, string>>;
  options?: readonly string[];
  relation?: Readonly<{
    path: string; identifier: string; label: string; array?: boolean;
    multiple?: boolean;
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
  transition: (identity: string, status: string, approvalId?: string, decisionReason?: string) => Promise<object>;
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
    transition: (identity, status, approvalId, decisionReason) => api.transition(identity, { status, ...(approvalId ? { approval_id: approvalId } : {}), ...(decisionReason ? { decision_reason: decisionReason } : {}) } as T) };
}

export type SourceState = "loading" | ExecutiveSourceStatus["status"];

/** Use field metadata for enums; uppercase names and business codes remain free text. */
export function recordFieldValue(field: Field, value: unknown): string {
  if (typeof value !== "string" || !value) return readableValue(value);
  if (field.optionLabels?.[value]) return field.optionLabels[value];
  if (/(^|_)(severity|risk|risk_level)$/.test(field.name)) return severityLabel(value);
  if (/(^|_)role(_ref)?$/.test(field.name)) return roleLabel(value);
  if (field.options || /(^|_)(status|state|priority|risk|kind|decision|classification|business_type)$/.test(field.name)) return statusLabel(value);
  return field.type === "date" || field.type === "datetime-local" ? readableValue(value) : value;
}
