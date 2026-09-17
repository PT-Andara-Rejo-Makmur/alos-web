import { requireBackendBaseUrl } from "@/lib/api/config";

/** Builds only Backend stream URLs; browser-to-GENESIS streams are forbidden. */
export function buildBackendStreamUrl(path: `/${string}`): string {
  return `${requireBackendBaseUrl()}${path}`;
}
