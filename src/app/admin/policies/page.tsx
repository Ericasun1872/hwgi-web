import type { Metadata } from "next";
import { AdminPoliciesPanel } from "@/components/AdminPoliciesPanel";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "약관·정관 관리",
    description: "운영진·회장용 이용약관·개인정보·정관 수정",
    path: "/admin/policies",
  }),
  robots: { index: false, follow: false },
};

export default function AdminPoliciesPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>약관·정관 관리</h1>
        <p>
          Policies
          <span className="en">
            이용약관 · 개인정보 처리방침 · 정관 본문을 수정합니다.
          </span>
        </p>
      </header>
      <AdminPoliciesPanel />
    </div>
  );
}
