import type { Metadata } from "next";
import { AppWriteCta } from "@/components/AppWriteCta";
import { ContestAdminLink } from "@/components/ContestAdminLink";
import { ContestPageClient } from "@/components/ContestPageClient";
import { CtaLink } from "@/components/CtaLink";
import { PolicyLinks } from "@/components/PolicyLinks";
import { getContestEvent, getContestUpdates } from "@/lib/firestore";
import {
  extractFirstUrl,
  isBareUrl,
  normalizeExternalUrl,
} from "@/lib/linkify";
import { buildMetadata, CONTEST_FALLBACK } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "문학 공모전",
  description:
    "2026 미주지회 문학 공모전 — 상금·일정·참여 안내. Literary contest for the USA Chapter.",
  path: "/contest",
});

export const revalidate = 30;

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

export default async function ContestPage() {
  const [remote, updates] = await Promise.all([
    getContestEvent(),
    getContestUpdates(),
  ]);
  const contest = remote
    ? {
        titleKo: remote.titleKo || CONTEST_FALLBACK.titleKo,
        titleEn: remote.titleEn || CONTEST_FALLBACK.titleEn,
        dateLabel: remote.dateLabel || CONTEST_FALLBACK.dateLabel,
        locationKo: remote.locationKo || CONTEST_FALLBACK.locationKo,
        locationEn: remote.locationEn || CONTEST_FALLBACK.locationEn,
        bodyKo: remote.bodyKo || CONTEST_FALLBACK.bodyKo,
        bodyEn: remote.bodyEn || CONTEST_FALLBACK.bodyEn,
        detailUrl: resolveDetailUrl(remote),
        prizes:
          remote.prizes && remote.prizes.length > 0
            ? remote.prizes
            : CONTEST_FALLBACK.prizes,
      }
    : { ...CONTEST_FALLBACK, detailUrl: null };

  return (
    <div className="page">
      <header className="page-header">
        <h1>문학 공모전</h1>
        <p>
          Literary Contest
          <span className="en">상금 · 일정 · 참여 유도</span>
        </p>
        <ContestAdminLink />
        <PolicyLinks />
      </header>

      <ContestPageClient initialContest={contest} initialUpdates={updates} />

      <AppWriteCta />

      <div className="hero__ctas" style={{ marginTop: "1.5rem" }}>
        <CtaLink href="/join" variant="primary">
          가입하고 작품 제출하기
        </CtaLink>
        <CtaLink href="/boards" variant="gold">
          회원 작품 읽기
        </CtaLink>
      </div>
    </div>
  );
}
