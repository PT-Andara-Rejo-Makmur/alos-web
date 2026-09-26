"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { ItUnavailableSurface } from "@/modules/it/ui";
import { loadAccounts, type Account } from "../shared";
import styles from "./account-management.module.css";

function displayRole(role: string): string {
  return role.replaceAll("_", " ");
}

export function AccountManagementPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [draftActive, setDraftActive] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setAccounts(await loadAccounts());
    } catch (cause) {
      setError(apiMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function openEdit(account: Account) {
    setError("");
    setEditingAccount(account);
    setDraftActive(account.active);
  }

  async function saveAccount() {
    if (!editingAccount) return;
    setSaving(true);
    setError("");
    try {
      const actorPath = `/api/v1/identity/actors/${encodeURIComponent(editingAccount.actor_id)}`;
      if (draftActive !== editingAccount.active) {
        await authenticatedApiRequest(`${actorPath}/${draftActive ? "activate" : "suspend"}`, {
          method: "POST",
        });
      }
      setEditingAccount(null);
      await load();
    } catch (cause) {
      setError(apiMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedDomainWorkspace
      activeNavKey="users"
      deniedTitle="Kelola Akun hanya untuk IT"
      divisionCodes={["IT", "TECHNOLOGY"]}
      loadingLabel="Memverifikasi otoritas IT…"
      workspaceKeys={["it", "technology"]}
    >
      {({ actor }) => {
        const allowed =
          actor.roles.includes("IT_ADMIN") && actor.permissions?.includes("identity.accounts.manage");
        if (!allowed) {
          return (
            <ItUnavailableSurface
              backHref="/workspace/it"
              backLabel="← Kembali ke IT Overview"
              description="Hanya IT Admin dengan izin kelola akun yang dapat membuka halaman ini."
              eyebrow="ALOS / IT / IDENTITAS & AKSES"
              readiness={{ availability: "BLOCKED", blockReason: "ACCESS_DENIED" }}
              title="Akses Dibatasi"
            />
          );
        }
        return (
          <section className={styles.pageShell}>
            <div className={styles.headerRow}>
              <div>
                <p className={styles.eyebrow}>IT · IDENTITAS & AKSES</p>
                <h1 className={styles.title}>Kelola Akun</h1>
              </div>
              <Link className={styles.primaryButton} href="/workspace/it/users/register">
                <Plus aria-hidden={true} size={16} />
                Register Akun Baru
              </Link>
            </div>
            <p className={styles.intro}>
              Kelola status akun dan lihat ringkasan akses. Detail membership dikelola melalui Akses Workspace.
            </p>
            {error ? <p className={styles.alert} role="alert">{error}</p> : null}
            {loading ? (
              <div className={styles.loadingState}>Memuat akun…</div>
            ) : (
              <div className={styles.accountTableWrap}>
                <table className={styles.accountTable}>
                  <thead>
                    <tr>
                      <th>Pengguna</th>
                      <th>Email</th>
                      <th>Workspace</th>
                      <th>Peran</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => {
                      const first = account.workspace_access[0];
                      const extraCount = Math.max(0, account.workspace_access.length - 1);
                      return (
                        <tr key={account.actor_id}>
                          <td>
                            <strong>{account.display_name}</strong>
                          </td>
                          <td>{account.email}</td>
                          <td>
                            <div className={styles.tableWorkspace}>
                              {first ? first.workspace.workspace_name : "Belum ada"}
                              {extraCount ? <span>+{extraCount} workspace lainnya</span> : null}
                            </div>
                          </td>
                          <td>
                            <div className={styles.tableRoles}>
                              {first?.role_refs.slice(0, 2).map((role) => (
                                <span className={styles.roleChip} key={role}>
                                  {displayRole(role)}
                                </span>
                              ))}
                              {first && first.role_refs.length > 2 ? (
                                <span className={styles.moreBadge}>
                                  +{first.role_refs.length - 2}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td>
                            <span
                              className={
                                account.active ? styles.statusButtonActive : styles.statusButtonMuted
                              }
                            >
                              {account.active ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td>
                            <button
                              className={styles.editButton}
                              type="button"
                              onClick={() => openEdit(account)}
                            >
                              Ubah Status
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {editingAccount ? (
              <div
                className={styles.drawerBackdrop}
                role="presentation"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget && !saving) setEditingAccount(null);
                }}
              >
                <aside
                  aria-labelledby="edit-account-title"
                  aria-modal="true"
                  className={styles.editDrawer}
                  role="dialog"
                >
                  <div className={styles.drawerHeader}>
                    <div>
                      <p className={styles.eyebrow}>EDIT AKUN</p>
                      <h2 id="edit-account-title">{editingAccount.display_name}</h2>
                      <p>{editingAccount.email}</p>
                    </div>
                    <button
                      aria-label="Tutup edit akun"
                      className={styles.closeButton}
                      type="button"
                      onClick={() => setEditingAccount(null)}
                    >
                      <X aria-hidden={true} size={18} />
                    </button>
                  </div>
                  <div className={styles.drawerBody}>
                    <section className={styles.formSection}>
                      <h3>Informasi Akun</h3>
                      <div className={styles.accountInfoGrid}>
                        <label>
                          Nama lengkap
                          <input readOnly value={editingAccount.display_name} />
                        </label>
                        <label>
                          Email
                          <input readOnly value={editingAccount.email} />
                        </label>
                        <label>
                          Status
                          <select
                            value={draftActive ? "active" : "inactive"}
                            onChange={(event) => setDraftActive(event.target.value === "active")}
                          >
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                          </select>
                        </label>
                      </div>
                    </section>
                    <section className={styles.formSection}>
                      <h3>Ringkasan Keanggotaan</h3>
                      <p>
                        Akun ini memiliki {editingAccount.workspace_access.length} membership workspace.
                        Perubahan role, scope data, dan membership dilakukan pada halaman Akses Workspace.
                      </p>
                      <Link className={styles.secondaryButton} href="/workspace/it/users/access">
                        Buka Akses Workspace
                      </Link>
                    </section>
                  </div>
                  <div className={styles.drawerFooter}>
                    <button
                      className={styles.cancelButton}
                      disabled={saving}
                      type="button"
                      onClick={() => setEditingAccount(null)}
                    >
                      Batal
                    </button>
                    <button
                      className={styles.saveButton}
                      disabled={saving}
                      type="button"
                      onClick={() => void saveAccount()}
                    >
                      {saving ? "Menyimpan…" : "Simpan Perubahan"}
                    </button>
                  </div>
                </aside>
              </div>
            ) : null}
          </section>
        );
      }}
    </ProtectedDomainWorkspace>
  );
}
