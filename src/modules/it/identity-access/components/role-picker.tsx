"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import styles from "./role-picker.module.css";

function displayRole(role: string): string {
  return role.replaceAll("_", " ");
}

export function RolePicker({
  options,
  selected,
  onChange,
}: {
  readonly options: readonly string[];
  readonly selected: readonly string[];
  readonly onChange: (roles: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const visibleOptions = options.filter((role) =>
    displayRole(role).toLowerCase().includes(query.toLowerCase()),
  );

  function toggleRole(role: string) {
    onChange(
      selected.includes(role)
        ? selected.filter((item) => item !== role)
        : [...selected, role],
    );
  }

  return (
    <div className={styles.rolePicker}>
      <div className={styles.roleChips}>
        {selected.map((role) => (
          <span className={styles.roleChip} key={role}>
            {displayRole(role)}
            <button
              aria-label={`Hapus role ${displayRole(role)}`}
              type="button"
              onClick={() => toggleRole(role)}
            >
              <X aria-hidden={true} size={14} />
            </button>
          </span>
        ))}
      </div>
      <details className={styles.roleMenu}>
        <summary>
          <Plus aria-hidden={true} size={14} />
          Tambah Role
        </summary>
        <div className={styles.roleMenuPanel}>
          <input
            aria-label="Cari role"
            placeholder="Cari role..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className={styles.roleMenuOptions}>
            {visibleOptions.map((role) => (
              <label key={role}>
                <input
                  type="checkbox"
                  checked={selected.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                <span>{displayRole(role)}</span>
              </label>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
