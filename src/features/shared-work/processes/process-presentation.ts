import type { BusinessProcessProjection } from "@/lib/contracts";
import { statusLabel } from "@/lib/presentation";

export const processNames: Readonly<Record<BusinessProcessProjection["business_type"], string>> = {
  CHANGE_ORDER: "Perubahan Pekerjaan", PAYMENT_CERTIFICATE: "Sertifikat Pembayaran", BOOKING: "Booking",
  ONBOARDING: "Persiapan Karyawan Baru", OFFBOARDING: "Penyelesaian Karyawan Keluar", CAPABILITY_REQUEST: "Asisten & Otomasi",
  EMPLOYMENT_CONTRACT: "Kontrak Kerja", RECRUITMENT: "Kebutuhan Tenaga Kerja",
};

export function processTitle(process: BusinessProcessProjection): string {
  const packet = process.packet;
  const value = packet.certificate_number ?? packet.change_number ?? packet.contract_number ?? packet.position_title ?? packet.employee_number ?? packet.need;
  return typeof value === "string" && value ? value : processTypeLabel(process.business_type);
}

export function processTypeLabel(value: string): string {
  return processNames[value as BusinessProcessProjection["business_type"]] ?? statusLabel(value);
}
