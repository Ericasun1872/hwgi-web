"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminContestPanel } from "@/components/AdminContestPanel";
import { useAuth } from "@/components/AuthProvider";
import { ContestUpdateCard } from "@/components/ContestUpdateCard";
import {
  getContestEventClient,
  listContestUpdatesClient,
} from "@/lib/admin-content";
import {
  extractFirstUrl,
  isBareUrl,
  linkifyNodes,
  normalizeExternalUrl,
} from "@/lib/linkify";
import { CONTEST_FALLBACK } from "@/lib/site";
import type { ContestUpdate } from "@/lib/types";

type AwardCategory = "grand" | "main" | "excellence" | "selected";

type Winner = {
  category: AwardCategory;
  name: string;
  title: string;
};

/**
 * 11월 수상작 발표 때 이 목록만 채우면 화면에 나타납니다.
 * { category: "grand" | "main" | "excellence" | "selected", name: "이름", title: "작품 제목" }
 */
const WINNERS: Winner[] = [];

const AWARD_CATEGORIES: { id: AwardCategory; label: string }[] = [
  { id: "grand", label: "대상 Grand Prize $1,500 (1명)" },
  { id: "main", label: "본상 Main Prize $1,000 (1명)" },
  { id: "excellence", label: "우수상 Excellence Award $500 (2명)" },
  { id: "selected", label: "입선 Selected $250 (3명)" },
];

export type ContestView = {
  titleKo: string;
  titleEn: string;
  dateLabel: string;
  locationKo: string;
  locationEn: string;
  bodyKo: string;
  bodyEn: string;
  detailUrl: string | null;
  prizes: { place: string; amount: string }[];
};

type Props = {
  initialContest: ContestView;
  initialUpdates: ContestUpdate[];
};

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

function toContestView(
  remote: Awaited<ReturnType<typeof getContestEventClient>>,
): ContestView {
  if (!remote) {
    return { ...CONTEST_FALLBACK, detailUrl: null };
  }
  return {
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
  };
}

export function ContestPageClient({
  initialContest,
  initialUpdates,
}: Props) {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contest, setContest] = useState(initialContest);
  const [updates, setUpdates] = useState(initialUpdates);
  const [manageOpen, setManageOpen] = useState(true);

  useEffect(() => {
    setContest(initialContest);
    setUpdates(initialUpdates);
  }, [initialContest, initialUpdates]);

  async function refreshView() {
    try {
      const [remote, nextUpdates] = await Promise.all([
        getContestEventClient(),
        listContestUpdatesClient(),
      ]);
      setContest(toContestView(remote));
      setUpdates(nextUpdates);
    } catch {
      /* keep current */
    }
    router.refresh();
  }

  const detailUrl = contest.detailUrl;

  return (
    <>
      {!authLoading && isAdmin ? (
        <section
          id="contest-manage"
          className="events-manage"
          aria-labelledby="contest-manage-heading"
        >
          <div className="events-manage__header">
            <h2 id="contest-manage-heading">공모전 바로 수정·포스트</h2>
            <button
              type="button"
              className="cta cta--ghost"
              onClick={() => setManageOpen((v) => !v)}
            >
              {manageOpen ? "접기" : "열기"}
            </button>
          </div>
          <p className="admin-section__lead">
            운영진·회장만 보입니다. 안내·상금 수정과 업데이트 포스트(이미지
            포함)를 올리면 아래 공모전 페이지에 바로 반영됩니다.
          </p>
          {manageOpen ? (
            <AdminContestPanel
              embedded
              onChanged={() => {
                void refreshView();
              }}
            />
          ) : null}
        </section>
      ) : null}

      <section className="contest-hero">
        <p className="event-card__date">{contest.dateLabel}</p>
        <h2>
          {contest.titleKo}
          <small
            style={{
              display: "block",
              marginTop: "0.35rem",
              fontSize: "0.95rem",
              fontWeight: 400,
              color: "var(--muted)",
            }}
          >
            {contest.titleEn}
          </small>
        </h2>
        {detailUrl ? (
          <p className="contest-detail-link">
            <a href={detailUrl} target="_blank" rel="noopener noreferrer">
              사이트 상세내용 보기
            </a>
            <span className="contest-detail-link__en">Contest guidelines</span>
          </p>
        ) : null}
        <p className="event-card__body">
          {`한국작가회의 미주지회 첫 문학 공모전이 9월 30일에 마감되었습니다.
소중한 작품을 보내주신 모든 분께 진심으로 감사드립니다.
수상작 발표는 11월에 이 페이지에서 안내해 드리겠습니다.
발표: 2026년 11월
상금은 세 표로 나뉩니다.

문학 공모전: 대상 $1,500, 본상 $1,000, 우수상 $500, 입선 $250
영어 시조(대학생·일반): 대상 $200, 우수상 $100
영어 시조(유치원~12학년): 1등 $300, 2등 $200, 3등 $100`}
        </p>
        <p className="event-card__body-en">
          {`Our first Literary Contest closed on September 30.
Thank you to everyone who shared their precious work with us.
Winners will be announced on this page in November.
Announcement: November 2026
Prizes: Grand Prize (1) $1,500 · Main Prize (1) $1,000 · Excellence (2) $500 · Selected (3) $250`}
        </p>

        <section className="contest-updates" aria-labelledby="contest-winners">
          <h2 id="contest-winners">수상작 발표</h2>
          {WINNERS.length === 0 ? (
            <>
              <p className="event-card__body">
                {`수상작 심사 중입니다.
제1회 미주지회 문학 공모전(2026.7.25–9.30)에 소중한 작품을
보내주신 모든 분께 감사드립니다.
현재 심사가 진행 중이며, 수상작은 2026년 11월에 이 페이지에서 발표합니다.`}
              </p>
              <p className="event-card__body-en">
                {`Judging in Progress
Thank you to everyone who shared their work in our 1st Literary Contest
(Jul 25 – Sep 30, 2026).
Judging is now underway, and winners will be announced on this page
in November 2026.`}
              </p>
              <p className="event-card__body">수상자는 2026년 11월에 발표됩니다.</p>
              <p className="event-card__body-en">Winners will be announced in November 2026.</p>
            </>
          ) : (
            <div>
              {AWARD_CATEGORIES.map((award) => {
                const winners = WINNERS.filter((winner) => winner.category === award.id);
                if (winners.length === 0) return null;
                return (
                  <div key={award.id}>
                    <h3>{award.label}</h3>
                    <ul>
                      {winners.map((winner) => (
                        <li key={`${award.id}-${winner.name}-${winner.title}`}>
                          {winner.name}
                          <span> · {winner.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="event-card__body">{linkifyNodes(contest.bodyKo)}</p>
        {contest.bodyEn ? (
          <p className="event-card__body-en">{linkifyNodes(contest.bodyEn)}</p>
        ) : null}

        <ul className="prize-list" aria-label="시상 안내">
          {contest.prizes.map((p) => (
            <li key={`${p.place}-${p.amount}`}>
              <strong>{p.place}</strong>
              <span>{p.amount}</span>
            </li>
          ))}
        </ul>
      </section>

      {updates.length > 0 ? (
        <section className="contest-updates" aria-labelledby="contest-updates">
          <h2 id="contest-updates">공모전 소식</h2>
          <ul className="contest-update-list">
            {updates.map((update) => (
              <ContestUpdateCard key={update.id} update={update} />
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
