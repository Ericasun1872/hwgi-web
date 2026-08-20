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
  const showLocationKo = contest.locationKo && !isBareUrl(contest.locationKo);
  const showLocationEn =
    contest.locationEn &&
    !isBareUrl(contest.locationEn) &&
    !/^tba\b/i.test(contest.locationEn.trim());

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
        {showLocationKo || showLocationEn ? (
          <p className="event-card__loc">
            {showLocationKo ? contest.locationKo : null}
            {showLocationEn ? <span>{contest.locationEn}</span> : null}
          </p>
        ) : null}
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
