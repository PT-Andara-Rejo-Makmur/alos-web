import Link from "next/link";
import { STRATEGY_SUBMODULES } from "./strategy-constants";
import styles from "../ui/strategy-ui.module.css";

interface StrategyTabsProps {
  readonly workspaceKey: string;
  readonly activeSubmodule?: string;
  readonly activeTab?: string;
}

export function StrategyTabs({ workspaceKey, activeSubmodule, activeTab }: StrategyTabsProps) {
  const currentSubmodule = activeSubmodule ?? activeTab ?? "overview";
  const basePath = `/workspace/${workspaceKey}/strategy`;

  return (
    <nav aria-label="Navigasi Bagian Strategi" className={styles.tabsContainer}>
      {STRATEGY_SUBMODULES.map((submodule) => {
        const href = `${basePath}${submodule.hrefSuffix}`;
        const isActive = currentSubmodule === submodule.key;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ""}`}
            href={href}
            key={submodule.key}
          >
            {submodule.label}
          </Link>
        );
      })}
    </nav>
  );
}
