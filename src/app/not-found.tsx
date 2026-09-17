import Link from "next/link";

export default function NotFound() {
  return (
    <main className="centered-state panel">
      <p className="eyebrow">404</p>
      <h1>Workspace tidak ditemukan</h1>
      <p>Route ini tidak termasuk pengalaman ALOS yang tersedia.</p>
      <Link className="button button--primary" href="/">
        Kembali ke beranda
      </Link>
    </main>
  );
}
