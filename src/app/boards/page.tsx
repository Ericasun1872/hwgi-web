import type { Metadata } from "next";
import Link from "next/link";
import { WriteCta } from "@/components/WriteCta";
import { getAllBoardPosts } from "@/lib/firestore";
import { BOARD_KINDS, buildMetadata } from "@/lib/site";
import type { BoardPost } from "@/lib/types";

export const metadata: Metadata = buildMetadata({
  title: "게시판",
  description:
    "시·디카시·수필·시조 등 미주지회 회원 작품 게시판. Member literary boards.",
  path: "/boards",
});

export const revalidate = 30;

export default async function BoardsPage() {
  let posts: BoardPost[] = [];
  try {
    posts = await getAllBoardPosts();
  } catch {
    posts = [];
  }

  const previews = BOARD_KINDS.map((board) => ({
    ...board,
    posts: posts
      .filter((post) => post.kind === board.kind || post.boardType === board.kind)
      .slice(0, 3),
  }));

  return (
    <div className="page">
      <header className="page-header">
        <h1>게시판</h1>
        <p>
          회원 작품을 읽어 보세요
          <span className="en">Browse member writing by genre</span>
        </p>
        <p className="phase-note">
          작품 작성과 댓글은 승인된 회원만 할 수 있습니다. 웹에서 가입한 뒤 운영진
          승인을 받으면 글을 쓸 수 있습니다.
          <span className="en">
            Only approved members may post or comment. Join on the web, then
            wait for chapter approval.
          </span>
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

      <section className="board-previews" aria-label="장르별 최신 작품">
        {previews.map((board) => (
          <article key={board.kind}>
            <h2>
              <Link href={`/boards/${board.kind}`}>{board.labelKo}</Link>
              <small>{board.labelEn}</small>
            </h2>
            {board.posts.length === 0 ? (
              <p className="empty-state">아직 올라온 작품이 없습니다.</p>
            ) : (
              <ul>
                {board.posts.map((post) => (
                  <li key={post.id}>
                    <Link href={`/boards/${board.kind}/${post.id}`}>
                      {post.title || "제목 없음"}
                    </Link>
                    <span>{post.authorName}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>

      <WriteCta />

      <p className="phase-note" style={{ marginTop: "2rem" }}>
        장르별 작품을 모아 전자 작품집으로 보려면{" "}
        <Link
          href="/ebooks"
          style={{ borderBottom: "1px solid var(--gold-line)" }}
        >
          작품집 · 전자책
        </Link>
        으로 이동하세요.
      </p>
    </div>
  );
}
