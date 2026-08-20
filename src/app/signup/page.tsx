import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/SignUpForm";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "회원가입",
  description: "한국작가회의 미주지회 웹 회원가입",
  path: "/signup",
});

export default function SignUpPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>회원가입</h1>
        <p>
          Join online
          <span className="en">
            iPhone Safari 등에서 바로 신청할 수 있습니다. 운영진 승인 후
            로그인됩니다.
          </span>
        </p>
      </header>

      <SignUpForm />

      <p className="phase-note">
        이미 회원이시면{" "}
        <Link
          href="/login"
          style={{ borderBottom: "1px solid var(--gold-line)" }}
        >
          로그인
        </Link>
        해 주세요.
      </p>
    </div>
  );
}
