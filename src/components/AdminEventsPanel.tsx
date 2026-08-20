"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  deleteChapterEvent,
  emptyEventInput,
  eventToInput,
  listChapterEventsClient,
  saveChapterEvent,
  type EventInput,
} from "@/lib/admin-content";
import { isAdminEmail } from "@/lib/member";
import type { ChapterEvent } from "@/lib/types";

export function AdminEventsPanel({
  embedded = false,
  onChanged,
}: {
  embedded?: boolean;
  onChanged?: () => void;
} = {}) {
  const { user, member, loading: authLoading } = useAuth();
  const isAdmin = isAdminEmail(user?.email ?? member?.email);

  const [events, setEvents] = useState<ChapterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EventInput>(emptyEventInput());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listChapterEventsClient();
      setEvents(list.filter((e) => e.id !== "event_contest_2026"));
    } catch {
      setError("행사 목록을 불러오지 못했습니다.");
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
    if (embedded) return null;
    return (
      <div className="admin-gate">
        <p>운영진·회장 계정으로 로그인해 주세요.</p>
        <Link href="/login?next=/admin/events" className="cta cta--primary">
          로그인
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    if (embedded) return null;
    return (
      <div className="admin-gate">
        <p>행사 관리는 운영진·회장만 이용할 수 있습니다.</p>
        <Link href="/" className="cta cta--gold">
          홈으로
        </Link>
      </div>
    );
  }

  function startCreate() {
    setEditingId("new");
    setDraft(emptyEventInput());
    setNotice(null);
  }

  function startEdit(event: ChapterEvent) {
    setEditingId(event.id);
    setDraft(eventToInput(event));
    setNotice(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyEventInput());
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!draft.titleKo.trim()) {
      setError("한글 제목을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveChapterEvent(editingId === "new" ? null : editingId, draft);
      setNotice("행사를 저장했습니다. 위 목록에 바로 반영됩니다.");
      cancelEdit();
      await reload();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(event: ChapterEvent) {
    if (!window.confirm(`「${event.titleKo}」을(를) 삭제하시겠습니까?`)) return;
    setBusy(true);
    setError(null);
    try {
      await deleteChapterEvent(event.id);
      setNotice("행사를 삭제했습니다.");
      if (editingId === event.id) cancelEdit();
      await reload();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-members">
      <div className="admin-members__toolbar">
        <button
          type="button"
          className="cta cta--primary"
          onClick={startCreate}
          disabled={busy || editingId === "new"}
        >
          행사 추가
        </button>
        <button
          type="button"
          className="cta cta--ghost"
          onClick={() => void reload()}
          disabled={busy || loading}
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

      {editingId ? (
        <form className="compose-form admin-content-form" onSubmit={onSave}>
          <p className="compose-form__board">
            {editingId === "new" ? "새 행사" : "행사 수정"}
          </p>
          <EventFields draft={draft} setDraft={setDraft} />
          <div className="compose-form__actions">
            <button type="submit" className="cta cta--primary" disabled={busy}>
              {busy ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              className="cta cta--ghost"
              onClick={cancelEdit}
              disabled={busy}
            >
              취소
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p className="empty-state">불러오는 중…</p>
      ) : events.length === 0 ? (
        <p className="empty-state">등록된 행사가 없습니다. 「행사 추가」로 올려 주세요.</p>
      ) : (
        <ul className="admin-member-list">
          {events.map((event) => (
            <li key={event.id} className="admin-member-card">
              <div className="admin-member-card__body">
                <strong>{event.titleKo || "(제목 없음)"}</strong>
                {event.titleEn ? (
                  <span className="admin-member-card__type">{event.titleEn}</span>
                ) : null}
                {event.dateLabel ? (
                  <span className="admin-member-card__meta">{event.dateLabel}</span>
                ) : null}
                {event.locationKo ? (
                  <span className="admin-member-card__meta">
                    {event.locationKo}
                  </span>
                ) : null}
              </div>
              <div className="admin-member-card__actions">
                <button
                  type="button"
                  className="cta cta--ghost"
                  disabled={busy}
                  onClick={() => startEdit(event)}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="admin-member-row__remove"
                  disabled={busy}
                  onClick={() => void onDelete(event)}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EventFields({
  draft,
  setDraft,
}: {
  draft: EventInput;
  setDraft: (next: EventInput) => void;
}) {
  function patch(partial: Partial<EventInput>) {
    setDraft({ ...draft, ...partial });
  }
  return (
    <>
      <label>
        제목 (한글) *
        <input
          required
          value={draft.titleKo}
          onChange={(e) => patch({ titleKo: e.target.value })}
        />
      </label>
      <label>
        제목 (영문)
        <input
          value={draft.titleEn}
          onChange={(e) => patch({ titleEn: e.target.value })}
        />
      </label>
      <label>
        일정
        <input
          value={draft.dateLabel}
          onChange={(e) => patch({ dateLabel: e.target.value })}
          placeholder="예: 2026년 8월 15일"
        />
      </label>
      <label>
        장소 (한글)
        <input
          value={draft.locationKo}
          onChange={(e) => patch({ locationKo: e.target.value })}
        />
      </label>
      <label>
        장소 (영문)
        <input
          value={draft.locationEn}
          onChange={(e) => patch({ locationEn: e.target.value })}
        />
      </label>
      <label>
        안내 본문 (한글)
        <textarea
          rows={6}
          value={draft.bodyKo}
          onChange={(e) => patch({ bodyKo: e.target.value })}
        />
      </label>
      <label>
        안내 본문 (영문)
        <textarea
          rows={5}
          value={draft.bodyEn}
          onChange={(e) => patch({ bodyEn: e.target.value })}
        />
      </label>
    </>
  );
}
