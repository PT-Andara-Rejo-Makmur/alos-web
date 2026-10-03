import Link from "next/link";

import { EmptyState, PageHeader } from "@/components/ui";

import styles from "./unavailable-feature.module.css";

export function UnavailableFeature({ feature, backHref, backLabel }: Readonly<{
  feature: string;
  backHref: string;
  backLabel: string;
}>) {
  return <section className={styles.page}>
    <PageHeader title="Fitur belum tersedia" />
    <EmptyState
      title={feature}
      description="Fungsi ini belum menjadi bagian dari sistem operasional ALOS saat ini."
      action={<Link className={styles.backLink} href={backHref}>{backLabel}</Link>}
    />
  </section>;
}
