import { ApiConfigurationError } from "./errors";

export function getBackendBaseUrl(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_ALOS_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, "") : undefined;
}

export function requireBackendBaseUrl(): string {
  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) throw new ApiConfigurationError();

  const url = new URL(baseUrl);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new ApiConfigurationError("ALOS Backend URL harus menggunakan HTTP atau HTTPS.");
  }
  return url.toString().replace(/\/$/, "");
}
