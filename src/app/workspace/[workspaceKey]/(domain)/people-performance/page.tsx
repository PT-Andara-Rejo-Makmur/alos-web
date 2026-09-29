"use client";
import { use } from "react";
import { HrModulePage } from "@/features/hr";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) { const p = "then" in params ? use(params) : params; return <HrModulePage module="peoplePerformance" workspaceKey={p.workspaceKey} />; }
