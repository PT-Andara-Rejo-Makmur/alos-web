import Image from "next/image";
import Link from "next/link";

import { AccountActivationForm } from "./account-activation-form";
import styles from "./login-page.module.css";

export function AccountActivationPage() {
  return (
    <div className={styles.loginWrapper}>
      <main className={styles.formPanel} aria-label="Aktivasi Akun ALOS">
        <div className={styles.formTopBar}><Link className={styles.backLink} href="/login">Kembali ke masuk</Link></div>
        <div className={styles.formContainer}>
          <div className={styles.alosLogoBox}>
            <Image src="/brand/alos-logo-mark.png" alt="Logo ALOS" width={52} height={52} />
          </div>
          <p className={styles.formEyebrow}>ANDARA LEAN OPERATING SYSTEM</p>
          <h1 className={styles.formHeading}>Aktifkan akun Anda.</h1>
          <p className={styles.formDescription}>Buat kata sandi untuk mulai menggunakan akun ALOS Anda.</p>
          <AccountActivationForm />
        </div>
        <div className={styles.formFooter}><p className={styles.footerMeta}>PT ANDARA REJO MAKMUR &middot; INTERNAL SYSTEM</p></div>
      </main>
    </div>
  );
}
