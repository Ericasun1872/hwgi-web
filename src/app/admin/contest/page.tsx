import type { Metadata } from "next";
import { AdminContestPanel } from "@/components/AdminContestPanel";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "공모전 관리",
    description: "운영진·회장용 문학 공모전 안내·업데이트 관리",
    path: "/admin/contest",
  }),
  robots: { index: false, follow: false },
};

export default function AdminContestPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>공모전 관리</h1>
        <p>
          Contest management
          <span className="en">
            운영진·회장 — 공모전 안내 수정과 업데이트 포스트를 올립니다.
          </span>
        </p>
      </header>
      <AdminContestPanel />
    </div>
  );
}
