import type { Metadata } from "next";
import { AdminMembersPanel } from "@/components/AdminMembersPanel";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "회원 관리",
    description: "운영진·회장용 회원 승인 대기·회원 목록",
    path: "/admin/members",
  }),
  robots: { index: false, follow: false },
};

export default function AdminMembersPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>회원 관리</h1>
        <p>
          Member approval
          <span className="en">
            운영진·회장 — 가입 승인 대기 목록을 확인하고 승인·반려합니다.
          </span>
        </p>
      </header>

      <AdminMembersPanel />
    </div>
  );
}
