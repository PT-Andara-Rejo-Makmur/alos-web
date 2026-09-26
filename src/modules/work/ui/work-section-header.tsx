"use client";

import React, { type ReactNode } from "react";

interface WorkSectionHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly kicker?: string;
  readonly actions?: ReactNode;
}

export const WorkSectionHeader: React.FC<WorkSectionHeaderProps> = ({
  title,
  subtitle,
  kicker,
  actions,
}) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "12px" }}>
      <div>
        {kicker && (
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#78716c" }}>
            {kicker}
          </div>
        )}
        <h3 style={{ margin: "2px 0 0", fontSize: "16px", fontWeight: 700, color: "#1c1917" }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#57534e" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};
