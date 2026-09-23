export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface BenefitItem {
  readonly iconName: "ShieldCheck" | "ChartNoAxesCombined" | "Zap";
  readonly title: string;
}

export interface FeatureCardItem {
  readonly id: string;
  readonly title: string;
  readonly iconName: "Layers3" | "BarChart3" | "Cpu" | "ShieldCheck";
  readonly description: string;
}

export interface DivisionItem {
  readonly id: string;
  readonly name: string;
  readonly image: string;
  readonly alt: string;
  readonly iconName: "TrendingUp" | "HardHat" | "Coins" | "UsersRound" | "FileCheck2" | "ServerCog";
  readonly description: string;
}

export interface GenesisCapability {
  readonly id: string;
  readonly title: string;
  readonly iconName: "SearchCheck" | "Bot" | "BrainCircuit" | "ShieldCheck" | "Network";
}

export const landingNavigation: readonly NavItem[] = [
  { label: "Beranda", href: "#beranda" },
  { label: "Tentang ALOS", href: "#tentang" },
  { label: "Fitur", href: "#fitur" },
  { label: "Divisi", href: "#divisi" },
  { label: "GENESIS", href: "#genesis" },
  { label: "Kontak", href: "#kontak" },
] as const;

export const heroBenefits: readonly BenefitItem[] = [
  {
    iconName: "ShieldCheck",
    title: "Secure & Governed",
  },
  {
    iconName: "ChartNoAxesCombined",
    title: "Data-Driven Decisions",
  },
  {
    iconName: "Zap",
    title: "AI-Powered Execution",
  },
] as const;

export const aboutFeatures: readonly FeatureCardItem[] = [
  {
    id: "terintegrasi",
    title: "Terintegrasi",
    iconName: "Layers3",
    description: "Divisi, proyek, proses, dan data bekerja dalam satu ekosistem.",
  },
  {
    id: "berbasis-data",
    title: "Berbasis Data",
    iconName: "BarChart3",
    description: "Keputusan didukung data, evidence, dan jejak yang dapat ditelusuri.",
  },
  {
    id: "ai-powered",
    title: "AI-Powered",
    iconName: "Cpu",
    description: "GENESIS dan ARA membantu pekerjaan tanpa mengambil alih otoritas manusia.",
  },
  {
    id: "tata-kelola-kuat",
    title: "Tata Kelola Kuat",
    iconName: "ShieldCheck",
    description: "Akses, approval, evidence, dan audit trail menjadi bagian dari alur kerja.",
  },
] as const;

export const divisionsData: readonly DivisionItem[] = [
  {
    id: "sales-marketing",
    name: "Sales & Marketing",
    image: "/images/landing/division-sales-marketing.webp",
    alt: "Kawasan hunian modern dengan pencahayaan hangat",
    iconName: "TrendingUp",
    description: "Leads, penjualan, customer, dan pertumbuhan pasar.",
  },
  {
    id: "property",
    name: "Property",
    image: "/images/landing/division-property.webp",
    alt: "Proyek pembangunan hunian modern pada senja hari",
    iconName: "HardHat",
    description: "Proyek, perencanaan, konstruksi, kualitas, dan serah terima.",
  },
  {
    id: "finance",
    name: "Finance",
    image: "/images/landing/division-finance.webp",
    alt: "Hunian modern premium dengan fasad simetris",
    iconName: "Coins",
    description: "Keuangan, budget, pembayaran, rekonsiliasi, dan laporan.",
  },
  {
    id: "hr",
    name: "HR",
    image: "/images/landing/division-hr.webp",
    alt: "Hunian modern dengan pencahayaan hangat dan lanskap tropis",
    iconName: "UsersRound",
    description: "SDM, kompetensi, organisasi, dan pengembangan manusia.",
  },
  {
    id: "legal-compliance",
    name: "Legal & Compliance",
    image: "/images/landing/division-legal-compliance.webp",
    alt: "Gerbang kawasan hunian modern dengan pencahayaan malam",
    iconName: "FileCheck2",
    description: "Perizinan, kontrak, kepatuhan, dokumen, dan mitigasi risiko.",
  },
  {
    id: "it-technology",
    name: "IT & Technology",
    image: "/images/landing/division-it-technology.webp",
    alt: "Hunian modern dengan sistem pencahayaan terintegrasi",
    iconName: "ServerCog",
    description: "ALOS, infrastruktur, GENESIS, integrasi, keamanan, dan inovasi.",
  },
] as const;

export const genesisCapabilities: readonly GenesisCapability[] = [
  {
    id: "research",
    title: "Research & Analysis",
    iconName: "SearchCheck",
  },
  {
    id: "automation",
    title: "Automation & Execution",
    iconName: "Bot",
  },
  {
    id: "knowledge",
    title: "Knowledge & Memory",
    iconName: "BrainCircuit",
  },
  {
    id: "governance",
    title: "Governance & Safety",
    iconName: "ShieldCheck",
  },
  {
    id: "collaboration",
    title: "Multi-Agent Collaboration",
    iconName: "Network",
  },
] as const;
