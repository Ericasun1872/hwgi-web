import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardPhoto } from "@/components/BoardPhoto";
import { EbookFlipBook } from "@/components/EbookFlipBook";
import { EbookPrintButton } from "@/components/EbookPrintButton";
import { getPostsByKind } from "@/lib/firestore";
import { formatBoardBody } from "@/lib/format-body";
import {
  BOARD_KINDS,
  SITE_NAME_EN,
  SITE_NAME_KO,
  boardMeta,
  buildMetadata,
  isBoardKind,
} from "@/lib/site";
import type { BoardKind } from "@/lib/types";

type Props = { params: Promise<{ kind: string }> };

export const revalidate = 60;

export function generateStaticParams() {
  return BOARD_KINDS.map((b) => ({ kind: b.kind }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind } = await params;
  const meta = boardMeta(kind);
  if (!meta) return {};
  const year = new Date().getFullYear();
  return buildMetadata({
    title: `${year} ${meta.labelKo} 작품집`,
    description: `${SITE_NAME_KO} ${meta.labelKo}(${meta.labelEn}) 전자 작품집 — 책처럼 넘기며 읽기`,
    path: `/ebooks/${kind}`,
  });
}

export default async function EbookKindPage({ params }: Props) {
  const { kind } = await params;
  if (!isBoardKind(kind)) notFound();

  const meta = boardMeta(kind)!;
  const posts = await getPostsByKind(kind as BoardKind);
  const year = new Date().getFullYear();
  const isPhotoGenre = kind === "dica" || kind === "dansang";

  return (
    <div className="page ebook-page">
      <div className="ebook-toolbar no-print">
        <p>
          <Link href="/ebooks" style={{ color: "var(--muted)" }}>
            작품집
          </Link>
          {" · "}
          <Link href={`/boards/${kind}`} style={{ color: "var(--muted)" }}>
            {meta.labelKo} 게시판
          </Link>
        </p>
        <EbookPrintButton />
      </div>

      <EbookFlipBook
        year={year}
        meta={{
          labelKo: meta.labelKo,
          labelEn: meta.labelEn,
          kind,
        }}
        siteNameKo={SITE_NAME_KO}
        siteNameEn={SITE_NAME_EN}
        posts={posts}
      />

      {/* 인쇄·PDF용 전체 본문 (화면에서는 숨김) */}
      <div className="ebook-print-sheet">
        <header className="ebook-cover">
          <p className="ebook-cover__kicker">{year}</p>
          <h1>
            {meta.labelKo} 작품집
            <small>{meta.labelEn} Anthology</small>
          </h1>
          <p className="ebook-cover__org">{SITE_NAME_KO}</p>
          <p className="ebook-cover__org-en">{SITE_NAME_EN}</p>
          <p className="ebook-cover__count">수록 작품 {posts.length}편</p>
        </header>

        {posts.length === 0 ? (
          <p className="empty-state">아직 수록할 작품이 없습니다.</p>
        ) : (
          <>
            <nav className="ebook-toc" aria-label="차례">
              <h2>차례</h2>
              <ol>
                {posts.map((post, i) => (
                  <li key={post.id}>
                    <span className="ebook-toc__num">{i + 1}</span>
                    <span className="ebook-toc__title">
                      {post.title || "(제목 없음)"}
                    </span>
                    <span className="ebook-toc__author">{post.authorName}</span>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="ebook-works">
              {posts.map((post, i) => (
                <article key={post.id} className="ebook-work">
                  <p className="ebook-work__index">
                    {meta.labelKo} · {i + 1}
                  </p>
                  <h2>{post.title || "(제목 없음)"}</h2>
                  <p className="ebook-work__author">{post.authorName}</p>
                  {isPhotoGenre && post.imageBytesBase64 ? (
                    <BoardPhoto
                      className="ebook-work__image ebook-work__image--compact"
                      src={`data:image/jpeg;base64,${post.imageBytesBase64}`}
                      trimLetterbox
                    />
                  ) : null}
                  <div className="ebook-work__body post-body">
                    {formatBoardBody(kind, post.body)}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <footer className="ebook-colophon">
          <p>
            {SITE_NAME_KO} · {year} {meta.labelKo} 작품집 (초안)
          </p>
        </footer>
      </div>
    </div>
  );
}
