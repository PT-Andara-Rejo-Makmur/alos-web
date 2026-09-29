"use client";
import { use } from "react";
import { HrDetailPage } from "@/features/hr";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string; employeeId: string }> | { workspaceKey: string; employeeId: string } }>) { const p = "then" in params ? use(params) : params; return <HrDetailPage kind="employee" recordId={p.employeeId} workspaceKey={p.workspaceKey} />; }
