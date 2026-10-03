"use client";

import { Fragment, useEffect, useState, type FormEvent } from "react";
import { Alert, Button, DataTable, Drawer, EmptyState, FormField, LoadingState, Section, Status } from "@/components/ui";
import { ApiRequestError, authenticatedApiRequest } from "@/lib/api";
import type { SessionProjection } from "@/features/session";
import type { ExecutiveSourceStatus, SharedWorkMaterialActionProjection } from "@/lib/contracts";
import { MaterialActions } from "./material-actions";
import { BusinessRecordActions } from "./business-record-actions";
import type { Field, Resource, SourceState } from "./resource";
import styles from "@/features/property/property.module.css";

export const sourceLabels: Record<SourceState, string> = {
  loading: "Memuat", CONNECTED: "Terhubung", CONNECTED_EMPTY: "Belum ada data",
  UNAVAILABLE: "Belum Tersedia", ERROR: "Gagal Memuat",
};

export function sourceFailure(error: unknown): SourceState {
  return error instanceof ApiRequestError && error.code === "CONTRACTS_UNAVAILABLE" ? "UNAVAILABLE" : "ERROR";
}

function mutationFailure(error: unknown): string {
  if (!(error instanceof ApiRequestError)) return "Permintaan belum tersimpan. Periksa koneksi lalu coba kembali.";
  const semantics = error.status === 401 ? "Sesi berakhir" : error.status === 403 ? "Akses ditolak"
    : error.status === 404 ? "Rekaman atau referensi tidak ditemukan" : error.status === 409 ? "Konflik data atau lifecycle"
      : error.status === 422 ? "Input tidak valid" : error.status >= 500 ? "Layanan belum dapat memproses permintaan" : "Permintaan ditolak";
  return `${semantics} (${error.status}). ${error.detail}${error.correlationId ? ` Referensi: ${error.correlationId}` : ""}`;
}

export function SourceStateView({ state }: Readonly<{ state: SourceState }>) {
  if (state === "loading") return <LoadingState label="Memuat data authoritative…" variant="section" />;
  if (state === "ERROR") return <Alert title="Gagal Memuat" message="Data belum dapat dibaca. Tidak ada nilai pengganti yang ditampilkan." variant="danger" />;
  if (state === "UNAVAILABLE") return <EmptyState title="Belum Tersedia" description="Capability atau canonical contract belum tersedia." />;
  if (state === "CONNECTED_EMPTY") return <EmptyState title="Belum ada data" description="Sumber berhasil dibaca; belum ada rekaman dalam scope aktif." />;
  return null;
}

function permission(session: SessionProjection, domain: string): boolean {
  const active = session.principal && "actor" in session.principal ? session.principal.active_workspace : null;
  return !!active && active.role_refs.some((role) => role === "DIVISION_LEAD" || role === "DIVISION_MEMBER" || (domain === "it" && role === "IT_ADMIN" && active.workspace.workspace_type === "IT_OPERATIONS")) && active.permission_refs.includes(`${domain}.write`);
}

export function SourceMetadata({ source }: Readonly<{ source: ExecutiveSourceStatus }>) {
  return <p className={styles.sourceNote}><Status label={sourceLabels[source.status]} variant={source.status === "ERROR" ? "danger" : "neutral"} />
    <span>Sumber: {source.source} · {source.authoritative ? "Authoritative" : "Belum authoritative"} · Pembaruan sumber: {source.last_updated_at ? new Date(source.last_updated_at).toLocaleString("id-ID") : "Tidak diketahui"}</span></p>;
}

export function RecordPanel({ resource, session }: Readonly<{ resource: Resource; session: SessionProjection }>) {
  const principal = session.principal && "actor" in session.principal ? session.principal : null;
  return <ScopedRecordPanel key={`${principal?.actor.actor_id}-${principal?.active_workspace?.workspace.workspace_id}-${resource.domain}-${resource.key}`} resource={resource} session={session} />;
}

function ScopedRecordPanel({ resource, session }: Readonly<{ resource: Resource; session: SessionProjection }>) {
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

  return <Section title={resource.title} description="Rekaman canonical dalam workspace aktif. Nominal ditampilkan persis dari sumber.">
    <div className={styles.page}>
      {source ? <SourceMetadata source={source} /> : null}
      <div className={styles.actionBar}>
        <input aria-label={`Cari ${resource.title}`} placeholder="Cari pada halaman ini" value={search} onChange={(event) => setSearch(event.target.value)} />
        {writable && (state === "CONNECTED" || state === "CONNECTED_EMPTY") ? <Button variant="primary" onClick={() => { setSelected(null); setFeedback(null); setMutationError(null); setForm("create"); }}>Tambah {resource.title}</Button> : null}
      </div>
      <SourceStateView state={state} />
      {state === "CONNECTED" || state === "CONNECTED_EMPTY" ? <>
        <DataTable caption={`Daftar ${resource.title}`} columns={columns.map((field) => ({ key: field.name, header: field.label, render: (row: object) => display(view(row)[field.name]) }))}
          rows={filtered} getRowKey={(row) => String(view(row)[resource.identifier])}
          rowAction={(row) => <Button size="sm" variant="secondary" onClick={() => { setSelected(row); setFeedback(null); setMutationError(null); setDecisionReason(""); }}>Lihat detail</Button>}
          emptyState={state === "CONNECTED_EMPTY" ? <span>Belum ada rekaman.</span> : <span>Tidak ada rekaman cocok pada halaman ini.</span>} />
        <div className={styles.actionBar}><span>{total} rekaman tersimpan dalam scope aktif</span>
          <Button disabled={offset === 0} size="sm" variant="ghost" onClick={() => { setState("loading"); setOffset((value) => Math.max(0, value - 100)); }}>Sebelumnya</Button>
          <Button disabled={offset + 100 >= total} size="sm" variant="ghost" onClick={() => { setState("loading"); setOffset((value) => value + 100); }}>Berikutnya</Button></div>
      </> : null}
      {feedback ? <p role="status">{feedback}</p> : null}
      {mutationError ? <Alert title="Perubahan belum tersimpan" message={mutationError} variant="danger" /> : null}
    </div>
    <Drawer title={`Detail ${resource.title}`} open={selected !== null && form === null} onClose={() => setSelected(null)}>
      {detail ? <div className={styles.page}><dl className={styles.detailList}>{Object.entries(detail).filter(([key]) => !["allowed_transitions", "allowed_pipeline_stages", "material_actions", "tenant_id", "organization_id", "workspace_id"].includes(key)).map(([key, value]) => <Fragment key={key}><dt>{resource.columns.find((field) => field.name === key)?.label ?? (key === resource.identifier ? "ID Rekaman" : key)}</dt><dd>{display(value)}</dd></Fragment>)}</dl>
        {writable && !resource.immutable && resource.updateFields.length > 0 ? <Button variant="secondary" onClick={() => setForm("update")}>Edit {resource.title}</Button> : null}
        {writable && resource.domain === "hr" && resource.key === "leave_requests" && actions.some(status => ["APPROVED", "REJECTED"].includes(status)) ? <FormField label="Alasan keputusan cuti" htmlFor="leave-decision-reason" required><textarea id="leave-decision-reason" value={decisionReason} onChange={event => setDecisionReason(event.target.value)} /></FormField> : null}
        {writable ? <div className={styles.actionBar}>{actions.map((status) => <Button disabled={busy || (resource.domain === "hr" && resource.key === "leave_requests" && ["APPROVED", "REJECTED"].includes(status) && !decisionReason.trim())} key={status} onClick={() => void transition(status)} variant="secondary">{status}</Button>)}</div> : null}
        {writable && resource.pipeline ? <div className={styles.actionBar}>{pipelineActions.map((stage) => <Button disabled={busy} key={stage} onClick={() => void transition(stage, true)} variant="secondary">Lanjut ke {stage}</Button>)}</div> : null}
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
        const label = display(referenceValue(row, relation.label!));
        return { value, label: label === value ? label : `${label} · ${value}` };
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

  return <Drawer title={`${mode === "create" ? "Tambah" : "Edit"} ${resource.title}`} open onClose={onClose}>
    <form className={styles.page} onSubmit={(event) => void submit(event)}>
      {loading ? <LoadingState label="Memuat referensi canonical…" variant="section" /> : null}
      {relationErrors.length ? <Alert title="Referensi belum dapat dimuat" message={blockedReferences ? "Penyimpanan diblokir agar referensi wajib atau tersimpan tidak hilang." : "Referensi tambahan belum tersedia. Pengajuan dapat disimpan tanpa memilih referensi tersebut."} variant={blockedReferences ? "danger" : "warning"} /> : null}
      {fields.map((field) => {
        const required = field.required || (mode === "update" && !field.nullable);
        return <FormField key={field.name} label={field.label} htmlFor={`record-${field.name}`} required={required}
          description={field.type === "decimal" ? "Masukkan angka desimal dengan titik, maksimal dua digit pecahan. Nilai tidak dibulatkan oleh Web." : undefined}>
          {field.type === "boolean" ? <select id={`record-${field.name}`} value={values[field.name] ?? "false"} disabled={busy} onChange={event => change(field.name, event.target.value)}><option value="false">Tidak</option><option value="true">Ya</option></select> : field.relation || field.options ? <select id={`record-${field.name}`} multiple={field.relation?.multiple} value={field.relation?.multiple ? JSON.parse(values[field.name] || "[]") as string[] : values[field.name] ?? ""} required={required} disabled={loading || relationErrors.includes(field.name) || busy || !!(field.relation?.dependsOn && !values[field.relation.dependsOn])} onChange={(event) => change(field.name, field.relation?.multiple ? JSON.stringify(Array.from(event.target.selectedOptions, option => option.value).filter(Boolean)) : event.target.value)}>
            <option value="">Pilih {field.label}</option>
            {(field.relation ? options[field.name] ?? [] : field.options!.map((value) => ({ value, label: field.optionLabels?.[value] ?? value }))).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select> : <input id={`record-${field.name}`} type={field.type === "integer" ? "number" : field.type === "decimal" ? "text" : field.type} inputMode={field.type === "decimal" ? "decimal" : undefined}
            required={required} value={values[field.name] ?? ""} disabled={busy} onChange={(event) => change(field.name, event.target.value)} />}
        </FormField>;
      })}
      {error ? <Alert title="Perubahan belum tersimpan" message={error} variant="danger" /> : null}
      <div className={styles.actionBar}><Button type="button" variant="ghost" disabled={busy} onClick={onClose}>Batal</Button><Button type="submit" variant="primary" disabled={busy || loading || unresolved || blockedReferences}>{busy ? "Menyimpan…" : "Simpan"}</Button></div>
    </form>
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
function display(value: unknown): string { return value === null || value === undefined ? "—" : typeof value === "boolean" ? (value ? "Ya" : "Tidak") : String(value); }
