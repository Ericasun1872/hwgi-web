import type { Metadata } from "next";
import { CtaLink } from "@/components/CtaLink";
import { CONTACT, buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "후원 안내",
  description:
    "한국작가회의 미주지회 후원·광고 안내. Support the USA Chapter’s literary programs.",
  path: "/sponsors",
});

export default function SponsorsPage() {
  const emailHref = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
    "미주지회 후원·광고 문의",
  )}`;

  return (
    <div className="page">
      <header className="page-header">
        <p className="sponsors-kicker">
          후원 · Sponsors
          <span className="home-sponsors__badge">후원·광고</span>
        </p>
        <h1>후원 안내</h1>
        <p>
          Support the chapter
          <span className="en">
            Voluntary gifts sustain gatherings, contests, and member programs
          </span>
        </p>
      </header>

      <section className="sponsors-prose" aria-label="후원 소개">
        <p>
          한국작가회의 미주지회는 문학 활동과 회원 모임을 위해 자발적 후원을
          받습니다. 후원금은 행사·공모전·회원 프로그램 운영에 쓰입니다.
        </p>
        <p className="sponsors-prose__en">
          Voluntary support helps sustain gatherings, contests, and member
          programs.
        </p>
      </section>

      <section className="sponsors-partners" aria-label="후원 파트너">
        <h2>후원·광고 파트너</h2>
        <p>
          아래 자리는 후원·광고 파트너를 위한 공간입니다. 현재 공개 파트너
          명단은 준비 중이며, 확정되는 대로 로고와 함께 안내합니다.
        </p>
        <ul className="sponsors-logo-row">
          <li className="sponsors-logo-slot">파트너 로고</li>
          <li className="sponsors-logo-slot">파트너 로고</li>
          <li className="sponsors-logo-slot">파트너 로고</li>
        </ul>
      </section>

      <section className="sponsors-contact" aria-label="문의">
        <h2>후원·광고 문의</h2>
        <p>
          후원 방법·광고 게재·파트너십은 아래로 문의해 주세요.
        </p>
        <p className="sponsors-contact__email">
          <a href={emailHref}>{CONTACT.email}</a>
        </p>
        <div className="download-row" style={{ marginTop: "1.25rem" }}>
          <a href={emailHref} className="cta cta--primary">
            이메일로 문의
          </a>
          <CtaLink href="/join" variant="ghost">
            가입 안내
          </CtaLink>
        </div>
      </section>
    </div>
  );
}
