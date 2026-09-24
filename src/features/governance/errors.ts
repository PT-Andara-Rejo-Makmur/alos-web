import { ApiError } from "@/lib/api";

export type GovernanceUiError = {
  title: string;
  reason: string;
  nextAction: string;
  severity?: "warning" | "error" | "critical";
  field?: string;
  status: number | null;
  correlationId: string | null;
};

type ErrorMessage = Omit<GovernanceUiError, "status" | "correlationId">;

function message(title: string, reason: string, nextAction: string, severity: NonNullable<GovernanceUiError["severity"]> = "warning"): ErrorMessage {
  return { title, reason, nextAction, severity };
}

const detailMessages: Record<string, ErrorMessage> = {
  "maker cannot act as checker": message("Separation of Duties memblokir aksi", "Maker tidak boleh menjadi Checker pada release yang sama.", "Gunakan QA atau Checker independen.", "critical"),
  "positive, negative, regression, security, and recovery tests must pass": message("Evidence test belum lengkap", "Lima kategori test wajib memiliki hasil terbaru yang sesuai expected result.", "Buka Test & Evidence dan jalankan ulang kategori yang ditandai belum lulus."),
  "a successful Agent Run is required before review": message("Agent Run belum memenuhi gate", "Belum ada Agent Run SUCCEEDED untuk versi DRAFT yang sedang direview.", "Jalankan kembali test POSITIVE pada versi ini; periksa Reason bila Actual masih BLOCKED."),
  "business and technical review approvals are required": message("Review manusia belum lengkap", "Business Review dan Technical Review belum keduanya APPROVED.", "Reviewer independen menyelesaikan gate yang masih pending."),
  "business reviewer must be assigned to the Agent workspace division": message("Business Review di luar scope", "Reviewer Business tidak ditugaskan pada divisi workspace Agent ini.", "Gunakan Business Reviewer pada divisi yang sama dengan scope Agent.", "critical"),
  "an independent IT Lead release maker is required for this Agent request": message("Release Maker belum tersedia", "Requester atau sponsor Agent tidak boleh otomatis menjadi Release Maker.", "Tambahkan Administrator IT independen sebagai anggota workspace agar draft dapat masuk ke persiapan release."),
  "only the recorded approver can release an approved request": message("Release hanya boleh dilakukan Approver tercatat", "Akun ini bukan Director yang mencatat final approval.", "Gunakan akun Approver yang tercatat pada request."),
  "only the recorded approver can activate a released request": message("Aktivasi hanya boleh dilakukan Approver tercatat", "Akun ini bukan Director yang merilis versi tersebut.", "Gunakan akun Approver yang tercatat pada request."),
  "kill switch is active": message("Aktivasi diblokir Kill Switch", "Kontrol penghentian darurat masih aktif pada Agent ini.", "Verifikasi penyebab lalu clear Kill Switch dengan alasan yang diaudit bila aman.", "critical"),
  "Agent Contract has unresolved capabilities and needs configuration": message("Capability belum siap", "Contract masih merujuk capability yang NEEDS_CONFIGURATION.", "Buka Tools & Permissions dan selesaikan capability resolution."),
  "Agent tools are unavailable or need configuration": message("Tool Agent belum siap", "Satu atau lebih tool belum APPROVED atau belum memiliki adapter runtime.", "Buka Permissions, cek tool terkait, lalu minta approval teknis."),
  "Agent permissions are not independently approved": message("Permission belum disetujui", "Permission Agent belum memperoleh approval independen.", "Minta Director atau QA independen menyetujui permission DRAFT."),
  "daily output token budget cap reached": message("Runtime diblokir budget", "Batas output token harian telah tercapai.", "Buka Governance → Budget; tunggu periode berikutnya atau minta pemilik budget meninjau limit.", "critical"),
  "daily request budget cap reached": message("Runtime diblokir budget", "Batas request harian telah tercapai.", "Buka Governance → Budget; tunggu periode berikutnya atau minta pemilik budget meninjau limit.", "critical"),
  "daily cost budget cap reached": message("Runtime diblokir budget", "Hard cost cap harian telah tercapai.", "Buka Governance → Budget dan minta pemilik budget meninjau usage serta limit.", "critical"),
  "an active workspace cost limit was not found": message("Budget workspace belum aktif", "Runtime tidak menemukan cost limit aktif untuk workspace.", "Executive atau Administrator IT harus mengatur limit di Governance → Budget."),
  "an active workspace cost limit is required": message("Budget workspace belum aktif", "Runtime tidak menemukan cost limit aktif untuk workspace.", "Executive atau Administrator IT harus mengatur limit di Governance → Budget."),
};

function safeDetail(detail: string): string {
  return /stack|traceback|postgres|sql|database_url|password|secret|api[_ -]?key/i.test(detail)
    ? "Server menolak aksi tanpa mengekspos detail internal."
    : detail;
}

export function normalizeGovernanceError(error: unknown): GovernanceUiError {
  if (error instanceof ApiError) {
    const exact = detailMessages[error.detail];
    if (exact) return { ...exact, status: error.status, correlationId: error.correlationId };
    const detail = safeDetail(error.detail);
    const byStatus: Record<number, ErrorMessage> = {
      400: { ...message("Input belum valid", detail, "Periksa field yang ditandai lalu kirim kembali."), field: "form" },
      401: message("Sesi telah berakhir", "ALOS tidak lagi mengenali sesi ini.", "Masuk kembali untuk melanjutkan.", "error"),
      403: message("Aksi tidak diizinkan", detail || "Role atau scope Anda tidak memiliki izin.", "Gunakan akun dengan role yang tepat atau pilih workspace yang diizinkan.", "critical"),
      404: message("Data tidak ditemukan", detail, "Muat ulang daftar dan pilih record yang masih tersedia."),
      409: message("Status Agent telah berubah sejak halaman ini dibuka", detail, "Data terbaru dimuat otomatis. Periksa Current State, Current Blocker, dan Next Action."),
      422: { ...message("Form belum dapat diproses", detail, "Perbaiki format atau field wajib yang disebutkan."), field: "form" },
      429: message("Batas penggunaan tercapai", detail, "Buka Governance → Budget atau tunggu periode budget berikutnya.", "critical"),
      500: message("Layanan Governance mengalami gangguan", "Server tidak dapat menyelesaikan permintaan ini.", "Coba lagi. Jika berulang, berikan Reference ID kepada Administrator IT.", "error"),
    };
    return { ...(byStatus[error.status] ?? message("Permintaan tidak berhasil", detail, "Muat ulang data lalu coba kembali.", "error")), status: error.status, correlationId: error.correlationId };
  }
  if (error instanceof Error) return { ...message("Input belum valid", error.message, "Perbaiki isian yang disebutkan lalu coba kembali."), field: "form", status: null, correlationId: null };
  return { ...message("Permintaan tidak berhasil", "Terjadi kegagalan yang tidak dikenali.", "Muat ulang halaman lalu coba kembali.", "error"), status: null, correlationId: null };
}

export function runtimeNextAction(errorCode?: string | null, reason?: string | null): string {
  const combined = `${errorCode ?? ""} ${reason ?? ""}`.toLowerCase();
  if (combined.includes("budget") || combined.includes("token") || combined.includes("cost limit")) return "Periksa Governance → Budget.";
  if (combined.includes("kill switch")) return "Periksa Kill Switch / Rollback sebelum menjalankan ulang.";
  if (combined.includes("permission")) return "Periksa Controls → Permissions dan minta approval independen.";
  if (combined.includes("tool") || combined.includes("capabilit")) return "Periksa Tools & Permissions dan selesaikan NEEDS_CONFIGURATION.";
  if (combined.includes("schema") || combined.includes("input")) return "Perbaiki fixture agar sesuai Contract input schema.";
  return "Buka detail Runtime, perbaiki blocker yang tercatat, lalu jalankan ulang.";
}
