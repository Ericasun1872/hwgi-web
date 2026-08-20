"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export function WriteCta({
  kind,
  compact = false,
}: {
  kind?: string;
  compact?: boolean;
}) {
  const { member, canWrite, loading } = useAuth();

  if (loading) return null;

  if (member && canWrite && kind) {
    return (
      <aside className={`app-write-cta ${compact ? "is-compact" : ""}`}>
        <p>
          이 게시판에 작품을 올릴 수 있습니다.
          <span>You can publish on this board.</span>
        </p>
        <Link href={`/boards/${kind}/new`}>새 글 쓰기</Link>
      </aside>
    );
  }

  if (member && !canWrite) {
    return (
      <aside className={`app-write-cta ${compact ? "is-compact" : ""}`}>
        <p>
          일반 회원은 댓글만 가능합니다. 글쓰기는 미주지회 회원에게 열려
          있습니다.
        </p>
        <Link href="/join">가입 안내</Link>
      </aside>
    );
  }

  return (
    <aside className={`app-write-cta ${compact ? "is-compact" : ""}`}>
      <p>
        작품·댓글은 로그인 후 웹에서도 작성할 수 있습니다.
        <span>Sign in to post or comment on the web.</span>
      </p>
      <Link href={kind ? `/login?next=/boards/${kind}` : "/login"}>로그인</Link>
    </aside>
  );
}
