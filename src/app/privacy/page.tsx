import type { Metadata } from "next";
import Link from "next/link";
import { PolicyLinks } from "@/components/PolicyLinks";
import { getChapterPolicies } from "@/lib/admin-policies";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "개인정보 처리방침",
  description: "한국작가회의 미주지회 개인정보 처리방침",
  path: "/privacy",
});

export const revalidate = 60;

export default async function PrivacyPage() {
  const policies = await getChapterPolicies();

  return (
    <div className="page">
      <header className="page-header">
        <h1>{policies.privacyTitle.split("/")[0]?.trim() || "개인정보 처리방침"}</h1>
        <p>
          Privacy Policy
          <span className="en">개인정보 처리방침</span>
        </p>
        <PolicyLinks />
      </header>
      <article className="policy-doc">
        <pre className="policy-doc__body">{policies.privacyBody}</pre>
      </article>
      <p className="phase-note">
        <Link href="/terms" style={{ borderBottom: "1px solid var(--gold-line)" }}>
          이용약관
        </Link>
        {" · "}
        <Link href="/bylaws" style={{ borderBottom: "1px solid var(--gold-line)" }}>
          정관
        </Link>
      </p>
    </div>
  );
}
