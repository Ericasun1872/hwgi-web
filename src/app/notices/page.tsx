import type { Metadata } from "next";
import { NoticesSection } from "@/components/NoticesSection";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "공지",
  description: "한국작가회의 미주지회 공지. Chapter notices.",
  path: "/notices",
});

export default function NoticesPage() {
  return (
    <div className="page">
      <NoticesSection heading="h1" />
    </div>
  );
}
