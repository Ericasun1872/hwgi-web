"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  deleteBoardReport,
  dismissBoardReport,
  fetchBoardReports,
} from "@/lib/admin-reports";
import { formatMemberDate, isAdminEmail } from "@/lib/member";
import { reportReasonLabelKo } from "@/lib/moderation";
import { boardMeta, isBoardKind } from "@/lib/site";
import type { BoardReport } from "@/lib/types";

export function AdminReportsPanel() {
  const { user, member, loading: authLoading } = useAuth();
  const isAdmin = isAdminEmail(user?.email ?? member?.email);

  const [reports, setReports] = useState<BoardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDismissed, setShowDismissed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReports(await fetchBoardReports());
    } catch {
      setError(
        "신고 목록을 불러오지 못했습니다. Firebase 규칙 배포·로그인 상태를 확인해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    void reload();
  }, [authLoading, isAdmin, reload]);

  const visible = useMemo(
    () =>
      showDismissed
        ? reports
        : reports.filter((r) => r.status === "open"),
    [reports, showDismissed],
  );

  const openCount = useMemo(
    () => reports.filter((r) => r.status === "open").length,
    [reports],
  );

  async function onDismiss(report: BoardReport) {
    setBusyId(report.id);
    setNotice(null);
    setError(null);
    try {
      await dismissBoardReport(report.id);
      setNotice("처리 완료로 표시했습니다.");
      await reload();
    } catch {
      setError("처리에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(report: BoardReport) {
    if (
      !window.confirm(
        `이 신고 기록을 삭제하시겠습니까?\n\n${report.authorName} · ${reportReasonLabelKo(report.reason)}`,
      )
    ) {
      return;
    }
    setBusyId(report.id);
    setNotice(null);
    setError(null);
    try {
      await deleteBoardReport(report.id);
      setNotice("신고 기록을 삭제했습니다.");
      await reload();
    } catch {
      setError("삭제에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading) {
    return <p className="empty-state">확인 중…</p>;
  }

  if (!user || !member) {
    return (
      <div className="admin-gate">
        <p>운영진·회장 계정으로 로그인해 주세요.</p>
        <Link href="/login?next=/admin/reports" className="cta cta--primary">
          로그인
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-gate">
        <p>신고 관리는 운영진·회장만 이용할 수 있습니다.</p>
        <Link href="/" className="cta cta--gold">
          홈으로
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-members">
      <div className="admin-members__toolbar">
        <button
          type="button"
          className="cta cta--gold"
          disabled={loading}
          onClick={() => void reload()}
        >
          {loading ? "불러오는 중…" : "새로고침"}
        </button>
        <label className="compose-form__check admin-reports__filter">
          <input
            type="checkbox"
            checked={showDismissed}
            onChange={(e) => setShowDismissed(e.target.checked)}
          />
          처리 완료 포함
        </label>
      </div>

      {notice ? (
        <p className="admin-members__notice" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="admin-section" aria-labelledby="reports-heading">
        <h2 id="reports-heading">
          댓글·콘텐츠 신고
          <span className="admin-section__count">{openCount}</span>
        </h2>
        <p className="admin-section__lead">
          웹·앱에서 접수된 신고가 Firebase에 저장됩니다. 처리 후 「처리
          완료」로 표시하거나 기록을 삭제할 수 있습니다. 차단은 각 회원 기기에
         만 적용됩니다.
        </p>

        {loading ? null : visible.length === 0 ? (
          <p className="empty-state">
            {showDismissed
              ? "신고 기록이 없습니다."
              : "처리할 신고가 없습니다."}
          </p>
        ) : (
          <ul className="admin-member-list">
            {visible.map((r) => {
              const board = isBoardKind(r.boardType)
                ? boardMeta(r.boardType)
                : null;
              const postHref =
                r.postId && isBoardKind(r.boardType)
                  ? `/boards/${r.boardType}/${r.postId}`
                  : null;

              return (
                <li key={r.id} className="admin-member-card">
                  <div className="admin-member-row__header">
                    <div className="admin-member-row__main">
                      <strong>{r.authorName || "작성자"}</strong>
                      <span className="admin-member-card__type">
                        {reportReasonLabelKo(r.reason)}
                      </span>
                      <span className="admin-member-card__meta">
                        {r.status === "open" ? "미처리" : "처리 완료"} ·{" "}
                        {r.source === "app" ? "앱" : "웹"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-member-row__details">
                    <span className="admin-member-row__detail">
                      신고자: {r.reporterEmail}
                    </span>
                    <span className="admin-member-row__detail">
                      게시판: {board?.labelKo ?? (r.boardType || "—")}
                    </span>
                    <span className="admin-member-row__detail">
                      접수: {formatMemberDate(r.reportedAt) ?? "—"}
                    </span>
                    {r.commentBody?.trim() ? (
                      <span className="admin-member-row__detail admin-report__preview">
                        내용: {r.commentBody.trim()}
                      </span>
                    ) : null}
                    {postHref ? (
                      <Link
                        href={postHref}
                        className="admin-report__link"
                        style={{ borderBottom: "1px solid var(--gold-line)" }}
                      >
                        해당 글 보기
                      </Link>
                    ) : null}
                  </div>

                  <div className="admin-member-row__actions">
                    {r.status === "open" ? (
                      <button
                        type="button"
                        className="cta cta--primary"
                        disabled={busyId === r.id}
                        onClick={() => void onDismiss(r)}
                      >
                        {busyId === r.id ? "처리 중…" : "처리 완료"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="cta cta--gold"
                      disabled={busyId === r.id}
                      onClick={() => void onDelete(r)}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
