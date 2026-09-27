"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import styles from "./ui.module.css";

export interface TabItem {
  readonly content?: ReactNode;
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: ReactNode;
}

export interface TabsProps {
  readonly ariaLabel?: string;
  readonly defaultValue?: string;
  readonly items: readonly TabItem[];
  readonly onValueChange?: (value: string) => void;
  readonly value?: string;
}

export function Tabs({
  ariaLabel = "Tab navigasi",
  defaultValue,
  items,
  onValueChange,
  value,
}: TabsProps) {
  const firstEnabled = items.find((item) => !item.disabled)?.id ?? "";
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabled);
  const activeValue = value ?? internalValue;
  const activeItem = items.find((item) => item.id === activeValue && !item.disabled) ?? items.find((item) => !item.disabled);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const baseId = `alos-tabs-${useId().replaceAll(":", "")}`;

  function select(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, item: TabItem) {
    const enabled = items.filter((candidate) => !candidate.disabled);
    const currentIndex = enabled.findIndex((candidate) => candidate.id === item.id);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % enabled.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = enabled.length - 1;
    if (nextIndex === currentIndex || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const nextItem = enabled[nextIndex];
    select(nextItem.id);
    tabRefs.current[nextItem.id]?.focus();
  }

  return (
    <div className={styles.tabs}>
      <div aria-label={ariaLabel} className={styles.tabList} role="tablist">
        {items.map((item) => {
          const selected = item.id === activeItem?.id;
          const tabId = `${baseId}-tab-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;
          return (
            <button
              aria-controls={panelId}
              aria-selected={selected}
              className={[styles.tab, selected ? styles.tabSelected : ""].filter(Boolean).join(" ")}
              disabled={item.disabled}
              id={tabId}
              key={item.id}
              onClick={() => select(item.id)}
              onKeyDown={(event) => handleKeyDown(event, item)}
              ref={(element) => { tabRefs.current[item.id] = element; }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {activeItem?.content !== undefined ? (
        <div
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          className={styles.tabPanel}
          id={`${baseId}-panel-${activeItem.id}`}
          role="tabpanel"
          tabIndex={0}
        >
          {activeItem.content}
        </div>
      ) : null}
    </div>
  );
}
