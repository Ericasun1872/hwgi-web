"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BoardSearchBar,
  matchesBoardSearch,
} from "@/components/BoardSearchBar";
import type { BoardPost } from "@/lib/types";

type Props = {
  kind: string;
  posts: BoardPost[];
};

export function BoardPostList({ kind, posts }: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      posts.filter((post) =>
        matchesBoardSearch(query, post.title || "", post.authorName || ""),
      ),
    [posts, query],
  );

  if (posts.length === 0) {
    return (
      <p className="empty-state">
        아직 공개된 글이 없습니다. 로그인 후 첫 작품을 올려 보세요.
      </p>
    );
  }

  return (
    <div className="board-search-panel">
      <BoardSearchBar value={query} onChange={setQuery} />
      {filtered.length === 0 ? (
        <p className="empty-state">검색 결과가 없습니다.</p>
      ) : (
        <ul className="post-list">
          {filtered.map((post) => (
            <li key={post.id}>
              <Link href={`/boards/${kind}/${post.id}`}>
                <h2>{post.title || "(제목 없음)"}</h2>
                <p className="meta">{post.authorName}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
