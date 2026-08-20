"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  createBoardPost,
  fileToOptimizedBase64,
} from "@/lib/board-write";
import { memberDisplayName } from "@/lib/member";
import type { BoardKind } from "@/lib/types";

type Props = {
  kind: BoardKind;
  labelKo: string;
};

export function NewPostForm({ kind, labelKo }: Props) {
  const { member, canWrite, loading: authLoading } = useAuth();
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setAuthorName(memberDisplayName(member));
    }
  }, [member]);

  if (authLoading) {
    return <p className="empty-state">확인 중…</p>;
  }

  if (!member) {
    return (
      <aside className="app-write-cta">
        <p>
          글을 쓰려면 로그인해 주세요.
          <span>Sign in to post.</span>
        </p>
        <Link href={`/login?next=/boards/${kind}/new`}>로그인</Link>
      </aside>
    );
  }

  if (!canWrite) {
    return (
      <aside className="app-write-cta">
        <p>
          미주지회 회원(승인·회비 회원)만 글을 올릴 수 있습니다. 일반 회원은
          댓글만 가능합니다.
        </p>
        <Link href="/join">가입 안내</Link>
      </aside>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!member) return;
    if (!authorName.trim()) {
      setError("회원(필명) 이름을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let imageBytesBase64: string | null = null;
      if (file) {
        imageBytesBase64 = await fileToOptimizedBase64(file);
      }
      const id = await createBoardPost({
        kind,
        member,
        authorName,
        title,
        body,
        imageBytesBase64,
      });
      router.push(`/boards/${kind}/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="compose-form" onSubmit={onSubmit}>
      <p className="compose-form__board">{labelKo} 새 글</p>
      <label>
        이름 (필명)
        <input
          required
          maxLength={40}
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="작품에 표시될 이름"
        />
      </label>
      <label>
        제목
        <input
          required
          maxLength={80}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        본문
        <textarea
          required
          rows={12}
          maxLength={8000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <label className="compose-form__file">
        사진 (선택)
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="compose-form__actions">
        <button type="submit" className="cta cta--primary" disabled={busy}>
          {busy ? "올리는 중…" : "올리기"}
        </button>
        <Link href={`/boards/${kind}`} className="cta cta--gold">
          취소
        </Link>
      </div>
    </form>
  );
}
