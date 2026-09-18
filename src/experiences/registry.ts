export type ExperienceId =
  | "business"
  | "ara"
  | "genesis"
  | "agents"
  | "research"
  | "governance"
  | "director"
  | "giivepro";

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
    id: "agents",
    href: "/agents",
    name: "Agents & Capabilities",
    audience: "IT REGISTRY VIEW",
    summary: "Purpose, scope, risk, tools, lifecycle, dan readiness dari Backend.",
    description:
      "Tinjau projection Agent dan Capability tanpa membuat registry atau lifecycle state lokal.",
    boundaryTitle: "Registry authoritative berada di Backend",
    boundary:
      "Frontend hanya membaca summary bertipe dan tidak dapat mengaktifkan draft atau mengubah permission.",
    tone: "cyan",
  },
  {
    id: "research",
    href: "/research",
    name: "R&D Workspace",
    audience: "RESEARCH REQUEST",
    summary: "Satu workspace untuk riset INTERNAL/EXTERNAL dan empat domain R&D.",
    description:
      "Pilih mode dan domain riset; policy sumber, permission, egress, dan evidence tetap diputuskan Backend.",
    boundaryTitle: "Pilihan UI bukan izin akses",
    boundary:
      "Mode EXTERNAL hanya sebuah request. Backend tetap menerapkan source policy, egress, audit, dan governance.",
    tone: "violet",
  },
  {
    id: "governance",
    href: "/governance",
    name: "Governance",
    audience: "REVIEW & ASSURANCE",
    summary: "Review package, evidence, approval, release, dan readiness projection.",
    description:
      "Tinjau state governance yang dikembalikan Backend tanpa optimistic approval atau release lokal.",
    boundaryTitle: "Decision dan release tetap server-side",
    boundary:
      "AI recommendation adalah input review; hanya Backend yang mencatat keputusan dan lifecycle final.",
    tone: "amber",
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
