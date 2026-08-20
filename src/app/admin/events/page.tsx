import type { Metadata } from "next";
import { AdminEventsPanel } from "@/components/AdminEventsPanel";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "행사 관리",
    description: "운영진·회장용 행사 안내 관리",
    path: "/admin/events",
  }),
  robots: { index: false, follow: false },
};

export default function AdminEventsPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>행사 관리</h1>
        <p>
          Event management
          <span className="en">
            운영진·회장 — 행사 안내를 추가·수정·삭제합니다.
          </span>
        </p>
      </header>
      <AdminEventsPanel />
    </div>
  );
}
