"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  contestToInput,
  createContestUpdate,
  deleteContestUpdate,
  getContestEventClient,
  listContestUpdatesClient,
  saveContestEvent,
  type ContestInput,
} from "@/lib/admin-content";
import { fileToOptimizedBase64 } from "@/lib/board-write";
import { isAdminEmail, memberDisplayName } from "@/lib/member";
import type { ContestUpdate } from "@/lib/types";

export function AdminContestPanel({
  embedded = false,
  onChanged,
}: {
  embedded?: boolean;
  onChanged?: () => void;
} = {}) {
  const { user, member, loading: authLoading } = useAuth();
  const isAdmin = isAdminEmail(user?.email ?? member?.email);

  const [draft, setDraft] = useState<ContestInput | null>(null);
  const [updates, setUpdates] = useState<ContestUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postFile, setPostFile] = useState<File | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contest, feed] = await Promise.all([
        getContestEventClient(),
        listContestUpdatesClient(),
      ]);
      setDraft(contestToInput(contest));
      setUpdates(feed);
    } catch {
      setError("공모전 정보를 불러오지 못했습니다.");
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
        <Link href="/login?next=/admin/contest" className="cta cta--primary">
          로그인
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    if (embedded) return null;
    return (
      <div className="admin-gate">
        <p>공모전 관리는 운영진·회장만 이용할 수 있습니다.</p>
        <Link href="/" className="cta cta--gold">
          홈으로
        </Link>
      </div>
    );
  }

  async function onSaveContest(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.titleKo.trim()) {
      setError("공모전 제목을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveContestEvent(draft);
      setNotice("공모전 안내를 저장했습니다.");
      await reload();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function onCreateUpdate(e: FormEvent) {
    e.preventDefault();
    if (!member) return;
    if (!postTitle.trim() && !postBody.trim() && !postFile) {
      setError("제목·본문·이미지 중 하나 이상 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let imageBytesBase64: string | null = null;
      if (postFile) {
        imageBytesBase64 = await fileToOptimizedBase64(postFile);
      }
      await createContestUpdate({
        title: postTitle,
        body: postBody,
        authorEmail: member.email,
        authorName: memberDisplayName(member),
        imageBytesBase64,
      });
      setPostTitle("");
      setPostBody("");
      setPostFile(null);
      setNotice("공모전 업데이트 포스트를 올렸습니다.");
      await reload();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "포스트 저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteUpdate(update: ContestUpdate) {
    if (!window.confirm(`「${update.title || "업데이트"}」을(를) 삭제할까요?`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteContestUpdate(update.id);
      setNotice("업데이트 포스트를 삭제했습니다.");
      await reload();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function patchDraft(partial: Partial<ContestInput>) {
    if (!draft) return;
    setDraft({ ...draft, ...partial });
  }

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
        {!embedded ? (
          <Link href="/contest" className="cta cta--gold">
            공모전 페이지 보기
          </Link>
        ) : null}
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

      {loading || !draft ? (
        <p className="empty-state">불러오는 중…</p>
      ) : (
        <>
          <section className="admin-section" aria-labelledby="contest-info-heading">
            <h2 id="contest-info-heading">공모전 안내</h2>
            <p className="admin-section__lead">
              제목·일정·장소·본문·시상 안내를 수정합니다. 저장 후 웹 공모전
              페이지에 반영됩니다.
            </p>
            <form className="compose-form admin-content-form" onSubmit={onSaveContest}>
              <label>
                제목 (한글) *
                <input
                  required
                  value={draft.titleKo}
                  onChange={(e) => patchDraft({ titleKo: e.target.value })}
                />
              </label>
              <label>
                제목 (영문)
                <input
                  value={draft.titleEn}
                  onChange={(e) => patchDraft({ titleEn: e.target.value })}
                />
              </label>
              <label>
                일정
                <input
                  value={draft.dateLabel}
                  onChange={(e) => patchDraft({ dateLabel: e.target.value })}
                />
              </label>
              <label>
                장소 (한글)
                <input
                  value={draft.locationKo}
                  onChange={(e) => patchDraft({ locationKo: e.target.value })}
                />
              </label>
              <label>
                장소 (영문)
                <input
                  value={draft.locationEn}
                  onChange={(e) => patchDraft({ locationEn: e.target.value })}
                />
              </label>
              <label>
                사이트 상세내용 링크
                <input
                  type="url"
                  inputMode="url"
                  placeholder="https://…"
                  value={draft.detailUrl}
                  onChange={(e) => patchDraft({ detailUrl: e.target.value })}
                />
              </label>
              <label>
                안내 본문 (한글)
                <textarea
                  rows={7}
                  value={draft.bodyKo}
                  onChange={(e) => patchDraft({ bodyKo: e.target.value })}
                />
              </label>
              <label>
                안내 본문 (영문)
                <textarea
                  rows={6}
                  value={draft.bodyEn}
                  onChange={(e) => patchDraft({ bodyEn: e.target.value })}
                />
              </label>

              <fieldset className="admin-prize-fields">
                <legend>시상 안내</legend>
                {draft.prizes.map((prize, index) => (
                  <div key={index} className="admin-prize-row">
                    <input
                      aria-label={`시상명 ${index + 1}`}
                      placeholder="예: 대상"
                      value={prize.place}
                      onChange={(e) => {
                        const prizes = draft.prizes.map((p, i) =>
                          i === index ? { ...p, place: e.target.value } : p,
                        );
                        patchDraft({ prizes });
                      }}
                    />
                    <input
                      aria-label={`시상 내용 ${index + 1}`}
                      placeholder="예: 상금 안내"
                      value={prize.amount}
                      onChange={(e) => {
                        const prizes = draft.prizes.map((p, i) =>
                          i === index ? { ...p, amount: e.target.value } : p,
                        );
                        patchDraft({ prizes });
                      }}
                    />
                    <button
                      type="button"
                      className="admin-member-row__remove"
                      onClick={() =>
                        patchDraft({
                          prizes: draft.prizes.filter((_, i) => i !== index),
                        })
                      }
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="cta cta--ghost"
                  onClick={() =>
                    patchDraft({
                      prizes: [...draft.prizes, { place: "", amount: "" }],
                    })
                  }
                >
                  시상 항목 추가
                </button>
              </fieldset>

              <div className="compose-form__actions">
                <button type="submit" className="cta cta--primary" disabled={busy}>
                  {busy ? "저장 중…" : "공모전 안내 저장"}
                </button>
              </div>
            </form>
          </section>

          <section className="admin-section" aria-labelledby="contest-updates-heading">
            <h2 id="contest-updates-heading">업데이트 포스트</h2>
            <p className="admin-section__lead">
              공모전 새 소식·안내문을 제목·본문·이미지와 함께 올립니다. 공모전
              페이지 하단에 표시됩니다.
            </p>

            <form className="compose-form admin-content-form" onSubmit={onCreateUpdate}>
              <label>
                제목
                <input
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="예: 접수 마감 연장 안내"
                />
              </label>
              <label>
                본문
                <textarea
                  rows={6}
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                />
              </label>
              <label className="compose-form__file">
                이미지 (선택)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPostFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <div className="compose-form__actions">
                <button type="submit" className="cta cta--primary" disabled={busy}>
                  {busy ? "올리는 중…" : "포스트 올리기"}
                </button>
              </div>
            </form>

            {updates.length === 0 ? (
              <p className="empty-state">아직 올린 업데이트 포스트가 없습니다.</p>
            ) : (
              <ul className="admin-member-list">
                {updates.map((update) => (
                  <li key={update.id} className="admin-member-card">
                    <div className="admin-member-card__body">
                      <strong>{update.title || "(제목 없음)"}</strong>
                      {update.createdAt ? (
                        <span className="admin-member-card__meta">
                          {update.createdAt.slice(0, 10)}
                        </span>
                      ) : null}
                      {update.body ? (
                        <span className="admin-member-card__meta">
                          {update.body.slice(0, 120)}
                          {update.body.length > 120 ? "…" : ""}
                        </span>
                      ) : null}
                      {update.imageBytesBase64 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="admin-contest-thumb"
                          src={`data:image/jpeg;base64,${update.imageBytesBase64}`}
                          alt=""
                        />
                      ) : null}
                    </div>
                    <div className="admin-member-card__actions">
                      <button
                        type="button"
                        className="admin-member-row__remove"
                        disabled={busy}
                        onClick={() => void onDeleteUpdate(update)}
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
