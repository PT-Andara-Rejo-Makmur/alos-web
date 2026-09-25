"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { loadSessionContext } from "@/features/session";
import { ApiError } from "@/lib/api";
import { resolveLegacyRoute } from "./compatibility-routes";

interface LegacyCompatibilityRedirectProps {
  readonly fallbackMessage?: string;
  readonly targetPath?: string;
}

/**
 * Universal compatibility redirect component.
 * Validates backend authority and redirects legacy routes to canonical workspace routes.
 * Never creates authority from URL pathnames; relies solely on HttpOnly session and verified active workspace.
 */
export function LegacyCompatibilityRedirect({
  fallbackMessage = "Mengalihkan ke rute canonical ALOS…",
  targetPath,
}: LegacyCompatibilityRedirectProps) {
  const router = useRouter();
  const currentPathname = usePathname();
  const pathname = targetPath || currentPathname;
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function redirect() {
      try {
        const session = await loadSessionContext();
        if (!isMounted) return;

        const target = resolveLegacyRoute(
          pathname,
          session.activeWorkspace,
          session.actor,
        );
        setDestination(target);
        router.replace(target);
      } catch (err) {
        if (!isMounted) return;
        if (
          (err as { status?: number })?.status === 401 ||
          (err instanceof ApiError && err.status === 401)
        ) {
          router.replace("/login");
          return;
        }
        router.replace("/workspace");
      }
    }

    void redirect();
    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#141619",
        color: "#c5a572",
        fontFamily: "Manrope, sans-serif",
        flexDirection: "column",
        gap: "12px",
      }}
      role="status"
      aria-label="Pengalihan Kompatibilitas ALOS"
    >
      <p style={{ margin: 0 }}>{fallbackMessage}</p>
      {destination ? (
        <Link
          href={destination}
          style={{ color: "#d1a357", fontSize: "14px", textDecoration: "underline" }}
        >
          Lanjutkan ke {destination}
        </Link>
      ) : null}
    </div>
  );
}
