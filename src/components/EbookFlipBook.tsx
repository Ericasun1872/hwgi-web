"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import HTMLFlipBook from "react-pageflip";
import { BoardPhoto } from "@/components/BoardPhoto";
import { formatBoardBody } from "@/lib/format-body";
import type { BoardPost } from "@/lib/types";

export type EbookFlipMeta = {
  labelKo: string;
  labelEn: string;
  kind: string;
};

type Props = {
  year: number;
  meta: EbookFlipMeta;
  siteNameKo: string;
  siteNameEn: string;
  posts: BoardPost[];
};

type PageModel =
  | { id: string; type: "cover" }
  | { id: string; type: "toc"; tocIndex: number }
  | { id: string; type: "work"; post: BoardPost; index: number }
  | { id: string; type: "blank" }
  | { id: string; type: "colophon" };

const TOC_CHUNK = 12;

type FlipBookHandle = {
  pageFlip: () => {
    flipNext: (corner?: string) => void;
    flipPrev: (corner?: string) => void;
    flip: (page: number, corner?: string) => void;
    getPageCount: () => number;
    getCurrentPageIndex: () => number;
  };
};

const FlipPage = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
    density?: "soft" | "hard";
  }
>(function FlipPage({ children, className = "", density = "soft" }, ref) {
  return (
    <div
      ref={ref}
      className={`flip-page ${className}`.trim()}
      data-density={density}
    >
      <div className="flip-page__inner">{children}</div>
    </div>
  );
});

function buildPages(posts: BoardPost[]): PageModel[] {
  const pages: PageModel[] = [{ id: "cover", type: "cover" }];

  if (posts.length === 0) {
    pages.push({ id: "colophon", type: "colophon" });
    return pages;
  }

  const tocCount = Math.max(1, Math.ceil(posts.length / TOC_CHUNK));
  for (let i = 0; i < tocCount; i++) {
    pages.push({ id: `toc-${i}`, type: "toc", tocIndex: i });
  }

  posts.forEach((post, index) => {
    pages.push({ id: `work-${post.id}`, type: "work", post, index });
  });

  pages.push({ id: "colophon", type: "colophon" });

  if (pages.length % 2 === 1) {
    pages.splice(pages.length - 1, 0, { id: "blank-end", type: "blank" });
  }

  return pages;
}

export function EbookFlipBook({
  year,
  meta,
  siteNameKo,
  siteNameEn,
  posts,
}: Props) {
  const pages = useMemo(() => buildPages(posts), [posts]);
  const bookRef = useRef<FlipBookHandle | null>(null);
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(pages.length);
  const [bookWidth, setBookWidth] = useState(420);
  const isPhotoGenre = meta.kind === "dica" || meta.kind === "dansang";
  const showImage = isPhotoGenre;

  const tocCount = useMemo(
    () => (posts.length === 0 ? 0 : Math.ceil(posts.length / TOC_CHUNK)),
    [posts.length],
  );

  useEffect(() => {
    function measure() {
      const w = Math.min(480, Math.max(300, window.innerWidth - 96));
      setBookWidth(w);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const onFlip = useCallback((e: { data: number }) => {
    setIndex(e.data);
  }, []);

  const onInit = useCallback((e: { data: { page: number } }) => {
    setIndex(e.data.page);
    try {
      setTotal(bookRef.current?.pageFlip().getPageCount() ?? pages.length);
    } catch {
      setTotal(pages.length);
    }
  }, [pages.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const book = bookRef.current?.pageFlip();
      if (!book) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        book.flipNext("bottom");
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        book.flipPrev("bottom");
      } else if (e.key === "Home") {
        book.flip(0, "top");
      } else if (e.key === "End") {
        book.flip(Math.max(0, book.getPageCount() - 1), "bottom");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function flipToWork(absoluteIndex: number) {
    const pageIndex = 1 + tocCount + absoluteIndex;
    bookRef.current?.pageFlip().flip(pageIndex, "top");
  }

  const bookHeight = Math.round(bookWidth * 1.38);

  return (
    <section className="flipbook no-print" aria-label="전자책 뷰어">
      <p className="flipbook__hint-top">
        페이지 모서리를 잡고 드래그하거나, 화살표·스와이프로 넘기세요
      </p>

      <div className="flipbook__stage">
        <button
          type="button"
          className="flipbook__nav flipbook__nav--prev"
          aria-label="이전 페이지"
          disabled={index <= 0}
          onClick={() => bookRef.current?.pageFlip().flipPrev("bottom")}
        >
          ‹
        </button>

        <div className="flipbook__viewport">
          {/* @ts-expect-error react-pageflip typings omit several runtime props */}
          <HTMLFlipBook
            ref={bookRef}
            className="flipbook__root"
            width={bookWidth}
            height={bookHeight}
            size="stretch"
            minWidth={280}
            maxWidth={560}
            minHeight={380}
            maxHeight={780}
            drawShadow
            flippingTime={1000}
            usePortrait
            startZIndex={5}
            autoSize
            maxShadowOpacity={0.5}
            showCover
            mobileScrollSupport
            swipeDistance={25}
            clickEventForward
            useMouseEvents
            showPageCorners
            disableFlipByClick={false}
            onFlip={onFlip}
            onInit={onInit}
          >
            {pages.map((page) => {
              if (page.type === "cover") {
                return (
                  <FlipPage
                    key={page.id}
                    density="hard"
                    className="flip-page--cover"
                  >
                    <div className="flipbook__cover">
                      <p className="flipbook__kicker">{year}</p>
                      <h2>
                        {meta.labelKo} 작품집
                        <small>{meta.labelEn} Anthology</small>
                      </h2>
                      <p className="flipbook__org">{siteNameKo}</p>
                      <p className="flipbook__org-en">{siteNameEn}</p>
                      <p className="flipbook__count">
                        수록 작품 {posts.length}편
                      </p>
                    </div>
                  </FlipPage>
                );
              }

              if (page.type === "toc") {
                const slice = posts.slice(
                  page.tocIndex * TOC_CHUNK,
                  page.tocIndex * TOC_CHUNK + TOC_CHUNK,
                );
                return (
                  <FlipPage key={page.id}>
                    <div className="flipbook__toc">
                      <h2>
                        차례
                        {tocCount > 1 ? ` (${page.tocIndex + 1})` : ""}
                      </h2>
                      <ol start={page.tocIndex * TOC_CHUNK + 1}>
                        {slice.map((post, i) => {
                          const absolute = page.tocIndex * TOC_CHUNK + i;
                          return (
                            <li key={post.id}>
                              <button
                                type="button"
                                onClick={() => flipToWork(absolute)}
                              >
                                <span>{post.title || "(제목 없음)"}</span>
                                <em>{post.authorName}</em>
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </FlipPage>
                );
              }

              if (page.type === "work") {
                const photo =
                  showImage && Boolean(page.post.imageBytesBase64);
                const prose = meta.kind === "essay" || meta.kind === "unpack_bundle";
                return (
                  <FlipPage key={page.id}>
                    <div
                      className={[
                        "flipbook__work",
                        photo ? "flipbook__work--photo" : "",
                        prose ? "flipbook__work--prose" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <p className="flipbook__work-index">
                        {meta.labelKo} · {page.index + 1}
                      </p>
                      <h2>{page.post.title || "(제목 없음)"}</h2>
                      <p className="flipbook__work-author">
                        {page.post.authorName}
                      </p>
                      {photo ? (
                        <BoardPhoto
                          className="flipbook__work-image"
                          src={`data:image/jpeg;base64,${page.post.imageBytesBase64}`}
                          trimLetterbox
                        />
                      ) : null}
                      <div className="flipbook__work-body">
                        {formatBoardBody(meta.kind, page.post.body)}
                      </div>
                    </div>
                  </FlipPage>
                );
              }

              if (page.type === "blank") {
                return (
                  <FlipPage key={page.id} className="flip-page--blank">
                    <span className="sr-only">빈 페이지</span>
                  </FlipPage>
                );
              }

              return (
                <FlipPage
                  key={page.id}
                  density="hard"
                  className="flip-page--cover"
                >
                  <div className="flipbook__colophon">
                    <h2>판권 · Colophon</h2>
                    <p>
                      {siteNameKo}
                      <br />
                      {year} {meta.labelKo} 작품집 (초안)
                    </p>
                    <p className="flipbook__org-en">
                      Draft anthology from public board posts. Curated editions
                      may follow with author consent.
                    </p>
                    {posts.length === 0 ? (
                      <p>아직 수록할 작품이 없습니다.</p>
                    ) : (
                      <p>총 {posts.length}편</p>
                    )}
                    <button
                      type="button"
                      className="cta cta--ghost"
                      onClick={() => bookRef.current?.pageFlip().flip(0, "top")}
                    >
                      표지로
                    </button>
                  </div>
                </FlipPage>
              );
            })}
          </HTMLFlipBook>
        </div>

        <button
          type="button"
          className="flipbook__nav flipbook__nav--next"
          aria-label="다음 페이지"
          disabled={index >= total - 1}
          onClick={() => bookRef.current?.pageFlip().flipNext("bottom")}
        >
          ›
        </button>
      </div>

      <div className="flipbook__footer">
        <button
          type="button"
          className="flipbook__text-btn"
          disabled={index <= 0}
          onClick={() => bookRef.current?.pageFlip().flipPrev("bottom")}
        >
          이전
        </button>
        <p className="flipbook__pager">
          {Math.min(index + 1, total)} / {total}
        </p>
        <button
          type="button"
          className="flipbook__text-btn"
          disabled={index >= total - 1}
          onClick={() => bookRef.current?.pageFlip().flipNext("bottom")}
        >
          다음
        </button>
      </div>
    </section>
  );
}
