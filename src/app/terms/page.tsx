import type { Metadata } from "next";
import Link from "next/link";
import { PolicyLinks } from "@/components/PolicyLinks";
import { getChapterPolicies } from "@/lib/admin-policies";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "이용약관",
  description: "한국작가회의 미주지회 회원 이용약관",
  path: "/terms",
});

export const revalidate = 60;

export default async function TermsPage() {
  const policies = await getChapterPolicies();

  return (
    <div className="page">
      <header className="page-header">
        <h1>{policies.termsTitle.split("/")[0]?.trim() || "이용약관"}</h1>
        <p>
          Terms of Service
          <span className="en">회원 이용약관</span>
        </p>
        <PolicyLinks />
      </header>
      <article className="policy-doc">
        <pre className="policy-doc__body">{policies.termsBody}</pre>
      </article>
      <p className="phase-note">
        <Link href="/privacy" style={{ borderBottom: "1px solid var(--gold-line)" }}>
          개인정보 처리방침
        </Link>
        {" · "}
        <Link href="/bylaws" style={{ borderBottom: "1px solid var(--gold-line)" }}>
          정관
        </Link>
        {" · "}
        <Link href="/join" style={{ borderBottom: "1px solid var(--gold-line)" }}>
          가입 안내
        </Link>
      </p>
    </div>
  );
}
