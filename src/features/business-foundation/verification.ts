import { VERIFICATION_STATES, type VerificationState } from "./enums";
export const isVerificationState = (value: unknown): value is VerificationState => VERIFICATION_STATES.includes(value as VerificationState);
export const verificationLabel = (state: VerificationState): string => ({ UNVERIFIED: "Belum diverifikasi", PENDING_VERIFICATION: "Menunggu verifikasi", VERIFIED: "Terverifikasi", CONFLICT: "Konflik data", REJECTED: "Ditolak" })[state];
