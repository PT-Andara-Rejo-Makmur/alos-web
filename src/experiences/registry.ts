export type ExperienceId = "business" | "ara" | "genesis" | "director" | "giivepro";

export interface ExperienceDefinition {
  readonly id: ExperienceId;
  readonly href: `/${ExperienceId}`;
  readonly name: string;
  readonly audience: string;
  readonly summary: string;
  readonly description: string;
  readonly boundaryTitle: string;
  readonly boundary: string;
  readonly tone: "blue" | "violet" | "cyan" | "amber" | "green";
}

export const experiences: readonly ExperienceDefinition[] = [
  {
    id: "business",
    href: "/business",
    name: "Business Workspace",
    audience: "OPERASIONAL PERUSAHAAN",
    summary: "Ruang kerja untuk proses, pekerjaan, dan outcome operasional.",
    description:
      "Kelola aktivitas bisnis melalui projection yang scoped ke tenant dan workspace aktif.",
    boundaryTitle: "Operasi mengikuti policy Backend",
    boundary:
      "Aksi yang tersedia berasal dari permission response. Backend tetap memvalidasi setiap command.",
    tone: "blue",
  },
  {
    id: "ara",
    href: "/ara",
    name: "ARA Workspace",
    audience: "HUMAN + AI COLLABORATION",
    summary: "Workspace manusia dan AI dengan context, evidence, dan lineage.",
    description:
      "Kolaborasikan pekerjaan dengan AI tanpa memberi Agent akses langsung ke authority bisnis.",
    boundaryTitle: "AI membantu, manusia tetap accountable",
    boundary:
      "ARA mengirim permintaan ke Backend. Tool action dan runtime GENESIS tidak dipanggil dari browser.",
    tone: "violet",
  },
  {
    id: "genesis",
    href: "/genesis",
    name: "GENESIS Control Plane",
    audience: "IT ASSURANCE",
    summary: "Review teknis capability, Agent, Skill, evidence, risiko, dan biaya.",
    description:
      "Berikan tim IT projection detail untuk assurance tanpa mengubah AI recommendation menjadi approval.",
    boundaryTitle: "Control plane UI bukan authority",
    boundary:
      "IT decision dikirim sebagai command ke Backend dan baru ditampilkan sebagai final setelah response.",
    tone: "cyan",
  },
  {
    id: "director",
    href: "/director",
    name: "Director Workspace",
    audience: "EXECUTIVE DECISION",
    summary: "Konteks keputusan, impact, risk, cost cap, dan rollback readiness.",
    description:
      "Tinjau keputusan material dalam bahasa bisnis tanpa technical noise atau raw contract payload.",
    boundaryTitle: "Decision dicatat oleh Backend",
    boundary:
      "APPROVE, RETURN, REJECT, dan HOLD adalah command; UI tidak melakukan optimistic final state.",
    tone: "amber",
  },
  {
    id: "giivepro",
    href: "/giivepro",
    name: "GIIVEPRO",
    audience: "TENANT PRODUCT EXPERIENCE",
    summary: "Pengalaman produk tenant di atas identity dan authority ALOS.",
    description:
      "Berikan fitur produk GIIVEPRO dengan isolasi tenant dan governance platform yang konsisten.",
    boundaryTitle: "GIIVEPRO berjalan di atas ALOS",
    boundary:
      "GIIVEPRO tidak memiliki permission atau decision authority terpisah dari ALOS Backend.",
    tone: "green",
  },
] as const;

export function getExperience(id: ExperienceId): ExperienceDefinition {
  const experience = experiences.find((candidate) => candidate.id === id);
  if (!experience) throw new Error(`Unknown experience: ${id}`);
  return experience;
}
