"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type {
  SharedWorkActivityProjection,
  SharedWorkCommentProjection,
  SharedWorkChecklistEntityType,
  SharedWorkChecklistItemProjection,
  SharedWorkEntityType,
  SharedWorkEvidenceCandidateProjection,
  SharedWorkEvidenceProjection,
  SharedWorkDocumentLinkRequest,
  SharedWorkRelationProjection,
  SharedWorkTaskProjection,
  SharedWorkApprovalProjection,
} from "@/lib/contracts";

import { ActivityTimeline } from "./activity/activity-timeline";
import { EvidenceList } from "./evidence/evidence-list";
import { hasWorkPermission } from "./permissions/authority";

interface Props {
  readonly entityType: SharedWorkEntityType;
  readonly entityId: string;
  readonly session?: SessionProjection | null;
}

function route({ entityType, entityId }: Props, suffix: string): string {
  return `/api/v1/work/${entityType}/${encodeURIComponent(entityId)}/${suffix}`;
}

export function SharedWorkEvidencePanel(props: Props) {
  const [items, setItems] = useState<readonly SharedWorkEvidenceProjection[]>([]);
  const [candidates, setCandidates] = useState<readonly SharedWorkEvidenceCandidateProjection[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canLink = hasWorkPermission(props.session, "work.evidence.link");
  const evidencePath = route(props, "evidence");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      authenticatedApiRequest<readonly SharedWorkEvidenceProjection[]>(evidencePath),
      canLink
        ? authenticatedApiRequest<readonly SharedWorkEvidenceCandidateProjection[]>(
            "/api/v1/work/evidence-candidates",
          )
        : Promise.resolve([]),
    ]).then(([linked, available]) => {
      if (!cancelled) { setItems(linked); setCandidates(available); }
    }).catch((caught) => {
      if (!cancelled) setError(apiMessage(caught));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [canLink, evidencePath]);

  async function link(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canLink || !candidates.some((item) => item.evidence_id === selected)) return;
    setBusy(true); setError(null);
    try {
      const linked = await authenticatedApiRequest<SharedWorkEvidenceProjection>(
        route(props, "evidence"),
        { method: "POST", body: JSON.stringify({ evidence_id: selected }) },
      );
      setItems((previous) => [linked, ...previous.filter((item) => item.evidence_id !== selected)]);
      setSelected("");
    } catch (caught) { setError(apiMessage(caught)); }
    finally { setBusy(false); }
  }

  if (loading) return <p>Memuat bukti…</p>;
  return <div>
    {error ? <p role="alert">{error}</p> : null}
    <EvidenceList items={items.map((item) => ({
      id: item.evidence_id,
      title: item.source_title ?? item.source_id,
      source: item.source_id,
      verificationStatus: item.validation_status === "VERIFIED" ? "VERIFIED" : "UNVERIFIED",
      occurredAt: item.linked_at,
      version: item.source_version ?? null,
      contentHash: item.content_hash,
    }))} />
    {canLink ? <form onSubmit={link}>
      <label htmlFor={`evidence-${props.entityId}`}>Bukti terverifikasi</label>
      <select id={`evidence-${props.entityId}`} value={selected}
        onChange={(event) => setSelected(event.target.value)}>
        <option value="">Pilih bukti</option>
        {candidates.filter((item) => !items.some((linked) => linked.evidence_id === item.evidence_id))
          .map((item) => <option key={item.evidence_id} value={item.evidence_id}>
            {item.source_title ?? item.source_id} · {item.source_version ?? ""}
          </option>)}
      </select>
      <Button disabled={!selected || busy} type="submit">Hubungkan Bukti</Button>
    </form> : null}
  </div>;
}

export function SharedWorkActivityPanel(props: Props) {
  const [items, setItems] = useState<readonly SharedWorkActivityProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activityPath = route(props, "activity");
  useEffect(() => {
    let cancelled = false;
    void authenticatedApiRequest<readonly SharedWorkActivityProjection[]>(activityPath)
      .then((result) => { if (!cancelled) setItems(result); })
      .catch((caught) => { if (!cancelled) setError(apiMessage(caught)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activityPath]);
  if (loading) return <p>Memuat aktivitas…</p>;
  if (error) return <p role="alert">{error}</p>;
  return <ActivityTimeline items={items.map((item) => ({
    id: String(item.audit_id), actorName: item.actor_name,
    actionText: item.event_type.replaceAll("_", " ").replaceAll(".", " · "),
    occurredAt: item.occurred_at,
  }))} />;
}

export function SharedWorkCommentsPanel(props: Props) {
  const [items, setItems] = useState<readonly SharedWorkCommentProjection[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canComment = hasWorkPermission(props.session, "work.comment.create");
  const commentsPath = route(props, "comments");
  useEffect(() => {
    let cancelled = false;
    void authenticatedApiRequest<readonly SharedWorkCommentProjection[]>(commentsPath)
      .then((result) => { if (!cancelled) setItems(result); })
      .catch((caught) => { if (!cancelled) setError(apiMessage(caught)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [commentsPath]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canComment || !body.trim()) return;
    setBusy(true); setError(null);
    try {
      const created = await authenticatedApiRequest<SharedWorkCommentProjection>(
        route(props, "comments"),
        { method: "POST", body: JSON.stringify({ body: body.trim() }) },
      );
      setItems((previous) => [created, ...previous]);
      setBody("");
    } catch (caught) { setError(apiMessage(caught)); }
    finally { setBusy(false); }
  }
  if (loading) return <p>Memuat komentar…</p>;
  return <div>
    {error ? <p role="alert">{error}</p> : null}
    {items.length ? items.map((item) => <article key={item.comment_id}>
      <strong>{item.actor_name}</strong>
      <time dateTime={item.created_at}> · {new Date(item.created_at).toLocaleString("id-ID")}</time>
      <p>{item.body}</p>
    </article>) : <p>Belum ada komentar.</p>}
    {canComment ? <form onSubmit={submit}>
      <label htmlFor={`comment-${props.entityId}`}>Komentar</label>
      <textarea id={`comment-${props.entityId}`} maxLength={10000} value={body}
        onChange={(event) => setBody(event.target.value)} />
      <Button disabled={!body.trim() || busy} type="submit">Kirim Komentar</Button>
    </form> : null}
  </div>;
}

export function SharedWorkChecklistPanel(props: Props & { readonly entityType: SharedWorkChecklistEntityType }) {
  const [items, setItems] = useState<readonly SharedWorkChecklistItemProjection[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const path = route(props, "checklist");
  const canManage = hasWorkPermission(props.session, "work.checklist.manage");
  useEffect(() => {
    let cancelled = false;
    void authenticatedApiRequest<readonly SharedWorkChecklistItemProjection[]>(path)
      .then((rows) => { if (!cancelled) setItems(rows); })
      .catch((caught) => { if (!cancelled) setError(apiMessage(caught)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [path]);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || !body.trim()) return;
    setBusy(true); setError(null);
    try {
      const item = await authenticatedApiRequest<SharedWorkChecklistItemProjection>(path, {
        method: "POST", body: JSON.stringify({ body: body.trim() }),
      });
      setItems((previous) => [...previous, item]); setBody("");
    } catch (caught) { setError(apiMessage(caught)); }
    finally { setBusy(false); }
  }
  async function complete(itemId: string) {
    if (!canManage || busy) return;
    setBusy(true); setError(null);
    try {
      const changed = await authenticatedApiRequest<SharedWorkChecklistItemProjection>(
        `${path}/${encodeURIComponent(itemId)}/complete`, { method: "POST" },
      );
      setItems((previous) => previous.map((item) => item.item_id === itemId ? changed : item));
    } catch (caught) { setError(apiMessage(caught)); }
    finally { setBusy(false); }
  }
  if (loading) return <p>Memuat checklist…</p>;
  return <div>
    {error ? <p role="alert">{error}</p> : null}
    {items.length ? <ul>{items.map((item) => <li key={item.item_id}>
      <span>{item.completed ? "✓ " : "○ "}{item.body}</span>
      {!item.completed && canManage ? <Button disabled={busy} onClick={() => void complete(item.item_id)} size="sm">Selesai</Button> : null}
    </li>)}</ul> : <p>Belum ada item checklist.</p>}
    {canManage ? <form onSubmit={create}>
      <label htmlFor={`checklist-${props.entityId}`}>Item checklist</label>
      <input id={`checklist-${props.entityId}`} maxLength={1000} onChange={(event) => setBody(event.target.value)} value={body} />
      <Button disabled={!body.trim() || busy} type="submit">Tambah Item</Button>
    </form> : null}
  </div>;
}

const relationPaths: Record<SharedWorkEntityType, string> = {
  PROJECT: "projects", TASK: "tasks", APPROVAL: "approvals", DOCUMENT: "documents",
  REPORT: "reports", FINDING: "findings",
};

export function SharedWorkRelationsPanel(props: Props & { readonly workspaceKey?: string | null }) {
  const [items, setItems] = useState<readonly SharedWorkRelationProjection[]>([]);
  const [candidates, setCandidates] = useState<readonly (SharedWorkTaskProjection | SharedWorkApprovalProjection)[]>([]);
  const [targetType, setTargetType] = useState<SharedWorkDocumentLinkRequest["target_type"]>("TASK");
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const path = route(props, "relations");
  const canLink = props.entityType === "DOCUMENT" && hasWorkPermission(props.session, "work.relation.link");
  const canReadTasks = hasWorkPermission(props.session, "task.read") || hasWorkPermission(props.session, "work.read");
  const canReadApprovals = hasWorkPermission(props.session, "approval.read") || hasWorkPermission(props.session, "work.read");
  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      authenticatedApiRequest<readonly SharedWorkRelationProjection[]>(path),
      canLink && canReadTasks ? authenticatedApiRequest<readonly SharedWorkTaskProjection[]>("/api/v1/tasks") : Promise.resolve([]),
      canLink && canReadApprovals ? authenticatedApiRequest<readonly SharedWorkApprovalProjection[]>("/api/v1/approvals") : Promise.resolve([]),
    ]).then(([linked, tasks, approvals]) => {
      if (!cancelled) { setItems(linked); setCandidates([...tasks, ...approvals]); }
    }).catch((caught) => { if (!cancelled) setError(apiMessage(caught)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [canLink, canReadTasks, canReadApprovals, path]);
  const available = candidates.filter((item) => targetType === "TASK" ? "task_id" in item : "approval_id" in item);
  async function link(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canLink || !targetId || !available.some((item) =>
      ("task_id" in item ? item.task_id : item.approval_id) === targetId)) return;
    setBusy(true); setError(null);
    try {
      const linked = await authenticatedApiRequest<SharedWorkRelationProjection>(
        `/api/v1/documents/${encodeURIComponent(props.entityId)}/links`,
        { method: "POST", body: JSON.stringify({ target_type: targetType, target_id: targetId }) },
      );
      setItems((previous) => [...previous.filter((item) => item.entity_type !== targetType || item.entity_id !== targetId), linked]);
      setTargetId("");
    } catch (caught) { setError(apiMessage(caught)); }
    finally { setBusy(false); }
  }
  if (loading) return <p>Memuat relasi…</p>;
  return <div>
    {error ? <p role="alert">{error}</p> : null}
    {items.length ? <ul>{items.map((item) => <li key={`${item.entity_type}-${item.entity_id}`}>
      <Link href={props.workspaceKey
        ? `/workspace/${props.workspaceKey}/${relationPaths[item.entity_type]}/${item.entity_id}`
        : `/workspace/${relationPaths[item.entity_type]}/${item.entity_id}`}>
        {item.title}
      </Link> · {item.status}
    </li>)}</ul> : <p>Belum ada relasi.</p>}
    {canLink ? <form onSubmit={link}>
      <label htmlFor={`relation-type-${props.entityId}`}>Jenis relasi</label>
      <select id={`relation-type-${props.entityId}`} onChange={(event) => { setTargetType(event.target.value as SharedWorkDocumentLinkRequest["target_type"]); setTargetId(""); }} value={targetType}>
        <option value="TASK">Tugas</option><option value="APPROVAL">Persetujuan</option>
      </select>
      <label htmlFor={`relation-${props.entityId}`}>Objek terkait</label>
      <select id={`relation-${props.entityId}`} onChange={(event) => setTargetId(event.target.value)} value={targetId}>
        <option value="">Pilih objek</option>
        {available.map((item) => {
          const id = "task_id" in item ? item.task_id : item.approval_id;
          return <option key={id} value={id}>{"task_id" in item ? item.title : item.subject_title ?? item.approval_id}</option>;
        })}
      </select>
      <Button disabled={!targetId || busy} type="submit">Hubungkan</Button>
    </form> : null}
  </div>;
}
