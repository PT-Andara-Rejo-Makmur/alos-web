export const genesisUploadExtensions = [
  "pdf",
  "docx",
  "xlsx",
  "xls",
  "csv",
  "json",
  "md",
  "txt",
] as const;

export type GenesisUploadExtension = (typeof genesisUploadExtensions)[number];
export type GenesisUploadStatus =
  | "SOURCE_RECEIVED"
  | "DRAFT_CREATED"
  | "WITHDRAWAL_PENDING"
  | "WITHDRAWN";
export type GenesisUploadExtractionStatus =
  | "EXTRACTED"
  | "NO_TEXT"
  | "EXTRACTOR_UNAVAILABLE"
  | "TRUNCATED";

export type GenesisUploadRecord = {
  genesis_upload_id: string;
  workspace_id: string;
  original_filename: string;
  extension: GenesisUploadExtension;
  declared_content_type: string | null;
  byte_size: number;
  file_sha256: string;
  object_key: string;
  status: GenesisUploadStatus;
  extraction_status: GenesisUploadExtractionStatus;
  extraction_complete: boolean;
  extracted_characters: number;
  extracted_text_sha256: string | null;
  preview: string | null;
  extraction_note: string | null;
  created_at: string;
};

export function supportsGenesisUpload(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLocaleLowerCase("en-US");
  return extension !== undefined && genesisUploadExtensions.includes(extension as GenesisUploadExtension);
}

export function formatUploadSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function uploadExtractionLabel(upload: GenesisUploadRecord): string {
  if (upload.status === "DRAFT_CREATED") return "DRAFT untuk ditinjau";
  if (upload.status === "WITHDRAWAL_PENDING") return "Menghapus berkas";
  if (upload.status === "WITHDRAWN") return "Unggahan dibatalkan";
  if (upload.extraction_status === "EXTRACTED" && upload.extraction_complete) {
    return "Teks siap ditinjau";
  }
  if (upload.extraction_status === "TRUNCATED") return "Preview belum lengkap";
  if (upload.extraction_status === "EXTRACTOR_UNAVAILABLE") return "Pembaca teks perlu disiapkan";
  return "Teks belum dapat dibaca";
}
