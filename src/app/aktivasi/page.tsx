import type { Metadata } from "next";

import { AccountActivationPage } from "@/features/session/account-activation-page";

export const metadata: Metadata = {
  title: "Aktivasi Akun ALOS",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountActivationPage />;
}
