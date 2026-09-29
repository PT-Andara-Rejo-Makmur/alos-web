"use client";
import { use } from "react";
import { ItModulePage } from "@/features/it";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) { const p = "then" in params ? use(params) : params; return <ItModulePage module="infrastructure" workspaceKey={p.workspaceKey} />; }
