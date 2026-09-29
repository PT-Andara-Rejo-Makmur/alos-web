"use client";
import { use } from "react";
import { HrDetailPage } from "@/features/hr";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string; reviewId: string }> | { workspaceKey: string; reviewId: string } }>) { const p = "then" in params ? use(params) : params; return <HrDetailPage kind="review" recordId={p.reviewId} workspaceKey={p.workspaceKey} />; }
