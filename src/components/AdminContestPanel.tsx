"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminCopyFields } from "@/components/AdminCopyFields";
import { AdminWinnersForm } from "@/components/AdminWinnersForm";
import { useAuth } from "@/components/AuthProvider";
import {
  contestToInput,
  createContestUpdate,
  deleteContestUpdate,
  getContestEventClient,
  getContestPublicationClient,
  listContestUpdatesClient,
  saveContestEvent,
  saveContestPublication,
  type ContestInput,
} from "@/lib/admin-content";
import { defaultContestPublication } from "@/lib/contest-winners";
import { fileToOptimizedBase64 } from "@/lib/board-write";
import { isAdminEmail, memberDisplayName } from "@/lib/member";
import type { ContestPublication, ContestUpdate } from "@/lib/types";

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
  const [publication, setPublication] = useState<ContestPublication | null>(
    null,
  );
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
      const [contest, feed, published] = await Promise.all([
        getContestEventClient().catch(() => null),
        listContestUpdatesClient().catch(() => []),
        getContestPublicationClient().catch(() => null),
      ]);
      setDraft(contestToInput(contest));
      const next = published ?? defaultContestPublication();
      if (!published && contest) {
        next.titleKo = contest.titleKo || next.titleKo;
        next.titleEn = contest.titleEn || next.titleEn;
        next.dateLabel = contest.dateLabel || next.dateLabel;
        next.bodyKo = contest.bodyKo || "";
        next.bodyEn = contest.bodyEn || "";
        next.detailUrl = contest.detailUrl || "";
        if (contest.prizes && contest.prizes.length > 0) {
          next.prizes = contest.prizes;
        }
      }
      setPublication(next);
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
        <p>
          수상자 명단을 수정하려면 회장·운영진 계정으로 로그인해 주세요. 일반
          회원 계정에는 이 화면이 열리지 않습니다.
        </p>
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
        <p>
          지금 로그인한 계정은 운영진 계정이 아닙니다. 로그아웃한 뒤 회장·운영진
          이메일로 다시 로그인해 주세요.
        </p>
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

  async function onSavePublication(e: FormEvent) {
    e.preventDefault();
    if (!publication) return;
    setBusy(true);
    setError(null);
    try {
      await saveContestPublication(publication);
      setNotice("공모전 내용을 저장했습니다. 페이지에 반영됩니다.");
      await reload();
      onChanged?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "공모전 내용 저장에 실패했습니다.",
      );
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

      {loading || !draft || !publication ? (
        <p className="empty-state">불러오는 중…</p>
      ) : (
        <>
          <section className="admin-section" aria-labelledby="contest-winners-edit">
            <h2 id="contest-winners-edit">공모전 내용</h2>
            <p className="admin-section__lead">
              아래 글을 고치고 저장하면 공모전 페이지의 문장과 수상자 이름이
              그대로 바뀝니다. 비워 둔 문단과 수상자 줄은 저장할 때 빠집니다.
            </p>
            <div className="compose-form admin-winners-form">
              <div className="admin-winner-card__grid">
                <label>
                  페이지 제목 (한글)
                  <input
                    value={publication.titleKo}
                    onChange={(e) =>
                      setPublication((current) =>
                        current ? { ...current, titleKo: e.target.value } : current,
                      )
                    }
                  />
                </label>
                <label>
                  페이지 제목 (영문)
                  <input
                    value={publication.titleEn}
                    onChange={(e) =>
                      setPublication((current) =>
                        current ? { ...current, titleEn: e.target.value } : current,
                      )
                    }
                  />
                </label>
              </div>
              <label>
                일정
                <input
                  value={publication.dateLabel}
                  onChange={(e) =>
                    setPublication((current) =>
                      current ? { ...current, dateLabel: e.target.value } : current,
                    )
                  }
                />
              </label>
              <label>
                안내 본문 (한글)
                <textarea
                  rows={4}
                  value={publication.bodyKo}
                  onChange={(e) =>
                    setPublication((current) =>
                      current ? { ...current, bodyKo: e.target.value } : current,
                    )
                  }
                />
              </label>
              <label>
                안내 본문 (영문)
                <textarea
                  rows={4}
                  value={publication.bodyEn}
                  onChange={(e) =>
                    setPublication((current) =>
                      current ? { ...current, bodyEn: e.target.value } : current,
                    )
                  }
                />
              </label>
              <label>
                상세 안내 링크
                <input
                  type="url"
                  inputMode="url"
                  placeholder="https://…"
                  value={publication.detailUrl}
                  onChange={(e) =>
                    setPublication((current) =>
                      current ? { ...current, detailUrl: e.target.value } : current,
                    )
                  }
                />
              </label>
              <fieldset className="admin-prize-fields">
                <legend>시상 안내</legend>
                {publication.prizes.map((prize, index) => (
                  <div key={index} className="admin-prize-row">
                    <input
                      aria-label={`시상명 ${index + 1}`}
                      placeholder="예: 대상"
                      value={prize.place}
                      onChange={(e) =>
                        setPublication((current) => {
                          if (!current) return current;
                          const prizes = current.prizes.map((item, i) =>
                            i === index ? { ...item, place: e.target.value } : item,
                          );
                          return { ...current, prizes };
                        })
                      }
                    />
                    <input
                      aria-label={`시상 내용 ${index + 1}`}
                      placeholder="예: 상금 안내"
                      value={prize.amount}
                      onChange={(e) =>
                        setPublication((current) => {
                          if (!current) return current;
                          const prizes = current.prizes.map((item, i) =>
                            i === index
                              ? { ...item, amount: e.target.value }
                              : item,
                          );
                          return { ...current, prizes };
                        })
                      }
                    />
                    <button
                      type="button"
                      className="admin-member-row__remove"
                      onClick={() =>
                        setPublication((current) =>
                          current
                            ? {
                                ...current,
                                prizes: current.prizes.filter((_, i) => i !== index),
                              }
                            : current,
                        )
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
                    setPublication((current) =>
                      current
                        ? {
                            ...current,
                            prizes: [...current.prizes, { place: "", amount: "" }],
                          }
                        : current,
                    )
                  }
                >
                  시상 항목 추가
                </button>
              </fieldset>
              <AdminCopyFields
                value={publication}
                onChange={(copy) =>
                  setPublication((current) =>
                    current ? { ...current, ...copy } : current,
                  )
                }
              />
            </div>
            <AdminWinnersForm
              value={publication.winners}
              busy={busy}
              onChange={(winners) =>
                setPublication((current) =>
                  current ? { ...current, winners } : current,
                )
              }
              onSubmit={(event) => void onSavePublication(event)}
            />
          </section>

          <section className="admin-section" aria-labelledby="contest-info-heading">
            <h2 id="contest-info-heading">장소 기록</h2>
            <p className="admin-section__lead">
              장소는 내부 기록입니다. 페이지에 보이는 제목, 일정, 본문, 시상,
              수상자 글은 위의 「공모전 내용」에서 고칩니다.
            </p>
            <form className="compose-form admin-content-form" onSubmit={onSaveContest}>
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
              <div className="compose-form__actions">
                <button type="submit" className="cta cta--primary" disabled={busy}>
                  {busy ? "저장 중…" : "장소 저장"}
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
