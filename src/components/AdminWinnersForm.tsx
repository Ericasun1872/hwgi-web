"use client";

import { FormEvent } from "react";
import { emptyWinner, emptyWinnerGroup } from "@/lib/contest-winners";
import type {
  ContestWinner,
  ContestWinnerAnnouncement,
  ContestWinnerGroup,
} from "@/lib/types";

const DIVISIONS: {
  key: keyof ContestWinnerAnnouncement;
  title: string;
  titleEn: string;
}[] = [
  {
    key: "korean",
    title: "1. 한국어 문학 부문",
    titleEn: "Korean Literature Division",
  },
  {
    key: "sijo",
    title: "2. 영어시조 부문",
    titleEn: "English Sijo Division",
  },
];

type Props = {
  value: ContestWinnerAnnouncement;
  busy: boolean;
  onChange: (next: ContestWinnerAnnouncement) => void;
  onSubmit: (event: FormEvent) => void;
};

export function AdminWinnersForm({ value, busy, onChange, onSubmit }: Props) {
  function updateDivision(
    key: keyof ContestWinnerAnnouncement,
    groups: ContestWinnerGroup[],
  ) {
    onChange({ ...value, [key]: groups });
  }

  function updateGroup(
    key: keyof ContestWinnerAnnouncement,
    index: number,
    group: ContestWinnerGroup,
  ) {
    const groups = value[key].map((item, i) => (i === index ? group : item));
    updateDivision(key, groups);
  }

  function updateWinner(
    key: keyof ContestWinnerAnnouncement,
    groupIndex: number,
    winnerIndex: number,
    partial: Partial<ContestWinner>,
  ) {
    const group = value[key][groupIndex];
    updateGroup(key, groupIndex, {
      ...group,
      winners: group.winners.map((winner, i) =>
        i === winnerIndex ? { ...winner, ...partial } : winner,
      ),
    });
  }

  function moveWinner(
    key: keyof ContestWinnerAnnouncement,
    groupIndex: number,
    winnerIndex: number,
    direction: -1 | 1,
  ) {
    const group = value[key][groupIndex];
    const nextIndex = winnerIndex + direction;
    if (nextIndex < 0 || nextIndex >= group.winners.length) return;
    const winners = [...group.winners];
    const [moved] = winners.splice(winnerIndex, 1);
    winners.splice(nextIndex, 0, moved);
    updateGroup(key, groupIndex, { ...group, winners });
  }

  return (
    <form className="compose-form admin-winners-form" onSubmit={onSubmit}>
      {DIVISIONS.map((division) => (
        <fieldset key={division.key} className="admin-winner-division">
          <legend>
            {division.title}
            <small>{division.titleEn}</small>
          </legend>
          {value[division.key].map((group, groupIndex) => (
            <div key={group.id} className="admin-winner-group">
              <div className="admin-winner-card__grid">
                <label>
                  상 이름 (한글)
                  <input
                    value={group.labelKo}
                    placeholder="예: 본상 (Main Prize)"
                    onChange={(e) =>
                      updateGroup(division.key, groupIndex, {
                        ...group,
                        labelKo: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  상 이름 (영문)
                  <input
                    value={group.labelEn}
                    placeholder="예: Main Prize"
                    onChange={(e) =>
                      updateGroup(division.key, groupIndex, {
                        ...group,
                        labelEn: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              {group.winners.map((winner, winnerIndex) => (
                <div
                  key={`${group.id}-${winnerIndex}`}
                  className="admin-winner-card"
                >
                  <div className="admin-winner-card__grid">
                    <label>
                      부문 (한글)
                      <input
                        value={winner.genreKo}
                        placeholder="예: 시 부문"
                        onChange={(e) =>
                          updateWinner(division.key, groupIndex, winnerIndex, {
                            genreKo: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      부문 (영문)
                      <input
                        value={winner.genreEn}
                        placeholder="예: Poetry"
                        onChange={(e) =>
                          updateWinner(division.key, groupIndex, winnerIndex, {
                            genreEn: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      이름 (한글)
                      <input
                        value={winner.nameKo}
                        placeholder="예: 김부연 (Booyeon Kim)"
                        onChange={(e) =>
                          updateWinner(division.key, groupIndex, winnerIndex, {
                            nameKo: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      이름 (영문)
                      <input
                        value={winner.nameEn}
                        placeholder="예: Booyeon Kim"
                        onChange={(e) =>
                          updateWinner(division.key, groupIndex, winnerIndex, {
                            nameEn: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      작품 제목 (한글)
                      <input
                        value={winner.titleKo}
                        placeholder="예: 눈의 말"
                        onChange={(e) =>
                          updateWinner(division.key, groupIndex, winnerIndex, {
                            titleKo: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      작품 제목 (영문)
                      <input
                        value={winner.titleEn}
                        placeholder="예: Nun-ui Mal"
                        onChange={(e) =>
                          updateWinner(division.key, groupIndex, winnerIndex, {
                            titleEn: e.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                  <div className="admin-winner-card__actions">
                    <button
                      type="button"
                      className="text-action"
                      disabled={busy || winnerIndex === 0}
                      onClick={() =>
                        moveWinner(division.key, groupIndex, winnerIndex, -1)
                      }
                    >
                      위로
                    </button>
                    <button
                      type="button"
                      className="text-action"
                      disabled={busy || winnerIndex === group.winners.length - 1}
                      onClick={() =>
                        moveWinner(division.key, groupIndex, winnerIndex, 1)
                      }
                    >
                      아래로
                    </button>
                    <button
                      type="button"
                      className="admin-member-row__remove"
                      disabled={busy}
                      onClick={() =>
                        updateGroup(division.key, groupIndex, {
                          ...group,
                          winners: group.winners.filter(
                            (_, i) => i !== winnerIndex,
                          ),
                        })
                      }
                    >
                      이 수상자 삭제
                    </button>
                  </div>
                </div>
              ))}

              <div className="admin-winner-card__actions">
                <button
                  type="button"
                  className="cta cta--ghost"
                  disabled={busy}
                  onClick={() =>
                    updateGroup(division.key, groupIndex, {
                      ...group,
                      winners: [...group.winners, emptyWinner()],
                    })
                  }
                >
                  수상자 추가
                </button>
                <button
                  type="button"
                  className="admin-member-row__remove"
                  disabled={busy}
                  onClick={() =>
                    updateDivision(
                      division.key,
                      value[division.key].filter((_, i) => i !== groupIndex),
                    )
                  }
                >
                  이 상 구분 삭제
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="cta cta--ghost"
            disabled={busy}
            onClick={() =>
              updateDivision(division.key, [
                ...value[division.key],
                emptyWinnerGroup(),
              ])
            }
          >
            상 구분 추가
          </button>
        </fieldset>
      ))}
      <div className="compose-form__actions">
        <button type="submit" className="cta cta--primary" disabled={busy}>
          {busy ? "저장 중…" : "수상자 명단 저장"}
        </button>
      </div>
    </form>
  );
}
