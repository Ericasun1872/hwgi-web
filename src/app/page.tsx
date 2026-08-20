import Image from "next/image";
import Link from "next/link";
import { ContestHomePopup } from "@/components/ContestHomePopup";
import { CtaLink } from "@/components/CtaLink";
import { HeroSalonBackdrop } from "@/components/HeroSalonBackdrop";
import { getContestEvent } from "@/lib/firestore";
import {
  extractFirstUrl,
  isBareUrl,
  normalizeExternalUrl,
} from "@/lib/linkify";
import {
  CONTEST_FALLBACK,
  SITE_NAME_EN,
  SITE_NAME_KO,
  SITE_TAGLINE_EN,
  SITE_TAGLINE_KO,
} from "@/lib/site";

export const revalidate = 60;

function resolveDetailUrl(input: {
  detailUrl?: string | null;
  locationKo?: string;
  bodyKo?: string;
}): string | null {
  const explicit = input.detailUrl?.trim();
  if (explicit) return normalizeExternalUrl(explicit);
  if (isBareUrl(input.locationKo)) {
    return normalizeExternalUrl(input.locationKo!.trim());
  }
  return extractFirstUrl(input.bodyKo);
}

export default async function HomePage() {
  const remote = await getContestEvent();
  const contest = remote
    ? {
        titleKo: remote.titleKo || CONTEST_FALLBACK.titleKo,
        titleEn: remote.titleEn || CONTEST_FALLBACK.titleEn,
        dateLabel: remote.dateLabel || CONTEST_FALLBACK.dateLabel,
        bodyKo: remote.bodyKo || CONTEST_FALLBACK.bodyKo,
        bodyEn: remote.bodyEn || CONTEST_FALLBACK.bodyEn,
        locationKo: remote.locationKo || CONTEST_FALLBACK.locationKo,
        detailUrl: resolveDetailUrl(remote),
        prizes:
          remote.prizes && remote.prizes.length > 0
            ? remote.prizes
            : CONTEST_FALLBACK.prizes,
      }
    : {
        ...CONTEST_FALLBACK,
        detailUrl: null as string | null,
      };

  return (
    <>
      <ContestHomePopup contest={contest} />

      <section className="hero" aria-label="소개">
        <HeroSalonBackdrop />
        <div className="hero__vignette" aria-hidden />
        <div className="hero__content">
          <p className="hero__eyebrow">Literary Salon · 문학의 방</p>
          <div className="hero__logo">
            <Image
              src="/logo.png"
              alt="한국작가회의"
              width={220}
              height={220}
              priority
              className="hero__logo-img"
            />
          </div>
          <h1 className="hero__brand">{SITE_NAME_KO}</h1>
          <p className="hero__en">{SITE_NAME_EN}</p>
          <p className="hero__tagline">{SITE_TAGLINE_KO}</p>
          <p className="hero__tagline-en">{SITE_TAGLINE_EN}</p>
          <div className="hero__ctas">
            <CtaLink href="/join" variant="primary">
              가입하기
            </CtaLink>
            <CtaLink href="/contest" variant="ghost">
              공모전
            </CtaLink>
            <CtaLink href="/events" variant="ghost">
              행사 안내
            </CtaLink>
          </div>
        </div>
      </section>

      <section className="home-salon" aria-label="바로가기">
        <header className="home-salon__header">
          <p>따뜻한 불빛 아래, 글이 모이는 자리</p>
          <h2>문학의 방</h2>
        </header>
        <div className="home-spotlight">
          <Link className="spotlight-link" href="/contest">
            <span className="spotlight-link__mark" aria-hidden>
              I
            </span>
            <h2>
              문학 공모전
              <small>Literary Contest</small>
            </h2>
            <p>상금·일정·참여 안내를 확인하세요.</p>
          </Link>
          <Link className="spotlight-link" href="/events">
            <span className="spotlight-link__mark" aria-hidden>
              II
            </span>
            <h2>
              정기 모임 · 행사
              <small>Gatherings &amp; Events</small>
            </h2>
            <p>줌 모임과 워크숍 소식을 전합니다.</p>
          </Link>
          <Link className="spotlight-link" href="/boards">
            <span className="spotlight-link__mark" aria-hidden>
              III
            </span>
            <h2>
              회원 작품
              <small>Member Boards</small>
            </h2>
            <p>시·디카시·수필·시조를 읽어 보세요.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
