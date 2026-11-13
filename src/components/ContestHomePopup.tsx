"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "wakusa_contest_results_popup_2026";
const POPUP_START = "2026-11-01";
const POPUP_END = "2026-11-30";

export function isContestPopupPeriod(now = new Date()): boolean {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return today >= POPUP_START && today <= POPUP_END;
}

export function ContestHomePopup() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

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
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
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
        <p className="contest-home-popup__eyebrow">문학 공모전 발표</p>
        <h2 id={titleId} className="contest-home-popup__title">
          제1회 문학공모전 수상자 발표
          <small>Winners of the 1st WAKUSA Literary Contest</small>
        </h2>
        <p className="contest-home-popup__body">
          한국어 문학과 영어시조 수상자를 발표했습니다. 명단을 확인해 주세요.
        </p>
        <p className="contest-home-popup__hint">
          The Korean literature and English sijo winners are now posted.
        </p>
        <div className="contest-home-popup__actions">
          <Link href="/contest" className="cta cta--primary" onClick={dismiss}>
            공모전 발표 보기
          </Link>
        </div>
        <p className="contest-home-popup__hint">
          2026년 11월 30일까지 안내합니다.
          <span className="en">Shown through November 30, 2026.</span>
        </p>
      </div>
    </div>,
    document.body,
  );
}
