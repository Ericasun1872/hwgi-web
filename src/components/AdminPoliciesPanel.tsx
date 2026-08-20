"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  getChapterPoliciesClient,
  saveChapterPolicies,
} from "@/lib/admin-policies";
import { isAdminEmail } from "@/lib/member";
import { DEFAULT_POLICIES, type ChapterPolicies } from "@/lib/policies";

export function AdminPoliciesPanel() {
  const { user, member, loading: authLoading } = useAuth();
  const isAdmin = isAdminEmail(user?.email ?? member?.email);

  const [draft, setDraft] = useState<ChapterPolicies | null>(null);
  const [tab, setTab] = useState<"terms" | "privacy" | "bylaws">("terms");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDraft(await getChapterPoliciesClient());
    } catch {
      setError("약관·정관 내용을 불러오지 못했습니다.");
      setDraft({ ...DEFAULT_POLICIES });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAdmin) {
      setLoading(false);
      return;
    }
    void reload();
  }, [authLoading, isAdmin, reload]);

  if (authLoading) return <p className="empty-state">확인 중…</p>;

  if (!user || !member) {
    return (
      <div className="admin-gate">
        <p>운영진·회장 계정으로 로그인해 주세요.</p>
        <Link href="/login?next=/admin/policies" className="cta cta--primary">
          로그인
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-gate">
        <p>약관·정관 관리는 운영진·회장만 이용할 수 있습니다.</p>
        <Link href="/" className="cta cta--gold">
          홈으로
        </Link>
      </div>
    );
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      await saveChapterPolicies(draft);
      setNotice("저장했습니다. 공개 페이지에 반영됩니다.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function patch(partial: Partial<ChapterPolicies>) {
    if (!draft) return;
    setDraft({ ...draft, ...partial });
  }

  const titleKey =
    tab === "terms"
      ? "termsTitle"
      : tab === "privacy"
        ? "privacyTitle"
        : "bylawsTitle";
  const bodyKey =
    tab === "terms"
      ? "termsBody"
      : tab === "privacy"
        ? "privacyBody"
        : "bylawsBody";

  return (
    <div className="admin-members">
      <div className="admin-members__toolbar">
        <button
          type="button"
          className="cta cta--ghost"
          onClick={() => void reload()}
          disabled={busy || loading}
        >
          새로고침
        </button>
        <Link href="/terms" className="cta cta--gold">
          이용약관 보기
        </Link>
        <Link href="/bylaws" className="cta cta--gold">
          정관 보기
        </Link>
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

      <div className="policy-tabs" role="tablist" aria-label="문서 선택">
        {(
          [
            ["terms", "이용약관"],
            ["privacy", "개인정보"],
            ["bylaws", "정관"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`policy-tabs__btn${tab === id ? " is-active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading || !draft ? (
        <p className="empty-state">불러오는 중…</p>
      ) : (
        <form className="compose-form admin-content-form" onSubmit={onSave}>
          <label>
            제목
            <input
              required
              value={draft[titleKey]}
              onChange={(e) => patch({ [titleKey]: e.target.value })}
            />
          </label>
          <label>
            본문
            <textarea
              required
              rows={22}
              value={draft[bodyKey]}
              onChange={(e) => patch({ [bodyKey]: e.target.value })}
            />
          </label>
          <div className="compose-form__actions">
            <button type="submit" className="cta cta--primary" disabled={busy}>
              {busy ? "저장 중…" : "저장"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
