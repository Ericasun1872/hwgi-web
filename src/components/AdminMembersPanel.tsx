"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  approveMember,
  fetchApprovedMembers,
  fetchPendingMembers,
  rejectMember,
  removeApprovedMember,
} from "@/lib/admin-members";
import {
  formatMemberDate,
  isAdminEmail,
  memberDisplayName,
  memberTypeLabelKo,
  type ChapterMember,
} from "@/lib/member";

export function AdminMembersPanel() {
  const { user, member, loading: authLoading } = useAuth();
  const isAdmin = isAdminEmail(user?.email ?? member?.email);

  const [pending, setPending] = useState<ChapterMember[]>([]);
  const [approved, setApproved] = useState<ChapterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, a] = await Promise.all([
        fetchPendingMembers(),
        fetchApprovedMembers(),
      ]);
      setPending(p);
      setApproved(a);
    } catch {
      setError(
        "회원 목록을 불러오지 못했습니다. 네트워크를 확인한 뒤 새로고침해 주세요.",
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

  if (authLoading) {
    return <p className="empty-state">확인 중…</p>;
  }

  if (!user || !member) {
    return (
      <div className="admin-gate">
        <p>운영진·회장 계정으로 로그인해 주세요.</p>
        <Link href="/login?next=/admin/members" className="cta cta--primary">
          로그인
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-gate">
        <p>회원 관리는 운영진·회장만 이용할 수 있습니다.</p>
        <Link href="/" className="cta cta--gold">
          홈으로
        </Link>
      </div>
    );
  }

  async function onApprove(m: ChapterMember) {
    setBusyEmail(m.email);
    setNotice(null);
    const result = await approveMember(m);
    setBusyEmail(null);
    setNotice(result.message);
    if (result.ok) await reload();
  }

  async function onReject(m: ChapterMember) {
    if (
      !window.confirm(
        `${memberDisplayName(m)}님의 가입을 반려하시겠습니까?`,
      )
    ) {
      return;
    }
    setBusyEmail(m.email);
    setNotice(null);
    const result = await rejectMember(m);
    setBusyEmail(null);
    setNotice(result.message);
    if (result.ok) await reload();
  }

  async function onRemove(m: ChapterMember) {
    if (isAdminEmail(m.email)) {
      setNotice("운영진·회장 계정은 이 목록에서 삭제할 수 없습니다.");
      return;
    }
    if (
      !window.confirm(
        `${memberDisplayName(m)} (${m.email})\n\n회원 목록에서 삭제하시겠습니까?\n` +
          `로그인 계정(Firebase Auth)은 이 화면에서 지워지지 않습니다.\n` +
          `필요하면 Firebase Console → Authentication에서 별도 삭제하세요.`,
      )
    ) {
      return;
    }
    setBusyEmail(m.email);
    setNotice(null);
    const result = await removeApprovedMember(m);
    setBusyEmail(null);
    setNotice(result.message);
    if (result.ok) await reload();
  }

  return (
    <div className="admin-members">
      <div className="admin-members__toolbar">
        <button
          type="button"
          className="cta cta--ghost"
          onClick={() => void reload()}
          disabled={loading || busyEmail !== null}
        >
          새로고침
        </button>
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

      <section className="admin-section" aria-labelledby="pending-heading">
        <h2 id="pending-heading">
          승인 대기
          <span className="admin-section__count">{pending.length}</span>
        </h2>
        <p className="admin-section__lead">
          웹·앱에서 가입 신청한 회원입니다. 승인하면 바로 로그인할 수 있습니다.
        </p>

        {loading ? (
          <p className="empty-state">불러오는 중…</p>
        ) : pending.length === 0 ? (
          <p className="empty-state">대기 중인 가입 신청이 없습니다.</p>
        ) : (
          <ul className="admin-member-list">
            {pending.map((m) => (
              <li key={m.email} className="admin-member-card">
                <div className="admin-member-card__body">
                  <strong>{memberDisplayName(m)}</strong>
                  {m.nameEn?.trim() ? (
                    <span className="admin-member-card__name-en">
                      {m.nameEn.trim()}
                    </span>
                  ) : null}
                  <span className="admin-member-card__type">
                    {memberTypeLabelKo(m.memberType)}
                  </span>
                  <span className="admin-member-card__meta">{m.email}</span>
                  {m.nickname?.trim() &&
                  m.nickname.trim() !== m.nameKo.trim() ? (
                    <span className="admin-member-card__meta">
                      본명: {m.nameKo}
                    </span>
                  ) : null}
                  {m.region ? (
                    <span className="admin-member-card__meta">
                      지역: {m.region}
                    </span>
                  ) : null}
                  {m.genre ? (
                    <span className="admin-member-card__meta">
                      장르: {m.genre}
                    </span>
                  ) : null}
                  {formatMemberDate(m.joinedAt) ? (
                    <span className="admin-member-card__meta">
                      신청일: {formatMemberDate(m.joinedAt)}
                    </span>
                  ) : null}
                </div>
                <div className="admin-member-card__actions">
                  <button
                    type="button"
                    className="cta cta--ghost"
                    disabled={busyEmail === m.email}
                    onClick={() => void onReject(m)}
                  >
                    반려
                  </button>
                  <button
                    type="button"
                    className="cta cta--primary"
                    disabled={busyEmail === m.email}
                    onClick={() => void onApprove(m)}
                  >
                    {busyEmail === m.email ? "처리 중…" : "승인"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-section" aria-labelledby="approved-heading">
        <h2 id="approved-heading">
          승인된 회원
          <span className="admin-section__count">{approved.length}</span>
        </h2>
        <p className="admin-section__lead">
          최근 가입한 회원이 위에 표시됩니다. 탈퇴한 회원은 앱 최신 버전에서
          탈퇴하면 목록에서 사라집니다. 그 외에는 「삭제」로 운영진이 직접 지울
          수 있습니다. 연회비·작가 표시 등 세부 관리는 회원 앱 「회원 관리」에서도
          가능합니다.
        </p>

        {loading ? null : approved.length === 0 ? (
          <p className="empty-state">승인된 회원이 없습니다.</p>
        ) : (
          <ul className="admin-member-list admin-member-list--compact">
            {approved.map((m) => (
              <li key={m.email} className="admin-member-row">
                <div className="admin-member-row__header">
                  <div className="admin-member-row__main">
                    <span className="admin-member-row__name">
                      {memberDisplayName(m)}
                    </span>
                    {m.nameEn?.trim() ? (
                      <span className="admin-member-row__name-en">
                        {m.nameEn.trim()}
                      </span>
                    ) : null}
                    <span className="admin-member-row__type">
                      {memberTypeLabelKo(m.memberType)}
                    </span>
                  </div>
                  {!isAdminEmail(m.email) ? (
                    <button
                      type="button"
                      className="admin-member-row__remove"
                      disabled={busyEmail === m.email}
                      onClick={() => void onRemove(m)}
                    >
                      {busyEmail === m.email ? "삭제 중…" : "삭제"}
                    </button>
                  ) : null}
                </div>
                <div className="admin-member-row__details">
                  <span className="admin-member-row__detail">
                    지역: {m.region?.trim() || "—"}
                  </span>
                  <span className="admin-member-row__detail">
                    장르: {m.genre?.trim() || "—"}
                  </span>
                  <span className="admin-member-row__detail">
                    가입일: {formatMemberDate(m.joinedAt) ?? "—"}
                  </span>
                  <span className="admin-member-row__detail">
                    승인일: {formatMemberDate(m.approvedAt) ?? "—"}
                  </span>
                  <span className="admin-member-row__email">{m.email}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
