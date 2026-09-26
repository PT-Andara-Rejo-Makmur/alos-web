"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Plus, X } from "lucide-react";
import { apiMessage } from "@/lib/api";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import {
  ItDataTable,
  ItEmptyState,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusBadge,
  ItUnavailableSurface,
} from "@/modules/it/ui";
import { RolePicker } from "../components/role-picker";
import {
  loadIdentityAccessData,
  saveActorMemberships,
  type Account,
  type DraftMembership,
  type Membership,
  type WorkspaceOption,
} from "../shared";
import styles from "./workspace-access.module.css";

const DATA_SCOPES: readonly Membership["data_scope"][] = [
  "COMPANY",
  "ORGANIZATIONAL_UNIT",
  "WORKSPACE",
  "PROJECT",
  "OWN_ASSIGNED",
];

function displayRole(role: string): string {
  return role.replaceAll("_", " ");
}

function WorkspaceAccessContent() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [workspaceOptions, setWorkspaceOptions] = useState<WorkspaceOption[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [draftMemberships, setDraftMemberships] = useState<DraftMembership[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const data = await loadIdentityAccessData();
      setAccounts(data.accounts);
      setRoleOptions(data.assignableRoles);
      setWorkspaceOptions(data.workspaces);
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

  function openEdit(account: Account) {
    setError("");
    setEditingAccount(account);
    setDraftMemberships(
      account.workspace_access.map((membership) => ({
        ...membership,
        role_refs: [...membership.role_refs],
        original_workspace_id: membership.workspace.workspace_id,
      })),
    );
  }

  function addMembership() {
    const firstWorkspace = workspaceOptions[0];
    if (!firstWorkspace) return;
    setDraftMemberships((current) => [
      ...current,
      {
        workspace: firstWorkspace,
        role_refs: [],
        permission_refs: [],
        scope_refs: [],
        data_scope: "WORKSPACE",
        original_workspace_id: null,
      },
    ]);
  }

  function removeMembership(index: number) {
    setDraftMemberships((current) => current.filter((_, i) => i !== index));
  }

  function updateDraft(index: number, patch: Partial<DraftMembership>) {
    setDraftMemberships((current) =>
      current.map((membership, itemIndex) =>
        itemIndex === index ? { ...membership, ...patch } : membership,
      ),
    );
  }

  function selectWorkspace(index: number, event: ChangeEvent<HTMLSelectElement>) {
    const option = workspaceOptions.find((item) => item.workspace_id === event.target.value);
    if (option) updateDraft(index, { workspace: option });
  }

  async function saveMemberships() {
    if (!editingAccount) return;
    if (
      !draftMemberships.length ||
      draftMemberships.some(
        (membership) => !membership.workspace.workspace_id || membership.role_refs.length === 0,
      )
    ) {
      setError("Setiap membership harus memiliki workspace dan minimal satu role.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveActorMemberships({
        actorId: editingAccount.actor_id,
        originalMemberships: editingAccount.workspace_access,
        draftMemberships,
      });
      setEditingAccount(null);
      await loadData();
    } catch (cause) {
      setError(apiMessage(cause));
    } finally {
      setSaving(false);
    }
  }

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
      account.display_name.toLowerCase().includes(q) || account.email.toLowerCase().includes(q);
    const matchesWorkspace =
      membership?.workspace.workspace_name.toLowerCase().includes(q) ||
      membership?.workspace.workspace_key.toLowerCase().includes(q);
    const matchesRole = membership?.role_refs.some((r) => r.toLowerCase().includes(q));
    return matchesUser || Boolean(matchesWorkspace) || Boolean(matchesRole);
  });

  return (
    <div className={styles.workspaceWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / WORKSPACE ACCESS"
        description="Melihat dan mengelola keanggotaan workspace (workspace membership) pengguna sesuai otoritas Backend."
        title="Workspace Access"
      />

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

      <section aria-labelledby="workspace-access-table-title" className={styles.section}>
        <div className={styles.filterBar}>
          <ItSectionHeader
            eyebrow="Access Control"
            id="workspace-access-table-title"
            subtitle="Daftar keanggotaan workspace per akun pengguna"
            title="Workspace Memberships"
          />
          <div className={styles.filterActions}>
            <input
              aria-label="Cari akun atau workspace"
              className={styles.searchInput}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari user, workspace, role…"
              type="search"
              value={searchQuery}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>
            <span>Memuat data keanggotaan workspace…</span>
          </div>
        ) : filteredRows.length === 0 ? (
          <ItEmptyState
            description={searchQuery ? "Tidak ada hasil pencarian yang cocok." : "Belum ada data akun atau membership terdaftar."}
            title="Tidak Ada Keanggotaan Workspace"
          />
        ) : (
          <ItDataTable
            ariaLabel="Tabel Keanggotaan Workspace Pengguna"
            columns={["User", "Workspace", "Roles", "Data Scope", "State", "Action"]}
            minWidth={880}
          >
            {filteredRows.map(({ account, membership, key }) => (
              <tr key={key}>
                <td>
                  <div className={styles.userCell}>
                    <strong className={styles.userName}>{account.display_name}</strong>
                    <span className={styles.userEmail}>{account.email}</span>
                  </div>
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
                  {membership ? (
                    <code className={styles.codeTag}>{membership.data_scope}</code>
                  ) : (
                    <span className={styles.textMuted}>—</span>
                  )}
                </td>
                <td>
                  <ItStatusBadge status={account.active ? "AVAILABLE" : "BLOCKED"} />
                </td>
                <td>
                  <button
                    className={styles.actionBtn}
                    onClick={() => openEdit(account)}
                    type="button"
                  >
                    Kelola
                  </button>
                </td>
              </tr>
            ))}
          </ItDataTable>
        )}
      </section>

      {/* Membership Management Modal */}
      {editingAccount ? (
        <div
          aria-labelledby="modal-title"
          aria-modal="true"
          className={styles.modalOverlay}
          role="dialog"
        >
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle} id="modal-title">
                  Kelola Keanggotaan Workspace
                </h3>
                <p className={styles.modalSubtitle}>
                  {editingAccount.display_name} ({editingAccount.email})
                </p>
              </div>
              <button
                aria-label="Tutup dialog"
                className={styles.closeBtn}
                onClick={() => setEditingAccount(null)}
                type="button"
              >
                <X aria-hidden={true} size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.membershipListHeader}>
                <strong>Daftar Workspace ({draftMemberships.length})</strong>
                <button
                  className={styles.addBtn}
                  onClick={addMembership}
                  type="button"
                >
                  <Plus aria-hidden={true} size={16} />
                  Tambah Workspace
                </button>
              </div>

              {draftMemberships.map((membership, index) => (
                <div className={styles.membershipItem} key={membership.original_workspace_id ?? index}>
                  <div className={styles.membershipFormRow}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor={`workspace-${index}`}>Workspace</label>
                      <select
                        id={`workspace-${index}`}
                        onChange={(e) => selectWorkspace(index, e)}
                        value={membership.workspace.workspace_id}
                      >
                        {workspaceOptions.map((opt) => (
                          <option key={opt.workspace_id} value={opt.workspace_id}>
                            {opt.workspace_name} ({opt.workspace_key})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor={`datascope-${index}`}>Data Scope</label>
                      <select
                        id={`datascope-${index}`}
                        onChange={(e) =>
                          updateDraft(index, {
                            data_scope: e.target.value as Membership["data_scope"],
                          })
                        }
                        value={membership.data_scope}
                      >
                        {DATA_SCOPES.map((scope) => (
                          <option key={scope} value={scope}>
                            {scope}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      aria-label="Hapus workspace"
                      className={styles.removeBtn}
                      onClick={() => removeMembership(index)}
                      type="button"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className={styles.rolePickerBox}>
                    <label>Peran (Roles)</label>
                    <RolePicker
                      onChange={(role_refs) => updateDraft(index, { role_refs })}
                      options={roleOptions}
                      selected={membership.role_refs}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                disabled={saving}
                onClick={() => setEditingAccount(null)}
                type="button"
              >
                Batal
              </button>
              <button
                className={styles.saveBtn}
                disabled={saving}
                onClick={() => void saveMemberships()}
                type="button"
              >
                {saving ? "Menyimpan…" : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function WorkspaceAccessWorkspace() {
  return (
    <ProtectedDomainWorkspace
      activeNavKey="workspace-access"
      deniedTitle="Workspace Access hanya untuk IT"
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
              description="Akses ditolak: role IT_ADMIN dan izin identity.accounts.manage diperlukan untuk mengelola keanggotaan workspace."
              eyebrow="Otoritas Terbatas"
              readiness={{
                availability: "BLOCKED",
                blockReason: "REQUIRES_AUTHORITY",
              }}
              title="Workspace Access"
            />
          );
        }
        return <WorkspaceAccessContent />;
      }}
    </ProtectedDomainWorkspace>
  );
}
