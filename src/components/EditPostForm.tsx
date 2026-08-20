"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { updateBoardPost, fileToOptimizedBase64 } from "@/lib/board-write";
import { isOwnAuthoredContent } from "@/lib/member";
import type { BoardKind, BoardPost } from "@/lib/types";

type Props = {
  kind: BoardKind;
  post: BoardPost;
};

export function EditPostForm({ kind, post }: Props) {
  const { member, canWrite } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [authorName, setAuthorName] = useState(post.authorName);
  const [file, setFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const isOwn = !!member && isOwnAuthoredContent(member.email, post);

  // 승인 회원 + 본인 글만 수정 (남의 글 수정 불가)
  if (!canWrite || !member || !isOwn) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!member || !isOwnAuthoredContent(member.email, post)) {
      setError("본인이 작성한 글만 수정할 수 있습니다.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let imageBytesBase64: string | null | undefined;
      if (file) {
        imageBytesBase64 = await fileToOptimizedBase64(file);
      }
      await updateBoardPost({
        id: post.id,
        kind,
        member,
        title,
        body,
        authorName: authorName.trim() || post.authorName,
        authorEmail: post.authorEmail,
        authorKey: post.authorKey,
        imageBytesBase64,
        clearImage: removeImage && !file,
        hasBakedText: post.hasBakedText,
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="text-action"
        onClick={() => setOpen(true)}
      >
        글 수정
      </button>
    );
  }

  return (
    <form className="compose-form" onSubmit={onSubmit}>
      <p className="compose-form__board">글 수정</p>
      <label>
        이름 (필명)
        <input
          required
          maxLength={40}
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
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
      {post.imageBytesBase64 && !removeImage ? (
        <label className="compose-form__check">
          <input
            type="checkbox"
            checked={removeImage}
            onChange={(e) => setRemoveImage(e.target.checked)}
          />
          기존 사진 삭제
        </label>
      ) : null}
      <label className="compose-form__file">
        사진 바꾸기 (선택)
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
          {busy ? "저장 중…" : "저장"}
        </button>
        <button
          type="button"
          className="cta cta--gold"
          onClick={() => setOpen(false)}
        >
          닫기
        </button>
        <Link href={`/boards/${kind}`} className="cta cta--gold">
          목록
        </Link>
      </div>
    </form>
  );
}
