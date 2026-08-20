import type { Metadata } from "next";
import Link from "next/link";
import { PolicyLinks } from "@/components/PolicyLinks";
import { getChapterPolicies } from "@/lib/admin-policies";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "정관",
  description: "한국작가회의 미주지회 정관",
  path: "/bylaws",
});

export const revalidate = 60;

export default async function BylawsPage() {
  const policies = await getChapterPolicies();

  return (
    <div className="page">
      <header className="page-header">
        <h1>{policies.bylawsTitle.split("/")[0]?.trim() || "정관"}</h1>
        <p>
          Chapter Bylaws
          <span className="en">미주지회 정관</span>
        </p>
        <PolicyLinks />
      </header>
      <article className="policy-doc">
        <pre className="policy-doc__body">{policies.bylawsBody}</pre>
      </article>
      <p className="phase-note">
        <Link href="/terms" style={{ borderBottom: "1px solid var(--gold-line)" }}>
          이용약관
        </Link>
        {" · "}
        <Link href="/privacy" style={{ borderBottom: "1px solid var(--gold-line)" }}>
          개인정보 처리방침
        </Link>
      </p>
    </div>
  );
}
