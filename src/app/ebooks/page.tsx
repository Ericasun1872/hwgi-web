import type { Metadata } from "next";
import Link from "next/link";
import { BOARD_KINDS, SITE_NAME_KO, buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "작품집 · 전자책",
  description:
    "미주지회 장르별 작품집. 책처럼 넘기며 읽고 PDF로 저장합니다.",
  path: "/ebooks",
});

const YEAR = new Date().getFullYear();

export default function EbooksPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>작품집 · 전자책</h1>
        <p>
          Genre anthologies
          <span className="en">
            장르별 작품을 책처럼 넘기며 읽고, PDF로도 저장합니다
          </span>
        </p>
      </header>

      <section className="ebook-intro" aria-label="안내">
        <p>
          회원은 지금처럼{" "}
          <Link href="/boards" style={{ borderBottom: "1px solid var(--gold-line)" }}>
            게시판
          </Link>
          에 글을 올리면 됩니다. 작품집은 그 글을{" "}
          <strong>장르별로 따로</strong> 모아, 온라인에서 책처럼 넘기며 봅니다.
        </p>
        <ol className="ebook-flow">
          <li>
            <strong>투고</strong> — 웹·앱 게시판에 작품 등록 (기존과 동일)
          </li>
          <li>
            <strong>책처럼 읽기</strong> — 장르를 고른 뒤 페이지를 넘겨 열람
          </li>
          <li>
            <strong>PDF</strong> — 필요하면 「PDF로 저장 · 인쇄」로 저장
          </li>
        </ol>
        <p className="ebook-note">
          {YEAR}년 초안은 해당 게시판의 공개 글을 모읍니다. 이후 운영진 선별·작가
          수록 동의가 정해지면 공식 작품집으로 다듬을 수 있습니다.
        </p>
      </section>

      <section aria-label="장르별 작품집">
        <h2 className="ebook-section-title">
          {YEAR} {SITE_NAME_KO} 장르별 작품집
        </h2>
        <div className="board-grid">
          {BOARD_KINDS.map((board) => (
            <Link
              key={board.kind}
              href={`/ebooks/${board.kind}`}
              className="board-tile"
            >
              <h2>{board.labelKo} 작품집</h2>
              <span className="en">{board.labelEn} anthology</span>
              <p>{board.description} · 책처럼 넘기기</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
