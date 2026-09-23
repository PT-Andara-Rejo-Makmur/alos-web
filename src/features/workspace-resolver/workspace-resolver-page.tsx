"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FolderLock,
  Loader2,
} from "lucide-react";

import { authenticatedApiRequest, sessionApiRequest } from "@/lib/api";
import type { Workspace } from "@/features/session";
import { projectWorkspaceChoices, type WorkspaceChoice } from "./workspace-choice";
import { WorkspaceChoiceCard } from "./workspace-choice-card";
import styles from "./workspace-resolver.module.css";

interface SessionPrincipal {
  readonly actor_id?: string;
  readonly display_name?: string;
  readonly email?: string;
  readonly roles?: readonly string[];
  readonly workspace_id?: string;
  readonly workspace_ids?: readonly string[];
}

interface SessionResponse {
  readonly authenticated: boolean;
  readonly principal?: SessionPrincipal | null;
}

export function WorkspaceResolverPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [backendError, setBackendError] = useState(false);
  const [noAccess, setNoAccess] = useState(false);
  const [choices, setChoices] = useState<readonly WorkspaceChoice[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [principal, setPrincipal] = useState<SessionPrincipal | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setLoading(true);
    setSessionExpired(false);
    setBackendError(false);
    setNoAccess(false);
    setRetryCount((c) => c + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 1. Verify same-origin session
        let session: SessionResponse;
        try {
          session = await sessionApiRequest<SessionResponse>("/");
        } catch (err: unknown) {
          if (cancelled) return;
          const status = (err as { status?: number }).status;
          if (status === 401) {
            setSessionExpired(true);
          } else {
            setBackendError(true);
          }
          setLoading(false);
          return;
        }

        if (cancelled) return;
        if (!session.authenticated || !session.principal) {
          setSessionExpired(true);
          setLoading(false);
          return;
        }

        const activePrincipal = session.principal;
        setPrincipal(activePrincipal);

        // 2. Fetch accessible workspaces from backend
        let workspaces: Workspace[] = [];
        try {
          workspaces = await authenticatedApiRequest<Workspace[]>("/api/v1/workspaces");
        } catch (err: unknown) {
          if (cancelled) return;
          const status = (err as { status?: number }).status;
          if (status === 401) {
            setSessionExpired(true);
            setLoading(false);
            return;
          }

          if (activePrincipal.workspace_id) {
            workspaces = [
              {
                workspace_id: activePrincipal.workspace_id,
                workspace_key: activePrincipal.workspace_id,
                name: activePrincipal.roles?.includes("DIRECTOR")
                  ? "Executive Workspace"
                  : "Business Workspace",
                division_code: null,
                access_level: "MEMBER",
              },
            ];
          } else {
            setBackendError(true);
            setLoading(false);
            return;
          }
        }

        if (cancelled) return;
        let allowedWorkspaces = workspaces;
        if (activePrincipal.workspace_ids && activePrincipal.workspace_ids.length > 0) {
          allowedWorkspaces = workspaces.filter((ws) =>
            activePrincipal.workspace_ids!.includes(ws.workspace_id),
          );
        }

        const projected = projectWorkspaceChoices(
          allowedWorkspaces,
          activePrincipal.roles ?? [],
        );

        setChoices(projected);

        if (projected.length === 0) {
          setNoAccess(true);
        } else if (projected.length === 1 && projected[0].destination) {
          router.replace(projected[0].destination);
        }
      } catch {
        if (!cancelled) setBackendError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router, retryCount]);

  const handleLogout = async () => {
    try {
      await sessionApiRequest("/", { method: "DELETE" });
    } catch {
      // Clear client state on failure
    }
    router.replace("/login");
  };

  const handleEnterWorkspace = () => {
    const chosen = choices.find((c) => c.id === selectedId);
    if (chosen?.destination) {
      router.push(chosen.destination);
    }
  };

  const selectedChoice = choices.find((c) => c.id === selectedId);

  return (
    <div className={styles.pageRoot}>
      {/* Atmospheric Background Image (Desktop) */}
      <Image
        alt="Latar Belakang Arsitektural ALOS"
        className={styles.bgImageDesktop}
        fill
        priority
        quality={80}
        src="/images/workspace/workspace-resolver-background.webp"
      />
      <div aria-hidden="true" className={styles.bgOverlay} />

      {/* Mobile Header Banner (<768px) */}
      <div className={styles.mobileBanner}>
        <Image
          alt="Latar Belakang Arsitektural ALOS Mobile"
          className={styles.mobileBannerImg}
          fill
          priority
          quality={75}
          src="/images/workspace/workspace-resolver-background-mobile.webp"
        />
        <div className={styles.mobileBannerOverlay}>
          <div className={styles.mobileBannerTop}>
            <Image
              alt="Logo ALOS"
              height={26}
              src="/brand/alos-logo-mark.png"
              width={26}
            />
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#FFFFFF" }}>
              ALOS
            </span>
          </div>
          <div className={styles.mobileBannerBottom}>
            <span className={styles.mobileBannerHeadline}>
              Satu akun. Akses sesuai peran.
            </span>
            <span className={styles.mobileBannerSub}>
              Role dan permission diverifikasi Backend.
            </span>
          </div>
        </div>
      </div>

      {/* Central Floating Panel */}
      <section aria-label="Pemilih Ruang Kerja ALOS" className={styles.centralPanel}>
        {/* Desktop Dual Brand Header */}
        <header className={styles.panelHeader}>
          <div className={styles.andaraLogoFrame}>
            <Image
              alt="Logo PT Andara Rejo Makmur"
              height={36}
              src="/brand/pt-andara-logo.png"
              style={{ objectFit: "contain" }}
              width={36}
            />
          </div>
          <div className={styles.alosDualLogo}>
            <Image
              alt="ALOS Logo Mark"
              height={32}
              src="/brand/alos-logo-mark.png"
              width={32}
            />
            <div>
              <div className={styles.alosDualLogoTitle}>ALOS</div>
              <div className={styles.alosDualLogoSub}>
                ANDARA LEAN OPERATING SYSTEM
              </div>
            </div>
          </div>
        </header>

        {/* State 1: Loading */}
        {loading ? (
          <div className={styles.stateCard}>
            <div className={styles.stateIcon}>
              <Loader2 className="animate-spin" size={28} strokeWidth={2} />
            </div>
            <h2 className={styles.stateTitle}>Memverifikasi akses workspace…</h2>
            <p className={styles.stateBody}>
              Menghubungkan ke ALOS Backend untuk memeriksa hak akses dan context kerja Anda.
            </p>
          </div>
        ) : sessionExpired ? (
          /* State 5: Session Expired */
          <div className={styles.stateCard}>
            <div className={styles.stateIcon}>
              <Clock size={28} strokeWidth={2} />
            </div>
            <h2 className={styles.stateTitle}>Sesi Anda telah berakhir.</h2>
            <p className={styles.stateBody}>
              Sesi autentikasi telah kedaluwarsa demi keamanan. Silakan masuk kembali ke akun Anda.
            </p>
            <div className={styles.stateActions}>
              <button
                className={styles.primaryCta}
                onClick={() => router.replace("/login")}
                type="button"
              >
                <span>Masuk kembali</span>
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        ) : backendError ? (
          /* State 6: Backend Unavailable */
          <div className={styles.stateCard}>
            <div className={styles.stateIcon}>
              <AlertTriangle size={28} strokeWidth={2} />
            </div>
            <h2 className={styles.stateTitle}>Akses workspace belum dapat diverifikasi.</h2>
            <p className={styles.stateBody}>
              ALOS Backend tidak dapat dijangkau. Tidak ada akses yang diberikan sampai verifikasi berhasil.
            </p>
            <div className={styles.stateActions}>
              <button
                className={styles.primaryCta}
                onClick={retry}
                type="button"
              >
                <span>Coba lagi</span>
              </button>
            </div>
          </div>
        ) : noAccess ? (
          /* State 4: No Access */
          <div className={styles.stateCard}>
            <div className={styles.stateIcon}>
              <FolderLock size={28} strokeWidth={2} />
            </div>
            <h2 className={styles.stateTitle}>Belum ada workspace yang dapat diakses.</h2>
            <p className={styles.stateBody}>
              Akun Anda berhasil diautentikasi, tetapi belum memiliki workspace aktif. Hubungi administrator ALOS bila Anda memerlukan akses.
            </p>
            <div className={styles.stateActions}>
              <button
                className={styles.logoutButton}
                onClick={() => void handleLogout()}
                type="button"
              >
                Keluar
              </button>
              <button
                className={styles.primaryCta}
                onClick={retry}
                type="button"
              >
                Coba lagi
              </button>
            </div>
          </div>
        ) : (
          /* State 3: Multiple Workspaces Chooser */
          <>
            <span className={styles.eyebrow}>AKSES WORKSPACE</span>
            <h1 className={styles.mainHeading}>Pilih ruang kerja Anda.</h1>
            <p className={styles.subHeading}>
              Satu akun ALOS dapat memiliki lebih dari satu peran. Pilih konteks kerja aktif sesuai akses yang diberikan.
            </p>

            {/* Identity Strip */}
            <div className={styles.identityStrip}>
              <div className={styles.identityLeft}>
                <div aria-hidden="true" className={styles.identityAvatar}>
                  {principal?.email
                    ? principal.email.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <div>
                  <div className={styles.identityTitle}>
                    {principal?.display_name || "Akun terautentikasi"}
                  </div>
                  <div className={styles.identityMeta}>
                    {principal?.email ? `${principal.email} · ` : ""}
                    Satu identitas · {choices.length} akses workspace aktif
                  </div>
                </div>
              </div>
              <div className={styles.sessionSecurePill}>
                <span aria-hidden="true" className={styles.secureDot} />
                <span>SESSION SECURE</span>
              </div>
            </div>

            {/* Cards Grid */}
            <div
              aria-label="Pilihan Ruang Kerja"
              className={styles.cardsGrid}
              role="radiogroup"
            >
              {choices.map((choice) => (
                <WorkspaceChoiceCard
                  choice={choice}
                  isSelected={selectedId === choice.id}
                  key={choice.id}
                  onSelect={(c) => setSelectedId(c.id)}
                />
              ))}
            </div>

            {/* Bottom Actions Row */}
            <div className={styles.bottomRow}>
              <span className={styles.bottomFootnote}>
                Akses workspace mengikuti role, scope, dan permission dari ALOS Backend.
              </span>

              <div className={styles.bottomActions}>
                <button
                  className={styles.logoutButton}
                  onClick={() => void handleLogout()}
                  type="button"
                >
                  Keluar
                </button>

                <button
                  className={styles.primaryCta}
                  disabled={!selectedChoice || !selectedChoice.isAvailable}
                  onClick={handleEnterWorkspace}
                  type="button"
                >
                  <span>
                    {selectedChoice
                      ? `Masuk ke ${selectedChoice.name}`
                      : "Pilih Ruang Kerja"}
                  </span>
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </div>

              {/* Mobile Footer Meta */}
              <div className={styles.mobileFooterRow}>
                <button
                  className={styles.logoutButton}
                  onClick={() => void handleLogout()}
                  style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                  type="button"
                >
                  Keluar
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.76rem", color: "#36B37E" }}>
                  <span className={styles.secureDot} />
                  <span>Session secure</span>
                </div>
              </div>
            </div>

            {/* Panel Footer Note */}
            <div className={styles.panelFooterNote}>
              <span className={styles.andaraBrandNote}>PT ANDARA REJO MAKMUR</span>
              <span>&middot;</span>
              <span>Authority akses tetap berada di ALOS Backend.</span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
