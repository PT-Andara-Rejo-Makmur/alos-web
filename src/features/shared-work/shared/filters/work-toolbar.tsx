"use client";

import { Search, X } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";

import { Toolbar } from "@/components/ui";

import styles from "./work-filters.module.css";

export interface FilterOption {
  readonly label: string;
  readonly value: string;
}

export interface WorkToolbarProps {
  readonly actions?: ReactNode;
  readonly onSearchChange: (value: string) => void;
  readonly onStatusChange?: (value: string) => void;
  readonly onWorkspaceChange?: (value: string) => void;
  readonly searchPlaceholder?: string;
  readonly searchValue: string;
  readonly statusOptions?: readonly FilterOption[];
  readonly statusValue?: string;
  readonly workspaceOptions?: readonly FilterOption[];
  readonly workspaceValue?: string;
}

export function WorkToolbar({
  actions,
  onSearchChange,
  onStatusChange,
  onWorkspaceChange,
  searchPlaceholder = "Cari…",
  searchValue,
  statusOptions,
  statusValue = "ALL",
  workspaceOptions,
  workspaceValue = "ALL",
}: WorkToolbarProps) {
  const searchElement = (
    <div className={styles.searchContainer}>
      <Search aria-hidden="true" className={styles.searchIcon} size={16} strokeWidth={2} />
      <input
        aria-label={searchPlaceholder}
        className={styles.searchInput}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        type="search"
        value={searchValue}
      />
      {searchValue ? (
        <button
          aria-label="Bersihkan pencarian"
          className={styles.clearSearch}
          onClick={() => onSearchChange("")}
          type="button"
        >
          <X aria-hidden="true" size={14} />
        </button>
      ) : null}
    </div>
  );

  const filtersElement = (
    <div className={styles.filterGroup}>
      {statusOptions && statusOptions.length > 0 && onStatusChange ? (
        <select
          aria-label="Filter status"
          className={styles.filterSelect}
          onChange={(event) => onStatusChange(event.target.value)}
          value={statusValue}
        >
          <option value="ALL">Semua Status</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {workspaceOptions && workspaceOptions.length > 0 && onWorkspaceChange ? (
        <select
          aria-label="Filter ruang kerja"
          className={styles.filterSelect}
          onChange={(event) => onWorkspaceChange(event.target.value)}
          value={workspaceValue}
        >
          <option value="ALL">Semua Workspace</option>
          {workspaceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );

  return (
    <Toolbar
      actions={actions}
      filters={filtersElement}
      search={searchElement}
    />
  );
}
