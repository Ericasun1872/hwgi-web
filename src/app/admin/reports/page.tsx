import type { Metadata } from "next";
import { AdminReportsPanel } from "@/components/AdminReportsPanel";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "신고 관리",
    description: "운영진·회장용 댓글·콘텐츠 신고 목록",
    path: "/admin/reports",
  }),
  robots: { index: false, follow: false },
};

export default function AdminReportsPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>신고 관리</h1>
        <p>
          Content reports
          <span className="en">
            운영진·회장 — 웹·앱에서 접수된 신고를 확인하고 처리합니다.
          </span>
        </p>
      </header>

      <AdminReportsPanel />
    </div>
  );
}
