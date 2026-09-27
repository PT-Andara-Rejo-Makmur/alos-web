import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backgroundColor: "#0B0C0E",
        color: "#F7F5F0",
        textAlign: "center",
        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Halaman tidak ditemukan
      </h1>
      <p style={{ color: "#A8ADB5", marginBottom: "1.5rem" }}>
        Halaman yang Anda tuju tidak tersedia atau sedang dibangun ulang.
      </p>
      <Link
        href="/workspace"
        style={{
          display: "inline-flex",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #F0D083 0%, #D1A357 50%, #9E6E2E 100%)",
          color: "#0B0C0E",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Kembali ke ruang kerja
      </Link>
    </main>
  );
}
