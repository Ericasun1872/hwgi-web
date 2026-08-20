"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BoardSearchBar,
  matchesBoardSearch,
} from "@/components/BoardSearchBar";
import { boardMeta } from "@/lib/site";
import type { BoardPost } from "@/lib/types";

export type SearchablePost = BoardPost & { kind: string };

type Props = {
  posts: SearchablePost[];
};

export function UnifiedBoardSearch({ posts }: Props) {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const filtered = useMemo(
    () =>
      posts.filter((post) =>
        matchesBoardSearch(query, post.title || "", post.authorName || ""),
      ),
    [posts, query],
  );

  return (
    <div className="board-search-panel">
      <BoardSearchBar value={query} onChange={setQuery} autoFocus />
      {!query.trim() ? (
        <p className="board-search-hint">
          시·디카시·수필·시조 등 모든 게시판에서 제목·작가명으로 검색합니다.
        </p>
      ) : filtered.length === 0 ? (
        <p className="empty-state">검색 결과가 없습니다.</p>
      ) : (
        <ul className="post-list">
          {filtered.map((post) => {
            const meta = boardMeta(post.kind);
            return (
              <li key={`${post.kind}-${post.id}`}>
                <Link href={`/boards/${post.kind}/${post.id}`}>
                  <p className="meta">
                    {meta?.labelKo ?? post.kind}
                    {meta?.labelEn ? ` · ${meta.labelEn}` : ""}
                  </p>
                  <h2>{post.title || "(제목 없음)"}</h2>
                  <p className="meta">{post.authorName}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
