import type { Metadata } from "next";
import { AdminAboutPanel } from "@/components/AdminAboutPanel";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "소개 관리",
    description: "운영진·회장용 인사말씀·조직도 수정",
    path: "/admin/about",
  }),
  robots: { index: false, follow: false },
};

export default function AdminAboutPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>소개 관리</h1>
        <p>
          About management
          <span className="en">
            인사말씀과 미주지회 조직도(한·영 이름)를 수정합니다.
          </span>
        </p>
      </header>
      <AdminAboutPanel />
    </div>
  );
}
