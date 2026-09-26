"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authenticatedApiRequest, apiMessage } from "@/lib/api";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { ItUnavailableSurface } from "@/modules/it/ui";
import { RolePicker } from "../components/role-picker";
import styles from "./account-registration.module.css";

type FormState = { display_name: string; email: string; password: string; role_refs: string[] };
type WorkspaceOption = { workspace_id: string; workspace_key: string; workspace_name: string; workspace_type?: string; active?: boolean };
type ProvisionedAccount = { actor: { actor_id: string } };

export function AccountRegistrationPage() {
  const [form, setForm] = useState<FormState>({ display_name: "", email: "", password: "", role_refs: [] });
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assignableRoles, setAssignableRoles] = useState<string[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [roles, workspaceItems] = await Promise.all([
          authenticatedApiRequest<string[]>("/api/v1/identity/assignable-roles"),
          authenticatedApiRequest<WorkspaceOption[]>("/api/v1/identity/workspaces"),
        ]);
        if (!active) return;
        setAssignableRoles(roles);
        setWorkspaces(workspaceItems);
      } catch (error) {
        setMessage(apiMessage(error));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ProtectedDomainWorkspace
      activeNavKey="register-user"
      deniedTitle="User Management hanya untuk IT"
      divisionCodes={["IT", "TECHNOLOGY"]}
      loadingLabel="Memverifikasi otoritas IT…"
      workspaceKeys={["it", "technology"]}
    >
      {({ actor }) => {
        const isAdmin =
          actor.roles.includes("IT_ADMIN") && actor.permissions?.includes("identity.accounts.manage");
        const selectedWorkspaces = workspaces.filter((item) =>
          selectedWorkspaceIds.includes(item.workspace_id),
        );

        function nextStep() {
          setMessage("");
          if (
            step === 1 &&
            (!form.display_name.trim() || !form.email.trim() || form.password.length < 8)
          ) {
            setMessage("Lengkapi informasi akun. Password minimal 8 karakter.");
            return;
          }
          if (step === 2 && (!selectedWorkspaces.length || form.role_refs.length === 0)) {
            setMessage("Pilih minimal satu workspace dan satu role.");
            return;
          }
          setStep((current) => Math.min(3, current + 1));
        }

        function previousStep() {
          setMessage("");
          setStep((current) => Math.max(1, current - 1));
        }

        async function submit() {
          if (
            step !== 3 ||
            !isAdmin ||
            submitting ||
            !selectedWorkspaces.length ||
            form.role_refs.length === 0
          ) {
            return;
          }
          setSubmitting(true);
          setMessage("");
          try {
            const created = await authenticatedApiRequest<ProvisionedAccount>(
              "/api/v1/identity/accounts",
              {
                method: "POST",
                body: {
                  ...form,
                  workspace_id: selectedWorkspaces[0].workspace_id,
                  permission_refs: [],
                  scope_refs: [],
                  data_scope: "OWN_ASSIGNED",
                },
              },
            );
            for (const workspace of selectedWorkspaces.slice(1)) {
              await authenticatedApiRequest(
                `/api/v1/identity/actors/${encodeURIComponent(created.actor.actor_id)}/memberships`,
                {
                  method: "POST",
                  body: {
                    workspace_id: workspace.workspace_id,
                    role_refs: form.role_refs,
                    permission_refs: [],
                    scope_refs: [],
                    data_scope: "OWN_ASSIGNED",
                  },
                },
              );
            }
            setMessage("Akun berhasil dibuat.");
            window.setTimeout(() => {
              setForm({ display_name: "", email: "", password: "", role_refs: [] });
              setSelectedWorkspaceIds([]);
              setStep(1);
              setMessage("");
            }, 1800);
          } catch (error) {
            setMessage(apiMessage(error));
          } finally {
            setSubmitting(false);
          }
        }

        if (!isAdmin) {
          return (
            <ItUnavailableSurface
              backHref="/workspace/it/users"
              backLabel="← Kembali ke Kelola Akun"
              description="Membership IT aktif dengan izin pengelolaan akun diperlukan."
              eyebrow="ALOS / IT / IDENTITY & ACCESS"
              readiness={{ availability: "BLOCKED", blockReason: "ACCESS_DENIED" }}
              title="Akses Dibatasi"
            />
          );
        }

        return (
          <section className={styles.page}>
            <div className={styles.registrationHeader}>
              <div>
                <p className={styles.eyebrow}>IT · IDENTITY & ACCESS</p>
                <h1 className={styles.title}>Register Akun Baru</h1>
                <p className={styles.intro}>Buat akun baru dan tentukan akses awal pengguna.</p>
              </div>
              <Link className={styles.back} href="/workspace/it/users">
                Kembali ke Kelola Akun
              </Link>
            </div>
            <div aria-label="Tahapan registrasi" className={styles.stepper}>
              {(
                [
                  [1, "Informasi Akun"],
                  [2, "Akses Awal"],
                  [3, "Konfirmasi"],
                ] as Array<[number, string]>
              ).map(([number, label]) => (
                <div className={step >= number ? styles.stepActive : styles.step} key={number}>
                  <span>{number}</span>
                  <strong>{label}</strong>
                </div>
              ))}
            </div>
            <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
              {step === 1 ? (
                <section className={styles.wizardSection}>
                  <h2>Informasi Akun</h2>
                  <p className={styles.roleHint}>Masukkan identitas dasar pengguna.</p>
                  <div className={styles.fields}>
                    <label className={styles.field}>
                      Nama lengkap
                      <input
                        required
                        value={form.display_name}
                        onChange={(event) => setForm({ ...form, display_name: event.target.value })}
                      />
                    </label>
                    <label className={styles.field}>
                      Email kerja
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                      />
                    </label>
                    <label className={styles.field}>
                      Password awal
                      <input
                        minLength={8}
                        required
                        type="password"
                        value={form.password}
                        onChange={(event) => setForm({ ...form, password: event.target.value })}
                      />
                    </label>
                  </div>
                </section>
              ) : null}
              {step === 2 ? (
                <section className={styles.wizardSection}>
                  <h2>Akses Awal</h2>
                  <p className={styles.roleHint}>
                    Pilih satu atau lebih workspace dan role berdasarkan data yang disediakan
                    Backend.
                  </p>
                  <div className={styles.accessGrid}>
                    <div>
                      <span className={styles.formLabel}>Workspace tujuan</span>
                      <div className={styles.workspacePicker}>
                        {workspaces.map((item) => (
                          <label className={styles.workspaceOption} key={item.workspace_id}>
                            <input
                              checked={selectedWorkspaceIds.includes(item.workspace_id)}
                              type="checkbox"
                              onChange={(event) =>
                                setSelectedWorkspaceIds((current) =>
                                  event.target.checked
                                    ? [...current, item.workspace_id]
                                    : current.filter((id) => id !== item.workspace_id),
                                )
                              }
                            />
                            <span>{item.workspace_name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className={styles.formLabel}>Role</span>
                      <RolePicker
                        options={assignableRoles}
                        selected={form.role_refs}
                        onChange={(roles) => setForm({ ...form, role_refs: roles })}
                      />
                    </div>
                  </div>
                </section>
              ) : null}
              {step === 3 ? (
                <section className={styles.wizardSection}>
                  <h2>Konfirmasi</h2>
                  <p className={styles.roleHint}>
                    Periksa kembali informasi dan akses awal sebelum membuat akun.
                  </p>
                  <dl className={styles.confirmationList}>
                    <div>
                      <dt>Nama lengkap</dt>
                      <dd>{form.display_name}</dd>
                    </div>
                    <div>
                      <dt>Email</dt>
                      <dd>{form.email}</dd>
                    </div>
                    <div>
                      <dt>Workspace</dt>
                      <dd>
                        <div className={styles.confirmationValues}>
                          {selectedWorkspaces.map((item) => (
                            <span key={item.workspace_id}>{item.workspace_name}</span>
                          ))}
                        </div>
                      </dd>
                    </div>
                    <div>
                      <dt>Role</dt>
                      <dd>
                        <div className={styles.roleChips}>
                          {form.role_refs.map((role) => (
                            <span className={styles.roleChip} key={role}>
                              {role.replaceAll("_", " ")}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  </dl>
                </section>
              ) : null}
              {message ? (
                <p className={`${styles.status} ${styles.successMessage}`} role="status">
                  {message}
                </p>
              ) : null}
              <div className={styles.wizardActions}>
                {step > 1 ? (
                  <button className={styles.cancelButton} type="button" onClick={previousStep}>
                    Kembali
                  </button>
                ) : (
                  <Link className={styles.cancelButton} href="/workspace/it/users">
                    Batal
                  </Link>
                )}
                {step < 3 ? (
                  <button className={styles.saveButton} type="button" onClick={nextStep}>
                    Lanjutkan
                  </button>
                ) : (
                  <button
                    className={styles.saveButton}
                    disabled={submitting}
                    type="button"
                    onClick={() => void submit()}
                  >
                    {submitting ? "Membuat akun…" : "Register Akun"}
                  </button>
                )}
              </div>
            </form>
          </section>
        );
      }}
    </ProtectedDomainWorkspace>
  );
}

export const UserRegistrationPage = AccountRegistrationPage;
