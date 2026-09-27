import { ExecutiveDivisionDetailPage } from "@/features/executive";

export default async function ExecutiveDivisionDetailRoute({ params }: Readonly<{ params: Promise<{ divisionKey: string }> }>) {
  const { divisionKey } = await params;
  return <ExecutiveDivisionDetailPage divisionKey={divisionKey} />;
}
