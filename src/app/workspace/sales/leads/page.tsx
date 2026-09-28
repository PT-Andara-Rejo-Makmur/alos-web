import { SalesReadinessPage } from "@/features/sales";
const tabs = [{ id: "all", label: "Semua" }, { id: "mine", label: "Milik Saya" }, { id: "new", label: "Baru" }, { id: "follow-up", label: "Perlu Follow-up" }, { id: "qualified", label: "Qualified" }, { id: "inactive", label: "Tidak Aktif" }] as const;
export default function Page() { return <SalesReadinessPage title="Prospek & Lead" description="Kelola prospek sesuai kewenangan dan klasifikasi data." detail="Data lead, deduplikasi, dan formulir pencatatan menunggu contract Sales." tabs={tabs} />; }
