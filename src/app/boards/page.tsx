import type { Metadata } from "next";
import Link from "next/link";
import { WriteCta } from "@/components/WriteCta";
import { BOARD_KINDS, buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "게시판",
  description:
    "시·디카시·수필·시조 등 미주지회 회원 작품 게시판. Member literary boards.",
  path: "/boards",
});

export default function BoardsPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>게시판</h1>
        <p>
          회원 작품을 읽어 보세요
          <span className="en">Browse member writing by genre</span>
        </p>
      </header>

      <form className="board-search-panel" action="/boards/search" method="get">
        <label className="board-search">
          <span className="sr-only">게시글 검색</span>
          <input
            type="search"
            name="q"
            placeholder="제목·작가명 검색… / Search title or author"
            autoComplete="off"
          />
        </label>
        <p className="board-search-hint">
          검색어를 입력한 뒤 Enter를 누르면 통합 검색으로 이동합니다.{" "}
          <Link
            href="/boards/search"
            style={{ borderBottom: "1px solid var(--gold-line)" }}
          >
            검색 화면 열기
          </Link>
        </p>
      </form>

      <div className="board-grid">
        {BOARD_KINDS.map((board) => (
          <Link
            key={board.kind}
            href={`/boards/${board.kind}`}
            className="board-tile"
          >
            <h2>{board.labelKo}</h2>
            <span className="en">{board.labelEn}</span>
            <p>{board.description}</p>
          </Link>
        ))}
      </div>

      <WriteCta />
    </div>
  );
}
