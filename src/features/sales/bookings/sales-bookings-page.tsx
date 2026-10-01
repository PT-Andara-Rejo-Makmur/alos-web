"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { salesResources } from "@/features/sales/resources";
import { SalesLayout } from "../sales-layout";

const resources = [salesResources.bookings, salesResources.closings, salesResources.collaterals];

export function SalesBookingsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Booking & Closing" description="Rekaman internal authoritative; booking dan closing final menunggu authority lintas domain." />}</SalesLayout>;
}
