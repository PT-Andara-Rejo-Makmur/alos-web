import Image from "next/image";
import Link from "next/link";

import { ResetPasswordForm } from "./reset-password-form";
import styles from "./login-page.module.css";

export function ResetPasswordPage() {
  return (
    <div className={styles.loginWrapper}>
      <main className={styles.formPanel} aria-label="Atur Ulang Kata Sandi ALOS">
        <div className={styles.formTopBar}>
          <Link className={styles.backLink} href="/login">
            Kembali ke masuk
          </Link>
        </div>
        <div className={styles.formContainer}>
          <div className={styles.alosLogoBox}>
            <Image src="/brand/alos-logo-mark.png" alt="Logo ALOS" width={52} height={52} />
          </div>
          <p className={styles.formEyebrow}>ANDARA LEAN OPERATING SYSTEM</p>
          <h1 className={styles.formHeading}>Atur ulang kata sandi.</h1>
          <p className={styles.formDescription}>
            Tentukan kata sandi baru untuk akun ALOS Anda.
          </p>
          <ResetPasswordForm />
        </div>
        <div className={styles.formFooter}>
          <p className={styles.footerMeta}>PT ANDARA REJO MAKMUR &middot; INTERNAL SYSTEM</p>
        </div>
      </main>
    </div>
  );
}
