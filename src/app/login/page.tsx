import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "로그인",
  description: "한국작가회의 미주지회 회원 로그인",
  path: "/login",
});

export default function LoginPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>로그인</h1>
        <p>
          Member login
          <span className="en">
            앱에서 가입·승인된 계정으로 로그인해 주세요.
          </span>
        </p>
      </header>

      <Suspense fallback={<p className="empty-state">불러오는 중…</p>}>
        <LoginForm />
      </Suspense>

      <p className="phase-note">
        아직 회원이 아니시면{" "}
        <Link
          href="/signup"
          style={{ borderBottom: "1px solid var(--gold-line)" }}
        >
          회원가입
        </Link>
        해 주세요. 승인 후 이 화면에서 로그인합니다.
      </p>
    </div>
  );
}
