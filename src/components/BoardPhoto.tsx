"use client";

import { useEffect, useState } from "react";
import { trimBlackLetterbox } from "@/lib/trim-letterbox";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  /** 검정 레터박스 자동 제거 (디카시·단상용) */
  trimLetterbox?: boolean;
};

export function BoardPhoto({
  src,
  alt = "",
  className,
  trimLetterbox = false,
}: Props) {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    let cancelled = false;
    setDisplaySrc(src);
    if (!trimLetterbox || !src) return;

    void (async () => {
      try {
        const trimmed = await trimBlackLetterbox(src, {
          threshold: 52,
          avgThreshold: 46,
          maxTrimRatio: 0.5,
        });
        if (!cancelled) setDisplaySrc(trimmed);
      } catch {
        if (!cancelled) setDisplaySrc(src);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src, trimLetterbox]);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- dynamic board/base64 photos
    <img className={className} src={displaySrc} alt={alt} />
  );
}
