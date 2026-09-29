"use client";
import { use } from "react";
import { HrDetailPage } from "@/features/hr";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string; candidateId: string }> | { workspaceKey: string; candidateId: string } }>) { const p = "then" in params ? use(params) : params; return <HrDetailPage kind="candidate" recordId={p.candidateId} workspaceKey={p.workspaceKey} />; }
