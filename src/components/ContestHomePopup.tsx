"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  extractFirstUrl,
  isBareUrl,
  normalizeExternalUrl,
} from "@/lib/linkify";

export type ContestPopupData = {
  titleKo: string;
  titleEn: string;
  dateLabel: string;
  bodyKo: string;
  bodyEn?: string;
  detailUrl?: string | null;
  locationKo?: string;
  prizes: { place: string; amount: string }[];
};

const STORAGE_KEY = "wakusa_contest_popup_dismissed_2026";
const POPUP_START = "2026-07-25";
const POPUP_END = "2026-09-30";

export function isContestPopupPeriod(now = new Date()): boolean {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return today >= POPUP_START && today <= POPUP_END;
}

function resolveDetailUrl(data: ContestPopupData): string | null {
  const explicit = data.detailUrl?.trim();
  if (explicit) return normalizeExternalUrl(explicit);
  if (isBareUrl(data.locationKo)) {
    return normalizeExternalUrl(data.locationKo!.trim());
  }
  return extractFirstUrl(data.bodyKo);
}

type Props = {
  contest: ContestPopupData;
};

export function ContestHomePopup({ contest }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const detailUrl = resolveDetailUrl(contest);

  useEffect(() => {
    setMounted(true);
    if (!isContestPopupPeriod()) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="contest-home-popup"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="contest-home-popup__backdrop"
        aria-label="팝업 닫기"
        onClick={dismiss}
      />
      <div className="contest-home-popup__panel">
        <button
          type="button"
          className="contest-home-popup__close"
          onClick={dismiss}
          aria-label="닫기"
        >
          ×
        </button>
        <p className="contest-home-popup__eyebrow">문학 공모전 안내</p>
        <h2 id={titleId} className="contest-home-popup__title">
          {contest.titleKo}
          {contest.titleEn ? (
            <small>{contest.titleEn}</small>
          ) : null}
        </h2>
        {contest.dateLabel ? (
          <p className="contest-home-popup__date">{contest.dateLabel}</p>
        ) : null}
        <p className="contest-home-popup__body">{contest.bodyKo}</p>
        {contest.prizes.length > 0 ? (
          <ul className="contest-home-popup__prizes" aria-label="시상 안내">
            {contest.prizes.slice(0, 4).map((p) => (
              <li key={`${p.place}-${p.amount}`}>
                <strong>{p.place}</strong>
                <span>{p.amount}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="contest-home-popup__actions">
          <Link href="/contest" className="cta cta--primary" onClick={dismiss}>
            공모전 자세히 보기
          </Link>
          {detailUrl ? (
            <a
              href={detailUrl}
              className="cta cta--gold"
              target="_blank"
              rel="noopener noreferrer"
            >
              사이트 상세내용
            </a>
          ) : null}
        </div>
        <p className="contest-home-popup__hint">
          접수 기간: 2026. 7. 25 ~ 9. 30
        </p>
      </div>
    </div>,
    document.body,
  );
}

/** Server/helper: whether popup should be rendered in HTML at all. */
export function shouldOfferContestPopup(): boolean {
  return isContestPopupPeriod();
}
