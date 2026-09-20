import Link from "next/link";
import type { ReactNode } from "react";

import { Navigation } from "./navigation";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="app-frame">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="ALOS beranda">
          <span className="brand-mark">A</span>
          <span>
            <strong>ALOS</strong>
            <small>Human + AI Workspace</small>
          </span>
        </Link>
        <Navigation />
        <div className="topbar-meta">
          <span className="environment-badge">FOUNDATION</span>
          <Link className="button button--ghost" href="/login">Masuk</Link>
        </div>
      </header>
      <div className="content-frame">{children}</div>
      <footer className="footer">
        <span>ALOS · Andara Lean Operating System</span>
        <span>Authority berada di Backend</span>
      </footer>
    </div>
  );
}
