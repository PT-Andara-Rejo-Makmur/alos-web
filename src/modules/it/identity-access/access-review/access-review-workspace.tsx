"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import {
  ItDataTable,
  ItEmptyState,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusBadge,
  ItStatusRow,
  ItUnavailableSurface,
} from "@/modules/it/ui";
import styles from "./access-review.module.css";

interface Membership {
  workspace: {
    workspace_id: string;
    workspace_key: string;
    workspace_name: string;
    workspace_type?: string;
  };
  role_refs: string[];
  permission_refs: string[];
  scope_refs: string[];
  data_scope: "COMPANY" | "ORGANIZATIONAL_UNIT" | "WORKSPACE" | "PROJECT" | "OWN_ASSIGNED";
}

interface Account {
  actor_id: string;
  display_name: string;
  email: string;
  active: boolean;
  workspace_access: Membership[];
}

function displayRole(role: string): string {
  return role.replaceAll("_", " ");
}

function AccessReviewContent() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const nextAccounts = await authenticatedApiRequest<Account[]>("/api/v1/identity/accounts");
      setAccounts(nextAccounts);
    } catch (cause) {
      setError(apiMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const flattenedRows = accounts.flatMap((account) => {
    if (account.workspace_access.length === 0) {
      return [
        {
          account,
          membership: null as Membership | null,
          key: `${account.actor_id}-none`,
        },
      ];
    }
    return account.workspace_access.map((membership) => ({
      account,
      membership,
      key: `${account.actor_id}-${membership.workspace.workspace_id}`,
    }));
  });

  const filteredRows = flattenedRows.filter(({ account, membership }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesUser =
      account.display_name.toLowerCase().includes(q) ||
      account.email.toLowerCase().includes(q) ||
      account.actor_id.toLowerCase().includes(q);
    const matchesWorkspace =
      membership?.workspace.workspace_name.toLowerCase().includes(q) ||
      membership?.workspace.workspace_key.toLowerCase().includes(q);
    const matchesRole = membership?.role_refs.some((r) => r.toLowerCase().includes(q));
    const matchesPerm = membership?.permission_refs.some((p) => p.toLowerCase().includes(q));
    return matchesUser || Boolean(matchesWorkspace) || Boolean(matchesRole) || Boolean(matchesPerm);
  });

  return (
    <div className={styles.reviewWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / ACCESS REVIEW"
        description="Tinjauan hak akses efektif (effective-access review) seluruh pengguna berdasarkan proyeksi Backend saat ini."
        title="Access Review"
      />

      {/* Identity Source Status */}
      <section aria-label="Identity source status">
        <ItStatusRow
          detail="LIVE_PROJECTION"
          helper="Proyeksi hak akses efektif dibaca langsung dari Backend identity service."
          icon={ShieldCheck}
          label="Identity Projection Source"
          status="LIVE"
        />
      </section>

      {error ? (
        <section aria-label="Error status">
          <ItNotice
            title="Terjadi kesalahan komunikasi dengan server"
            variant="warning"
          >
            {error}
          </ItNotice>
        </section>
      ) : null}

      {/* Effective Access Review Table */}
      <section aria-labelledby="effective-access-title" className={styles.section}>
        <div className={styles.filterBar}>
          <ItSectionHeader
            eyebrow="Audit & Governance"
            id="effective-access-title"
            subtitle="Matriks akses efektif per akun dan per scope keanggotaan"
            title="Effective Access Review"
          />
          <div className={styles.filterActions}>
            <input
              aria-label="Filter tinjauan akses"
              className={styles.searchInput}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari user, role, permission…"
              type="search"
              value={searchQuery}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>
            <span>Memuat data proyeksi akses efektif…</span>
          </div>
        ) : filteredRows.length === 0 ? (
          <ItEmptyState
            description={searchQuery ? "Tidak ada hasil pencarian yang cocok." : "Belum ada data akun terdaftar untuk ditinjau."}
            title="Tidak Ada Data Akses"
          />
        ) : (
          <ItDataTable
            ariaLabel="Tabel Tinjauan Hak Akses Efektif"
            columns={[
              "User",
              "Account State",
              "Workspace",
              "Roles",
              "Permission Refs",
              "Scope Refs",
              "Data Scope",
            ]}
            minWidth={1040}
          >
            {filteredRows.map(({ account, membership, key }) => (
              <tr key={key}>
                <td>
                  <div className={styles.userCell}>
                    <strong className={styles.userName}>{account.display_name}</strong>
                    <span className={styles.userEmail}>{account.email}</span>
                    <code className={styles.actorIdTag}>{account.actor_id}</code>
                  </div>
                </td>
                <td>
                  <ItStatusBadge status={account.active ? "AVAILABLE" : "BLOCKED"} />
                </td>
                <td>
                  {membership ? (
                    <div className={styles.workspaceCell}>
                      <span className={styles.workspaceName}>{membership.workspace.workspace_name}</span>
                      <code className={styles.codeTag}>{membership.workspace.workspace_key}</code>
                    </div>
                  ) : (
                    <span className={styles.noMembership}>Tanpa Workspace</span>
                  )}
                </td>
                <td>
                  {membership && membership.role_refs.length > 0 ? (
                    <div className={styles.roleTags}>
                      {membership.role_refs.map((role) => (
                        <span className={styles.roleTag} key={role}>
                          {displayRole(role)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.textMuted}>—</span>
                  )}
                </td>
                <td>
                  {membership && membership.permission_refs.length > 0 ? (
                    <div className={styles.refList}>
                      {membership.permission_refs.map((p) => (
                        <code className={styles.permTag} key={p}>
                          {p}
                        </code>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.textMuted}>—</span>
                  )}
                </td>
                <td>
                  {membership && membership.scope_refs.length > 0 ? (
                    <div className={styles.refList}>
                      {membership.scope_refs.map((s) => (
                        <code className={styles.scopeTag} key={s}>
                          {s}
                        </code>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.textMuted}>—</span>
                  )}
                </td>
                <td>
                  {membership ? (
                    <code className={styles.codeTag}>{membership.data_scope}</code>
                  ) : (
                    <span className={styles.textMuted}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </ItDataTable>
        )}
      </section>

      {/* Change History Audit Boundary */}
      <section aria-labelledby="change-history-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Audit Trail"
          id="change-history-title"
          subtitle="Catatan riwayat perubahan hak akses dan keanggotaan pengguna"
          title="Change History"
        />

        <ItNotice
          title="Change history source unavailable."
          variant="neutral"
        >
          Backend audit-history projection is not connected. Audit trail for historical access transitions requires dedicated identity log telemetry.
        </ItNotice>
      </section>
    </div>
  );
}

export function AccessReviewWorkspace() {
  return (
    <ProtectedDomainWorkspace
      activeNavKey="access-review"
      deniedTitle="Access Review hanya untuk IT"
      divisionCodes={["IT", "TECHNOLOGY"]}
      loadingLabel="Memverifikasi otoritas IT…"
      workspaceKeys={["it", "technology"]}
    >
      {({ actor }) => {
        const allowed =
          actor.roles.includes("IT_ADMIN") &&
          actor.permissions?.includes("identity.accounts.manage");
        if (!allowed) {
          return (
            <ItUnavailableSurface
              description="Akses ditolak: role IT_ADMIN dan izin identity.accounts.manage diperlukan untuk meninjau hak akses pengguna."
              eyebrow="Otoritas Terbatas"
              readiness={{
                availability: "BLOCKED",
                blockReason: "REQUIRES_AUTHORITY",
              }}
              title="Access Review"
            />
          );
        }
        return <AccessReviewContent />;
      }}
    </ProtectedDomainWorkspace>
  );
}
