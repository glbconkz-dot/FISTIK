import { setRequestLocale } from "next-intl/server";
import { StationDesk } from "@/components/StationDesk";

export default async function StationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StationDesk />;
}
