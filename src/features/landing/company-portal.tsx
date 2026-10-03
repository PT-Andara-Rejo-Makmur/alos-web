import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCheck, FileText, Layers3, MessageCircleQuestion } from "lucide-react";
import styles from "./company-portal.module.css";

const divisions = [
  ["Sales & Marketing", "Dari pelanggan pertama hingga serah terima, setiap tindak lanjut terhubung.", "sales-marketing"],
  ["Property & Teknik", "Pantau proyek, mutu pekerjaan, perubahan, dan kesiapan properti.", "property"],
  ["Finance & Pajak", "Hubungkan anggaran, tagihan, pembayaran, dan kewajiban perusahaan.", "finance"],
  ["Legal & Compliance", "Kelola kontrak, perizinan, dan pemeriksaan yang mendukung keputusan.", "legal-compliance"],
  ["HR & GA", "Dukung perjalanan karyawan serta kesiapan orang dan fasilitas.", "hr"],
  ["IT & Teknologi", "Jaga layanan, akses, dan teknologi yang mendukung pekerjaan.", "it-technology"],
] as const;

export function CompanyPortal() {
  return <div className={styles.portal}>
    <a href="#portal-content" className="alos-skip-link">Langsung ke isi</a>
    <header className={styles.navbar}>
      <Link className={styles.brand} href="/" aria-label="ALOS — Beranda"><Image src="/brand/alos-logo-mark.png" alt="" width={34} height={34} priority /><span>ALOS<small>PT Andara Rejo Makmur</small></span></Link>
      <nav aria-label="Navigasi portal"><a href="#tentang">Tentang ALOS</a><a href="#area-perusahaan">Area perusahaan</a><a href="#ara">ARA</a></nav>
      <Link href="/login" className={styles.navLogin}>Masuk ke ALOS <ArrowRight size={15} aria-hidden="true" /></Link>
    </header>
    <main id="portal-content">
      <section className={styles.hero}>
        <Image src="/images/landing/hero-residential-sunset.webp" alt="Lingkungan hunian dengan pencahayaan hangat saat senja" fill priority sizes="100vw" className={styles.heroImage} />
        <div className={styles.heroCopy}><p className={styles.eyebrow}>RUANG KERJA PERUSAHAAN</p><h1>Pekerjaan terhubung.<br />Keputusan lebih jelas.</h1><p>ALOS — Andara Lean Operating System.<br />Satu tempat untuk menghubungkan pekerjaan, data, proses, keputusan, pemantauan, dan AI di PT Andara Rejo Makmur.</p><Link href="/login" className={styles.primary}>Masuk ke ALOS <ArrowRight size={18} aria-hidden="true" /></Link><span className={styles.heroNote}>Untuk karyawan dan pengguna yang memiliki akses perusahaan.</span></div>
      </section>
      <section id="tentang" className={styles.introduction}><p className={styles.eyebrow}>BEKERJA DALAM SATU ARAH</p><div><h2>Dari pekerjaan sehari-hari<br />hingga keputusan perusahaan.</h2><p>ALOS membantu setiap divisi melihat kondisi pekerjaan, mengetahui tanggung jawabnya, dan meneruskan proses kepada pihak yang tepat. Informasi dan bukti pendukung tetap menyertai setiap langkah.</p></div></section>
      <section className={styles.benefits} aria-label="Cara ALOS membantu pekerjaan">{[
        [Layers3, "Pekerjaan yang jelas", "Ketahui tugas, penanggung jawab, dan tenggat tanpa kehilangan konteks proyek."],
        [CheckCheck, "Proses yang terhubung", "Pemeriksaan dan keputusan lintas-divisi mengikuti alur perusahaan."],
        [FileText, "Informasi yang dapat ditelusuri", "Temukan dokumen dan bukti yang mendasari pekerjaan serta keputusan."],
      ].map(([Icon, title, description]) => { const Mark = Icon as typeof Layers3; return <article key={String(title)}><Mark size={24} strokeWidth={1.5} aria-hidden="true" /><h3>{String(title)}</h3><p>{String(description)}</p></article>; })}</section>
      <section id="area-perusahaan" className={styles.divisions}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ENAM AREA, SATU PERUSAHAAN</p><h2>Ruang kerja sesuai kebutuhan divisi.</h2></div><p>Terhubung dalam proses yang sama,<br />dengan tanggung jawab yang jelas.</p></div><div className={styles.divisionGrid}>{divisions.map(([name, description, image]) => <article key={name}><div className={styles.divisionImage}><Image src={`/images/landing/division-${image}.webp`} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" /></div><div><h3>{name}</h3><p>{description}</p></div></article>)}</div></section>
      <section className={styles.how}><div><p className={styles.eyebrow}>CARA KERJA</p><h2>Selalu tahu<br />langkah berikutnya.</h2></div><ol>{[["Masuk ke ruang kerja", "Lihat kondisi divisi dan pekerjaan yang menjadi tanggung jawab Anda."], ["Tangani yang perlu tindakan", "Periksa, putuskan, atau lanjutkan pekerjaan dengan informasi pendukung."], ["Pantau hasilnya", "Ikuti perkembangan proses, proyek, dan target perusahaan."]].map(([title, copy], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></section>
      <section id="ara" className={styles.assistant}><div className={styles.assistantMark}><MessageCircleQuestion size={36} strokeWidth={1.3} aria-hidden="true" /><span>ARA</span></div><div><p className={styles.eyebrow}>ASISTEN PERUSAHAAN</p><h2>Informasi yang Anda butuhkan,<br />dalam percakapan.</h2><p>Tanya ARA tentang pekerjaan, dokumen, dan kondisi perusahaan. Jawaban mengikuti data serta akses ruang kerja Anda, dengan sumber yang dapat diperiksa. Saran tindakan tetap Anda tinjau sebelum dijalankan.</p><Link href="/login" className={styles.textLink}>Mulai bersama ARA <ArrowRight size={16} aria-hidden="true" /></Link></div></section>
      <section className={styles.cta}><Image src="/images/landing/cta-residential-community.webp" alt="" fill sizes="100vw" /><div><p className={styles.eyebrow}>PT ANDARA REJO MAKMUR</p><h2>Satu perusahaan.<br />Pekerjaan yang saling terhubung.</h2><Link href="/login" className={styles.primary}>Masuk ke ALOS <ArrowRight size={18} aria-hidden="true" /></Link></div></section>
    </main>
    <footer className={styles.footer}><div><Image src="/brand/pt-andara-logo.png" alt="" width={32} height={32} /><span>PT Andara Rejo Makmur</span></div><span>ALOS · Andara Lean Operating System</span><Link href="/login">Portal internal perusahaan</Link></footer>
  </div>;
}
