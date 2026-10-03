"use client";

import { Fragment, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Alert, Button, DataTable, Drawer, EmptyState, FormField, LoadingState, Section, Status } from "@/components/ui";
import { ApiRequestError, apiMessage, authenticatedApiRequest } from "@/lib/api";
import { readableValue, statusLabel } from "@/lib/presentation";
import type { SessionProjection } from "@/features/session";
import type { ExecutiveSourceStatus, SharedWorkMaterialActionProjection } from "@/lib/contracts";
import { BusinessRecordForm } from "./business-record-form";
import { BusinessRecordContext } from "./record-context";
import { MaterialActions } from "./material-actions";
import { BusinessRecordActions } from "./business-record-actions";
import { recordFieldValue, type Field, type Resource, type SourceState } from "./resource";
import styles from "@/features/property/property.module.css";

export const sourceLabels: Record<SourceState, string> = {
  loading: "Memuat", CONNECTED: "Terhubung", CONNECTED_EMPTY: "Belum ada data",
  UNAVAILABLE: "Belum Tersedia", ERROR: "Gagal Memuat",
};

export function sourceFailure(error: unknown): SourceState {
  return error instanceof ApiRequestError && error.code === "CONTRACTS_UNAVAILABLE" ? "UNAVAILABLE" : "ERROR";
}

function mutationFailure(error: unknown): string {
  return apiMessage(error);
}

export function SourceStateView({ state }: Readonly<{ state: SourceState }>) {
  if (state === "loading") return <LoadingState label="Memuat data perusahaan…" variant="section" />;
  if (state === "ERROR") return <Alert title="Gagal Memuat" message="Data belum dapat dibaca. Tidak ada nilai pengganti yang ditampilkan." variant="danger" />;
  if (state === "UNAVAILABLE") return <EmptyState title="Belum Tersedia" description="Informasi ini belum dapat ditampilkan. Coba kembali atau hubungi penanggung jawab sistem." />;
  if (state === "CONNECTED_EMPTY") return <EmptyState title="Belum ada data" description="Tambahkan data pertama atau tunggu pengajuan yang menjadi tanggung jawab ruang kerja Anda." />;
  return null;
}

function permission(session: SessionProjection, domain: string): boolean {
  const active = session.principal && "actor" in session.principal ? session.principal.active_workspace : null;
  return !!active && active.role_refs.some((role) => role === "DIVISION_LEAD" || role === "DIVISION_MEMBER" || (domain === "it" && role === "IT_ADMIN" && active.workspace.workspace_type === "IT_OPERATIONS")) && active.permission_refs.includes(`${domain}.write`);
}

export function SourceMetadata({ source }: Readonly<{ source: ExecutiveSourceStatus }>) {
  return <p className={styles.sourceNote}><Status label={sourceLabels[source.status] ?? statusLabel(source.status)} variant={source.status === "ERROR" ? "danger" : "neutral"} />
    <span>Data perusahaan · {source.authoritative ? "Dari catatan resmi" : "Perlu pemeriksaan sumber"} · Diperbarui {source.last_updated_at ? new Date(source.last_updated_at).toLocaleString("id-ID") : "belum diketahui"}</span></p>;
}

type PanelProps = Readonly<{ resource: Resource; session: SessionProjection; renderSummary?: (rows: readonly object[]) => ReactNode }>;

export function RecordPanel({ resource, session, renderSummary }: PanelProps) {
  const principal = session.principal && "actor" in session.principal ? session.principal : null;
  return <ScopedRecordPanel key={`${principal?.actor.actor_id}-${principal?.active_workspace?.workspace.workspace_id}-${resource.domain}-${resource.key}`} resource={resource} session={session} renderSummary={renderSummary} />;
}

function ScopedRecordPanel({ resource, session, renderSummary }: PanelProps) {
  const [state, setState] = useState<SourceState>("loading");
  const [source, setSource] = useState<ExecutiveSourceStatus | null>(null);
  const [rows, setRows] = useState<readonly object[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<object | null>(null);
  const [form, setForm] = useState<"create" | "update" | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [search, setSearch] = useState("");
  const writable = permission(session, resource.domain);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    void resource.list(controller.signal, offset).then((data) => {
      if (!current) return;
      setRows(data.items); setTotal(data.total); setSource(data.source); setState(data.source.status);
    }).catch((error: unknown) => { if (current) { setRows([]); setSource(null); setState(sourceFailure(error)); } });
    return () => { current = false; controller.abort(); };
  }, [resource, revision, offset]);

  async function transition(status: string, pipeline = false) {
    if (!selected || !writable || busy) return;
    setBusy(true); setFeedback(null); setMutationError(null);
    try {
      const next = pipeline && resource.pipeline ? await resource.pipeline(String(view(selected)[resource.identifier]), status) : await resource.transition(String(view(selected)[resource.identifier]), status, undefined,
        resource.domain === "hr" && resource.key === "leave_requests" && ["APPROVED", "REJECTED"].includes(status) ? decisionReason.trim() : undefined);
      setSelected(next); setFeedback("Perubahan status tersimpan."); setRevision((value) => value + 1);
    } catch (error) { setMutationError(mutationFailure(error)); }
    finally { setBusy(false); }
  }

  const filtered = rows.filter((row) => Object.values(row).some((value) => typeof value === "string" && value.toLocaleLowerCase("id-ID").includes(search.toLocaleLowerCase("id-ID"))));
  const columns = resource.columns.filter((field) => !field.name.endsWith("_id") && !["created_at", "updated_at"].includes(field.name)).slice(0, 6);
  const detail = selected ? view(selected) : null;
  const actions = detail && Array.isArray(detail.allowed_transitions) ? detail.allowed_transitions.filter((value): value is string => typeof value === "string") : [];
  const pipelineActions = detail && Array.isArray(detail.allowed_pipeline_stages) ? detail.allowed_pipeline_stages.filter((value): value is string => typeof value === "string") : [];
  const materialActions = detail && Array.isArray(detail.material_actions) ? detail.material_actions as readonly SharedWorkMaterialActionProjection[] : [];
  const active = session.principal && "actor" in session.principal ? session.principal.active_workspace : null;
  const canRequest = !!active && active.permission_refs.some((value) => value === "approval.request" || value === "work.write");

  return <Section title={resource.title} description="Kelola informasi dan tindak lanjut dalam ruang kerja Anda.">
    <div className={styles.page}>
      {source ? <SourceMetadata source={source} /> : null}
      <div className={styles.actionBar}>
        <input aria-label={`Cari ${resource.title}`} placeholder="Cari pada halaman ini" value={search} onChange={(event) => setSearch(event.target.value)} />
        {writable && (state === "CONNECTED" || state === "CONNECTED_EMPTY") ? <Button variant="primary" onClick={() => { setSelected(null); setFeedback(null); setMutationError(null); setForm("create"); }}>Tambah {resource.title}</Button> : null}
      </div>
      <SourceStateView state={state} />
      {state === "CONNECTED" || state === "CONNECTED_EMPTY" ? <>
        {renderSummary?.(rows)}
        <DataTable caption={`Daftar ${resource.title}`} columns={columns.map((field) => ({ key: field.name, header: field.label, render: (row: object) => recordFieldValue(field, view(row)[field.name]) }))}
          rows={filtered} getRowKey={(row) => String(view(row)[resource.identifier])}
          rowAction={(row) => <Button size="sm" variant="secondary" onClick={() => { setSelected(row); setFeedback(null); setMutationError(null); setDecisionReason(""); }}>Lihat detail</Button>}
          emptyState={state === "CONNECTED_EMPTY" ? <span>Belum ada rekaman.</span> : <span>Tidak ada rekaman cocok pada halaman ini.</span>} />
        <div className={styles.actionBar}><span>{total} catatan dalam ruang kerja ini</span>
          <Button disabled={offset === 0} size="sm" variant="ghost" onClick={() => { setState("loading"); setOffset((value) => Math.max(0, value - 100)); }}>Sebelumnya</Button>
          <Button disabled={offset + 100 >= total} size="sm" variant="ghost" onClick={() => { setState("loading"); setOffset((value) => value + 100); }}>Berikutnya</Button></div>
      </> : null}
      {feedback ? <p role="status">{feedback}</p> : null}
      {mutationError ? <Alert title="Perubahan belum tersimpan" message={mutationError} variant="danger" /> : null}
    </div>
    <Drawer title={`Detail ${resource.title}`} open={selected !== null && form === null} onClose={() => setSelected(null)}>
      {detail ? <div className={styles.page}><dl className={styles.detailList}>{resource.columns.filter(field => !field.name.endsWith("_id") && !field.name.endsWith("_ref") && field.name in detail).map(field => <Fragment key={field.name}><dt>{field.label}</dt><dd>{recordFieldValue(field, detail[field.name])}</dd></Fragment>)}</dl>
        <BusinessRecordContext key={String(detail[resource.identifier])} resource={resource} identity={String(detail[resource.identifier])} record={detail} />
        {writable && !resource.immutable && resource.updateFields.length > 0 ? <Button variant="secondary" onClick={() => setForm("update")}>Ubah {resource.title}</Button> : null}
        {writable && resource.domain === "hr" && resource.key === "leave_requests" && actions.some(status => ["APPROVED", "REJECTED"].includes(status)) ? <FormField label="Alasan keputusan cuti" htmlFor="leave-decision-reason" required><textarea id="leave-decision-reason" value={decisionReason} onChange={event => setDecisionReason(event.target.value)} /></FormField> : null}
        {writable ? <div className={styles.actionBar}>{actions.map((status) => <Button disabled={busy || (resource.domain === "hr" && resource.key === "leave_requests" && ["APPROVED", "REJECTED"].includes(status) && !decisionReason.trim())} key={status} onClick={() => void transition(status)} variant="secondary">{statusLabel(status)}</Button>)}</div> : null}
        {writable && resource.pipeline ? <div className={styles.actionBar}>{pipelineActions.map((choice) => <Button disabled={busy} key={choice} onClick={() => void transition(choice, true)} variant="secondary">Lanjut ke {statusLabel(choice)}</Button>)}</div> : null}
        {writable && materialActions.length ? <MaterialActions key={String(detail[resource.identifier])} actions={materialActions} identity={String(detail[resource.identifier])} resource={resource} canRequest={canRequest}
          onSaved={(row) => { setSelected(row); setFeedback("Tindakan material tersimpan."); setRevision((value) => value + 1); }} /> : null}
        {writable ? <BusinessRecordActions resource={resource} record={detail} canHire={!!active?.role_refs.includes("DIVISION_LEAD")} onSaved={row => { setSelected(row); setRevision(value => value + 1); }} /> : null}
        {mutationError ? <Alert title="Perubahan belum tersimpan" message={mutationError} variant="danger" /> : null}
      </div> : null}
    </Drawer>
    {form ? <RecordForm key={`${form}-${detail ? String(detail[resource.identifier]) : "new"}`} mode={form} resource={resource} record={detail} onClose={() => setForm(null)}
      onSaved={(row) => { setForm(null); setSelected(row); setFeedback("Rekaman tersimpan."); setRevision((value) => value + 1); }} /> : null}
  </Section>;
}

type Options = Readonly<{ value: string; label: string }>;

function referenceValue(row: object, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => value && typeof value === "object" ? view(value)[key] : undefined, row);
}

async function referenceRows(path: string, signal: AbortSignal): Promise<readonly object[]> {
  const rows: object[] = [];
  let offset = 0;
  for (;;) {
    const separator = path.includes("?") ? "&" : "?";
    const data = await authenticatedApiRequest<{
      readonly items: readonly object[]; readonly total: number; readonly source: ExecutiveSourceStatus;
    } | readonly object[]>(`${path}${separator}limit=200&offset=${offset}`, { signal });
    if (!("items" in data)) return data;
    if (["ERROR", "UNAVAILABLE"].includes(data.source.status)) throw new Error("Reference source unavailable");
    rows.push(...data.items);
    offset += data.items.length;
    if (offset >= data.total) return rows;
    if (!data.items.length) throw new Error("Reference pagination incomplete");
  }
}

function RecordForm({ mode, resource, record, onClose, onSaved }: Readonly<{
  mode: "create" | "update"; resource: Resource; record: Readonly<Record<string, unknown>> | null;
  onClose: () => void; onSaved: (row: object) => void;
}>) {
  const fields = mode === "create" ? resource.createFields : resource.updateFields;
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((field) => [field.name, inputValue(field, mode === "update" ? record?.[field.name] : undefined)])));
  const referenceSignature = JSON.stringify(fields.filter((field) => field.relation).map((field) => {
    const relation = field.relation!;
    const parent = relation.dependsOn ? values[relation.dependsOn] : undefined;
    const target = relation.variants ? relation.variants[parent ?? ""] : relation;
    return { name: field.name, required: field.required, ...target,
      path: !target || (relation.dependsOn && !parent) ? null
        : target.path.replace(`{${relation.dependsOn}}`, encodeURIComponent(parent ?? "")) };
  }));
  const [references, setReferences] = useState<{
    signature: string; options: Record<string, readonly Options[]>; errors: readonly string[];
  }>({ signature: "", options: {}, errors: [] });
  const loading = references.signature !== referenceSignature;
  const options: Record<string, readonly Options[]> = loading ? {} : references.options;
  const relationErrors = loading ? [] : references.errors;
  const blockedReferences = relationErrors.some(name => fields.some(field => field.name === name
    && (field.required || !!values[name])));
  const unresolved = fields.some((field) => field.required && field.relation
    && (!values[field.name] || !options[field.name]?.some((option) => option.value === values[field.name])));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let current = true;
    const controller = new AbortController();
    const relations = JSON.parse(referenceSignature) as readonly { name: string; path: string | null; identifier?: string; label?: string }[];
    void Promise.allSettled(relations.map(async (relation) => {
      if (!relation.path) return { name: relation.name, options: [] };
      const items = await referenceRows(relation.path, controller.signal);
      return { name: relation.name, options: items.map((row) => {
        const value = String(referenceValue(row, relation.identifier!));
        const label = readableValue(referenceValue(row, relation.label!));
        const internal = label === value && (relation.identifier!.endsWith("_id") || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value));
        const facts = view(row);
        const humanName = facts.name ?? facts.title ?? facts.full_name ?? facts.code ?? facts.employee_number ?? facts.contract_number;
        return { value, label: internal ? (typeof humanName === "string" && humanName !== value ? humanName : `Catatan ${facts.created_at ? new Date(String(facts.created_at)).toLocaleDateString("id-ID") : "tanpa nama"}${facts.status ? ` · ${statusLabel(String(facts.status))}` : ""}`) : label };
      }) };
    })).then((results) => {
      if (!current) return;
      const failed: string[] = []; const next: Record<string, readonly Options[]> = {};
      results.forEach((result, index) => { if (result.status === "fulfilled") next[result.value.name] = result.value.options; else failed.push(relations[index].name); });
      setReferences({ signature: referenceSignature, options: next, errors: failed });
    });
    return () => { current = false; controller.abort(); };
  }, [referenceSignature]);

  function change(name: string, value: string) {
    setValues((old) => ({ ...old, [name]: value,
      ...Object.fromEntries(fields.filter((field) => field.relation?.dependsOn === name).map((field) => [field.name, ""])) }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || loading || unresolved || blockedReferences) return;
    setBusy(true); setError(null);
    const payload: Record<string, string | readonly string[] | number | boolean | null> = {};
    for (const field of fields) {
      const value = values[field.name] ?? "";
      if (value === "") { if (mode === "update" && field.nullable) payload[field.name] = null; continue; }
      // Decimal input remains text; conversion is only for integer years, never money.
      payload[field.name] = field.relation?.multiple ? JSON.parse(value) as readonly string[] : field.type === "boolean" ? value === "true" : field.type === "integer" ? Number(value) : field.type === "datetime-local" ? new Date(value).toISOString() : value;
    }
    try {
      const row = mode === "create" ? await resource.create(payload) : await resource.update(String(record?.[resource.identifier]), payload);
      onSaved(row);
    } catch (error) { setError(mutationFailure(error)); }
    finally { setBusy(false); }
  }

  return <Drawer title={`${mode === "create" ? "Tambah" : "Ubah"} ${resource.title}`} open onClose={onClose}>
    <BusinessRecordForm resource={resource} fields={fields} mode={mode} values={values} options={options} change={change} busy={busy} loading={loading} relationErrors={relationErrors} onSubmit={event => void submit(event)} onCancel={onClose} disabled={busy || loading || unresolved || blockedReferences} feedback={<>
      {loading ? <LoadingState label="Memuat pilihan terkait…" variant="section" /> : null}
      {relationErrors.length ? <Alert title="Pilihan terkait belum dapat dimuat" message={blockedReferences ? "Lengkapi pilihan yang diperlukan sebelum menyimpan." : "Pilihan tambahan belum tersedia. Anda dapat menyimpan tanpa pilihan tersebut."} variant={blockedReferences ? "danger" : "warning"} /> : null}
      {error ? <Alert title="Perubahan belum tersimpan" message={error} variant="danger" /> : null}
    </>} />
  </Drawer>;
}

function inputValue(field: Field, value: unknown): string {
  if (value === null || value === undefined) return "";
  if (field.relation?.multiple && Array.isArray(value)) return JSON.stringify(value);
  if (field.type === "datetime-local" && typeof value === "string") {
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }
  return String(value);
}

function view(record: object): Readonly<Record<string, unknown>> { return record as Readonly<Record<string, unknown>>; }
