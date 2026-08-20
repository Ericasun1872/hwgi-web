"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { deleteBoardPost } from "@/lib/board-write";
import type { BoardKind, BoardPost } from "@/lib/types";

type Props = {
  kind: BoardKind;
  post: BoardPost;
};

/** 운영진만 — 앱의 관리자 글 삭제와 동일 */
export function DeletePostButton({ kind, post }: Props) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading || !isAdmin) return null;

  async function onDelete() {
    if (
      !window.confirm(
        `운영진 권한으로 이 글을 삭제할까요?\n\n「${post.title || "(제목 없음)"}」\n작성자: ${post.authorName}\n\nDelete this post permanently?`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteBoardPost(post.id);
      router.push(`/boards/${kind}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
      setBusy(false);
    }
  }

  return (
    <div className="post-admin-actions">
      <button
        type="button"
        className="text-action text-action--danger"
        disabled={busy}
        onClick={() => void onDelete()}
      >
        {busy ? "삭제 중…" : "글 삭제 (운영진)"}
      </button>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
