import { LoadingState } from "@/components/ui";

interface WorkLoadingProps {
  readonly label?: string;
}

export function WorkLoading({ label = "Memuat data pekerjaan…" }: WorkLoadingProps) {
  return <LoadingState label={label} variant="section" />;
}
