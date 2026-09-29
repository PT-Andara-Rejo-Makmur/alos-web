import type { ReactNode } from "react";

import { SettingsLayout } from "@/features/settings";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return <SettingsLayout>{children}</SettingsLayout>;
}
