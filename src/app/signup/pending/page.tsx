import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "승인 대기",
  description: "회원가입 승인 대기 안내",
  path: "/signup/pending",
});

export default function SignupPendingPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>가입 신청이 접수되었습니다</h1>
        <p>
          Pending approval
          <span className="en">
            운영진·회장이 웹 또는 앱 회원 관리에서 승인하면 로그인할 수 있습니다.
          </span>
        </p>
      </header>

      <p className="greeting-body" style={{ whiteSpace: "normal" }}>
        승인까지 시간이 걸릴 수 있습니다. 승인이 완료되면 가입하신
        이메일·비밀번호로{" "}
        <Link
          href="/login"
          style={{ borderBottom: "1px solid var(--gold-line)" }}
        >
          로그인
        </Link>
        해 주세요.
      </p>

      <div className="download-row" style={{ marginTop: "2rem" }}>
        <Link href="/" className="cta cta--gold">
          홈으로
        </Link>
        <Link href="/login" className="cta cta--primary">
          로그인
        </Link>
      </div>
    </div>
  );
}
