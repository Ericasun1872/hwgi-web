import type { Metadata } from "next";
import { AppWriteCta } from "@/components/AppWriteCta";
import { ContestAdminLink } from "@/components/ContestAdminLink";
import { ContestPageClient } from "@/components/ContestPageClient";
import { CtaLink } from "@/components/CtaLink";
import { PolicyLinks } from "@/components/PolicyLinks";
import { getContestEvent, getContestPublication, getContestUpdates } from "@/lib/firestore";
import {
  extractFirstUrl,
  isBareUrl,
  normalizeExternalUrl,
} from "@/lib/linkify";
import { buildMetadata, CONTEST_FALLBACK } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "문학 공모전",
  description:
    "2026 미주지회 문학 공모전 — 상금과 일정. Literary contest for the USA Chapter.",
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
  const [remote, updates, publication] = await Promise.all([
    getContestEvent(),
    getContestUpdates(),
    getContestPublication(),
  ]);
  const contest = remote
    ? {
        titleKo: publication?.titleKo || remote.titleKo || CONTEST_FALLBACK.titleKo,
        titleEn: publication?.titleEn || remote.titleEn || CONTEST_FALLBACK.titleEn,
        dateLabel: publication?.dateLabel || remote.dateLabel || CONTEST_FALLBACK.dateLabel,
        locationKo: remote.locationKo || CONTEST_FALLBACK.locationKo,
        locationEn: remote.locationEn || CONTEST_FALLBACK.locationEn,
        bodyKo: publication?.bodyKo || "",
        bodyEn: publication?.bodyEn || "",
        detailUrl: publication?.detailUrl || resolveDetailUrl(remote),
        prizes:
          publication?.prizes && publication.prizes.length > 0
            ? publication.prizes
            : remote.prizes && remote.prizes.length > 0
              ? remote.prizes
              : [],
        winnerAnnouncement: publication?.winners ?? remote.winnerAnnouncement ?? null,
        announcementCopy: publication,
      }
    : {
        ...CONTEST_FALLBACK,
        bodyKo: publication?.bodyKo || "",
        bodyEn: publication?.bodyEn || "",
        titleKo: publication?.titleKo || CONTEST_FALLBACK.titleKo,
        titleEn: publication?.titleEn || CONTEST_FALLBACK.titleEn,
        dateLabel: publication?.dateLabel || CONTEST_FALLBACK.dateLabel,
        detailUrl: publication?.detailUrl || null,
        prizes: publication?.prizes ?? [],
        winnerAnnouncement: publication?.winners ?? null,
        announcementCopy: publication,
      };

  return (
    <div className="page">
      <header className="page-header">
        <h1>문학 공모전</h1>
        <p>
          Literary Contest
          <span className="en">상금 · 일정</span>
        </p>
        <ContestAdminLink />
        <PolicyLinks />
      </header>

      <ContestPageClient initialContest={contest} initialUpdates={updates} />

      <AppWriteCta />

      <div className="hero__ctas" style={{ marginTop: "1.5rem" }}>
        <CtaLink href="/contact" variant="primary">
          다음 공모전 알림 받기
        </CtaLink>
        <CtaLink href="/boards" variant="gold">
          회원 작품 읽기
        </CtaLink>
      </div>
    </div>
  );
}
