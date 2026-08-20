"use client";

import { useEffect, useId, useState, type KeyboardEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { linkifyNodes } from "@/lib/linkify";
import type { ContestUpdate } from "@/lib/types";

type Props = {
  update: ContestUpdate;
};

export function ContestUpdateCard({ update }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const hasImage = Boolean(update.imageBytesBase64);
  const canExpand =
    hasImage || Boolean(update.body?.trim()) || Boolean(update.title?.trim());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openLightbox() {
    if (!canExpand) return;
    setOpen(true);
  }

  function onCardClick(e: MouseEvent<HTMLElement>) {
    const target = e.target as HTMLElement | null;
    if (target?.closest("a")) return;
    openLightbox();
  }

  function onCardKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key !== "Enter" && e.key !== " ") return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("a")) return;
    e.preventDefault();
    openLightbox();
  }

  const lightbox =
    open && mounted
      ? createPortal(
          <div
            className="contest-lightbox"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={() => setOpen(false)}
          >
            <div
              className="contest-lightbox__panel"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="contest-lightbox__toolbar">
                <p id={titleId} className="contest-lightbox__title">
                  {update.title?.trim() || "공모전 소식"}
                </p>
                <button
                  type="button"
                  className="cta cta--ghost"
                  onClick={() => setOpen(false)}
                >
                  닫기
                </button>
              </div>
              {hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="contest-lightbox__image"
                  src={`data:image/jpeg;base64,${update.imageBytesBase64}`}
                  alt={update.title?.trim() || "공모전 소식 이미지"}
                />
              ) : null}
              {update.body ? (
                <p className="contest-lightbox__body">
                  {linkifyNodes(update.body)}
                </p>
              ) : null}
              {update.authorName || update.createdAt ? (
                <p className="contest-lightbox__meta">
                  {[update.authorName, update.createdAt?.slice(0, 10)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <li
        className={`contest-update-card${canExpand ? " is-expandable" : ""}`}
        role={canExpand ? "button" : undefined}
        tabIndex={canExpand ? 0 : undefined}
        onClick={canExpand ? onCardClick : undefined}
        onKeyDown={canExpand ? onCardKeyDown : undefined}
        aria-label={canExpand ? "포스트 크게 보기" : undefined}
      >
        {update.createdAt ? (
          <p className="contest-update-card__date">
            {update.createdAt.slice(0, 10)}
          </p>
        ) : null}
        {update.title ? <h3>{update.title}</h3> : null}
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="contest-update-card__image"
            src={`data:image/jpeg;base64,${update.imageBytesBase64}`}
            alt=""
          />
        ) : null}
        {update.body ? (
          <p className="contest-update-card__body">
            {linkifyNodes(update.body)}
          </p>
        ) : null}
        {canExpand ? (
          <span className="contest-update-card__zoom-hint">
            클릭하여 크게 보기
          </span>
        ) : null}
        {update.authorName ? (
          <p className="contest-update-card__author">{update.authorName}</p>
        ) : null}
      </li>
      {lightbox}
    </>
  );
}
