"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { deleteBoardComment, updateBoardComment } from "@/lib/board-write";
import { authorKeyFromEmail } from "@/lib/member";
import {
  blockAuthor,
  getBlockedAuthorKeys,
  reportComment,
  REPORT_REASONS,
  type ReportReason,
} from "@/lib/moderation";
import { formatCommentTime } from "@/lib/site";
import type { BoardComment, BoardKind } from "@/lib/types";

type Props = {
  comments: BoardComment[];
  kind: BoardKind;
  postId: string;
};

export function CommentList({ comments, kind, postId }: Props) {
  const { member, loading } = useAuth();
  const router = useRouter();
  const [blockedTick, setBlockedTick] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());

  const blocked = useMemo(() => {
    if (!member) return new Set<string>();
    void blockedTick;
    return new Set(getBlockedAuthorKeys(member.email));
  }, [member, blockedTick]);

  const visible = comments.filter(
    (c) => !blocked.has(c.authorKey) && !hiddenIds.has(c.id),
  );

  if (loading) {
    return <p className="empty-state">댓글 불러오는 중…</p>;
  }

  if (visible.length === 0) {
    return <p className="empty-state">아직 댓글이 없습니다.</p>;
  }

  return (
    <div className="comment-list">
      {message ? (
        <p className="form-info" role="status">
          {message}
        </p>
      ) : null}
      {visible.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          kind={kind}
          postId={postId}
          onNotice={(text) => {
            setMessage(text);
            setBlockedTick((n) => n + 1);
            router.refresh();
          }}
          onDeleted={(id) => {
            setHiddenIds((prev) => new Set(prev).add(id));
            setMessage("댓글을 삭제했습니다.");
            router.refresh();
          }}
        />
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  kind,
  postId,
  onNotice,
  onDeleted,
}: {
  comment: BoardComment;
  kind: BoardKind;
  postId: string;
  onNotice: (text: string) => void;
  onDeleted: (id: string) => void;
}) {
  const { member, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [reason, setReason] = useState<ReportReason>("inappropriate");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myKey = member ? authorKeyFromEmail(member.email) : "";
  const isOwn =
    !!member &&
    (comment.authorKey === myKey ||
      (comment.authorEmail ?? "").toLowerCase() ===
        member.email.trim().toLowerCase());
  const canDelete = isAdmin || isOwn;

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!member || !draft.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await updateBoardComment({
        comment,
        kind,
        body: draft,
        memberEmail: member.email,
      });
      setEditing(false);
      setMenuOpen(false);
      onNotice("댓글을 수정했습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정 실패");
    } finally {
      setBusy(false);
    }
  }

  async function doDelete() {
    if (!canDelete) return;
    const label = isAdmin && !isOwn ? "운영진 권한으로 " : "";
    if (
      !window.confirm(
        `${label}이 댓글을 삭제하시겠습니까?\n\n${comment.authorName}: ${comment.body.slice(0, 80)}${comment.body.length > 80 ? "…" : ""}`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteBoardComment(comment.id);
      setMenuOpen(false);
      onDeleted(comment.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function doReport() {
    if (!member) return;
    void (async () => {
      setBusy(true);
      setError(null);
      try {
        await reportComment({
          reporterEmail: member.email,
          commentId: comment.id,
          postId,
          authorKey: comment.authorKey,
          authorName: comment.authorName,
          reason,
          boardType: kind,
          commentBody: comment.body,
        });
        setReporting(false);
        setMenuOpen(false);
        onNotice("신고가 접수되었습니다. 운영진이 검토합니다.");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "신고 접수에 실패했습니다.",
        );
      } finally {
        setBusy(false);
      }
    })();
  }

  function doBlock() {
    if (!member) return;
    if (isOwn) return;
    blockAuthor(member.email, comment.authorKey);
    setMenuOpen(false);
    onNotice(`${comment.authorName} 님을 차단했습니다.`);
  }

  return (
    <div className="comment">
      <div className="comment__head">
        <p className="comment__meta">
          <strong>{comment.authorName}</strong>
          {" · "}
          {formatCommentTime(comment.createdAt, comment.createdAtLabel)}
        </p>
        {member ? (
          <div className="comment__actions">
            <button
              type="button"
              className="comment__more"
              aria-expanded={menuOpen}
              disabled={busy}
              onClick={() => {
                setMenuOpen((v) => !v);
                setEditing(false);
                setReporting(false);
                setError(null);
              }}
            >
              ⋯
            </button>
            {menuOpen ? (
              <div className="comment__menu" role="menu">
                {isOwn ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setEditing(true);
                      setReporting(false);
                      setDraft(comment.body);
                    }}
                  >
                    수정
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setReporting(true);
                        setEditing(false);
                      }}
                    >
                      신고
                    </button>
                    <button type="button" role="menuitem" onClick={doBlock}>
                      차단
                    </button>
                  </>
                )}
                {canDelete ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="comment__menu-danger"
                    disabled={busy}
                    onClick={() => void doDelete()}
                  >
                    {busy
                      ? "삭제 중…"
                      : isAdmin && !isOwn
                        ? "삭제 (운영진)"
                        : "삭제"}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <Link
            href={`/login?next=/boards/${kind}/${postId}`}
            className="comment__login-hint"
          >
            로그인 후 신고·차단
          </Link>
        )}
      </div>

      {editing ? (
        <form className="comment-edit" onSubmit={saveEdit}>
          <textarea
            required
            rows={3}
            maxLength={2000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
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
              onClick={() => setEditing(false)}
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <p className="comment__body">{comment.body}</p>
      )}

      {error && !editing ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      {reporting ? (
        <div className="comment-report">
          <p>신고 사유</p>
          {REPORT_REASONS.map((r) => (
            <label key={r.id} className="compose-form__check">
              <input
                type="radio"
                name={`reason-${comment.id}`}
                checked={reason === r.id}
                onChange={() => setReason(r.id)}
              />
              {r.labelKo}
            </label>
          ))}
          <div className="compose-form__actions">
            <button type="button" className="cta cta--primary" disabled={busy} onClick={doReport}>
              {busy ? "접수 중…" : "신고하기"}
            </button>
            <button
              type="button"
              className="cta cta--gold"
              onClick={() => setReporting(false)}
            >
              취소
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
