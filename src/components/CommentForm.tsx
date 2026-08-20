"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createBoardComment } from "@/lib/board-write";
import type { BoardKind } from "@/lib/types";

type Props = {
  postId: string;
  kind: BoardKind;
};

export function CommentForm({ postId, kind }: Props) {
  const { member, canComment, loading } = useAuth();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;

  if (!member) {
    return (
      <aside className="app-write-cta is-compact">
        <p>
          댓글을 쓰려면 로그인해 주세요.
          <span>Sign in to comment.</span>
        </p>
        <Link href={`/login?next=/boards/${kind}/${postId}`}>로그인</Link>
      </aside>
    );
  }

  if (!canComment) {
    return (
      <p className="empty-state">승인된 회원만 댓글을 작성할 수 있습니다.</p>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!member || !body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createBoardComment({ postId, kind, member, body });
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글 저장 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="comment-form" onSubmit={onSubmit}>
      <label>
        댓글 작성
        <textarea
          required
          rows={3}
          maxLength={2000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="의견을 남겨 주세요"
        />
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="cta cta--primary" disabled={busy}>
        {busy ? "등록 중…" : "댓글 등록"}
      </button>
    </form>
  );
}
