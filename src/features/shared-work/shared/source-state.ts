import { ApiError } from "@/lib/api";

export type SourceState =
  | "available"
  | "unavailable"
  | "error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation";

export type SourceRequestKind = "collection" | "detail";

/** A missing public capability is distinct from a source that failed to respond. */
export function sourceStateFor(
  error: unknown,
  requestKind: SourceRequestKind = "collection",
): SourceState {
  if (!(error instanceof ApiError)) return "error";
  if (error.status === 401) return "unauthorized";
  if (error.status === 403) return "forbidden";
  if (error.status === 404) return requestKind === "detail" ? "not_found" : "unavailable";
  if (error.status === 501) return "unavailable";
  if (error.status === 409) return "conflict";
  if (error.status === 422) return "validation";
  return "error";
}

export function sourceStateCopy(
  state: SourceState,
  subject: string,
): { readonly title: string; readonly message: string; readonly variant: "danger" | "neutral" } {
  switch (state) {
    case "unauthorized":
      return { title: "Sesi Berakhir", message: "Sesi Anda sudah berakhir. Silakan masuk kembali.", variant: "danger" };
    case "forbidden":
      return { title: "Tidak Memiliki Kewenangan", message: `Anda tidak memiliki kewenangan untuk mengakses data ${subject.toLowerCase()} ini.`, variant: "danger" };
    case "not_found":
      return { title: "Tidak Ditemukan", message: `Data ${subject.toLowerCase()} tidak ditemukan atau tidak dapat diakses.`, variant: "neutral" };
    case "conflict":
      return { title: "Konflik Data", message: "Data telah berubah. Muat versi terbaru sebelum melanjutkan.", variant: "danger" };
    case "validation":
      return { title: "Data Belum Memenuhi Aturan", message: "Data belum memenuhi aturan yang berlaku.", variant: "danger" };
    case "unavailable":
      return {
        title: `Data ${subject} Belum Terhubung`,
        message: `Data ${subject.toLowerCase()} belum terhubung. Daftar ${subject.toLowerCase()} akan ditampilkan setelah sumber data tersedia.`,
        variant: "neutral",
      };
    case "available":
      return { title: `Data ${subject} Tersedia`, message: `Data ${subject.toLowerCase()} tersedia.`, variant: "neutral" };
    default:
      return { title: `Data ${subject} Belum Dapat Dimuat`, message: `Data ${subject.toLowerCase()} belum dapat dimuat. Silakan coba kembali.`, variant: "danger" };
  }
}
