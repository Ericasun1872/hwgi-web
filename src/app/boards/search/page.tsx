import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  UnifiedBoardSearch,
  type SearchablePost,
} from "@/components/UnifiedBoardSearch";
import { getPostsByKind } from "@/lib/firestore";
import { BOARD_KINDS, buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "통합 검색",
  description: "시·디카시·수필·시조 등 회원 작품 제목·작가명 검색",
  path: "/boards/search",
});

export const revalidate = 30;

export default async function BoardsSearchPage() {
  const lists = await Promise.all(
    BOARD_KINDS.map(async (board) => {
      const posts = await getPostsByKind(board.kind);
      return posts.map(
        (post): SearchablePost => ({
          ...post,
          kind: board.kind,
        }),
      );
    }),
  );
  const posts = lists.flat();

  return (
    <div className="page">
      <header className="page-header">
        <p style={{ marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          <Link href="/boards" style={{ color: "var(--muted)" }}>
            게시판
          </Link>
        </p>
        <h1>통합 검색</h1>
        <p>
          Search
          <span className="en">제목·작가명으로 모든 게시판 검색</span>
        </p>
      </header>

      <Suspense fallback={<p className="empty-state">불러오는 중…</p>}>
        <UnifiedBoardSearch posts={posts} />
      </Suspense>
    </div>
  );
}
