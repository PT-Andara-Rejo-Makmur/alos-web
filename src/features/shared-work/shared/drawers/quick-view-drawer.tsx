"use client";

import type { ReactNode } from "react";

import { Drawer } from "@/components/ui";

interface QuickViewDrawerProps {
  readonly children: ReactNode;
  readonly description?: ReactNode;
  readonly footer?: ReactNode;
  readonly onClose: () => void;
  readonly open: boolean;
  readonly title: ReactNode;
}

export function QuickViewDrawer({
  children,
  description,
  footer,
  onClose,
  open,
  title,
}: QuickViewDrawerProps) {
  return (
    <Drawer
      description={description}
      footer={footer}
      onClose={onClose}
      open={open}
      title={title}
    >
      {children}
    </Drawer>
  );
}
