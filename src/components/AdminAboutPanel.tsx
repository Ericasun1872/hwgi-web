"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  emptyMember,
  getAboutDraftClient,
  saveAboutDraft,
  type AboutDraft,
  type OrgChartDraft,
} from "@/lib/admin-about";
import { isAdminEmail } from "@/lib/member";
import type { OrgRole } from "@/lib/types";

type SectionKey = Exclude<keyof OrgChartDraft, "chapterPresident">;

export function AdminAboutPanel({
  embedded = false,
  onChanged,
  sections = "all",
  defaultTab = "greeting",
}: {
  embedded?: boolean;
  onChanged?: () => void;
  /** all = tabs, greeting/org = that section only */
  sections?: "all" | "greeting" | "org";
  defaultTab?: "greeting" | "org";
} = {}) {
  const { user, member, loading: authLoading } = useAuth();
  const isAdmin = isAdminEmail(user?.email ?? member?.email);

  const [draft, setDraft] = useState<AboutDraft | null>(null);
  const [tab, setTab] = useState<"greeting" | "org">(
    sections === "org" ? "org" : sections === "greeting" ? "greeting" : defaultTab,
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDraft(await getAboutDraftClient());
    } catch {
      setError("소개 내용을 불러오지 못했습니다.");
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

  if (!user) {
    if (embedded) return null;
    return (
      <div className="admin-gate">
        <p>운영진·회장 계정으로 로그인해 주세요.</p>
        <Link href="/login?next=/admin/about" className="cta cta--primary">
          로그인
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    if (embedded) return null;
    return (
      <div className="admin-gate">
        <p>소개 관리는 운영진·회장만 이용할 수 있습니다.</p>
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
      const savingOrg = tab === "org";
      const saveBoth = sections === "all";
      await saveAboutDraft(draft, {
        includeGreeting: saveBoth || !savingOrg,
        includeOrg: saveBoth || savingOrg,
      });
      setNotice(
        saveBoth
          ? "저장했습니다. 소개 페이지에 반영됩니다."
          : savingOrg
            ? "조직도를 저장했습니다. 아래 목록에 반영됩니다."
            : "인사말씀을 저장했습니다.",
      );
      await reload();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function patchGreeting(partial: Partial<AboutDraft["greeting"]>) {
    if (!draft) return;
    setDraft({ ...draft, greeting: { ...draft.greeting, ...partial } });
  }

  function setPresident(role: OrgRole) {
    if (!draft) return;
    setDraft({
      ...draft,
      orgChart: { ...draft.orgChart, chapterPresident: role },
    });
  }

  function setSection(key: SectionKey, roles: OrgRole[]) {
    if (!draft) return;
    setDraft({
      ...draft,
      orgChart: { ...draft.orgChart, [key]: roles },
    });
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
          <Link href="/about" className="cta cta--gold">
            소개 페이지 보기
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

      {sections === "all" ? (
        <div className="policy-tabs" role="tablist" aria-label="편집 영역">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "greeting"}
            className={`policy-tabs__btn${tab === "greeting" ? " is-active" : ""}`}
            onClick={() => setTab("greeting")}
          >
            인사말씀
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "org"}
            className={`policy-tabs__btn${tab === "org" ? " is-active" : ""}`}
            onClick={() => setTab("org")}
          >
            조직도
          </button>
        </div>
      ) : null}

      {loading || !draft ? (
        <p className="empty-state">불러오는 중…</p>
      ) : (
        <form className="compose-form admin-content-form" onSubmit={onSave}>
          {tab === "greeting" ? (
            <>
              <p className="admin-section__lead">
                회장 인사말 날짜·본문(한·영)을 수정합니다.
              </p>
              <label>
                날짜 (한글)
                <input
                  value={draft.greeting.dateLabelKo}
                  onChange={(e) =>
                    patchGreeting({ dateLabelKo: e.target.value })
                  }
                />
              </label>
              <label>
                날짜 (영문)
                <input
                  value={draft.greeting.dateLabelEn}
                  onChange={(e) =>
                    patchGreeting({ dateLabelEn: e.target.value })
                  }
                />
              </label>
              <label>
                인사말씀 (한글)
                <textarea
                  rows={14}
                  value={draft.greeting.bodyKo}
                  onChange={(e) => patchGreeting({ bodyKo: e.target.value })}
                />
              </label>
              <label>
                인사말씀 (영문)
                <textarea
                  rows={12}
                  value={draft.greeting.bodyEn}
                  onChange={(e) => patchGreeting({ bodyEn: e.target.value })}
                />
              </label>
            </>
          ) : (
            <>
              <p className="admin-section__lead">
                분야(지회장·임원·사무국·위원회·문학 분과)별로 직책·담당자
                이름(한글·영문)을 수정한 뒤 아래 「조직도 저장」을 눌러 주세요.
                「공석 / Vacant」로 두면 공석으로 표시됩니다.
              </p>
              <OrgRoleEditor
                label="지회장"
                role={draft.orgChart.chapterPresident}
                onChange={setPresident}
              />
              <OrgSectionEditor
                title="임원"
                roles={draft.orgChart.executiveBoard}
                onChange={(roles) => setSection("executiveBoard", roles)}
              />
              <OrgSectionEditor
                title="사무국"
                roles={draft.orgChart.secretariat}
                onChange={(roles) => setSection("secretariat", roles)}
              />
              <OrgSectionEditor
                title="위원회"
                roles={draft.orgChart.committees}
                onChange={(roles) => setSection("committees", roles)}
              />
              <OrgSectionEditor
                title="문학 분과"
                roles={draft.orgChart.genreDivisions}
                onChange={(roles) => setSection("genreDivisions", roles)}
              />
            </>
          )}

          <div className="compose-form__actions">
            <button type="submit" className="cta cta--primary" disabled={busy}>
              {busy
                ? "저장 중…"
                : tab === "org"
                  ? "조직도 저장"
                  : "인사말씀 저장"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function OrgSectionEditor({
  title,
  roles,
  onChange,
}: {
  title: string;
  roles: OrgRole[];
  onChange: (roles: OrgRole[]) => void;
}) {
  return (
    <section className="admin-org-section">
      <h3>{title}</h3>
      {roles.map((role, index) => (
        <OrgRoleEditor
          key={`${role.roleKo}-${index}`}
          label={role.roleKo || `직책 ${index + 1}`}
          role={role}
          onChange={(next) => {
            const list = [...roles];
            list[index] = next;
            onChange(list);
          }}
          onRemoveRole={
            roles.length > 1
              ? () => onChange(roles.filter((_, i) => i !== index))
              : undefined
          }
        />
      ))}
      <button
        type="button"
        className="cta cta--ghost"
        onClick={() =>
          onChange([
            ...roles,
            {
              roleKo: "새 직책",
              roleEn: "New Role",
              members: [emptyMember()],
            },
          ])
        }
      >
        직책 추가
      </button>
    </section>
  );
}

function OrgRoleEditor({
  label,
  role,
  onChange,
  onRemoveRole,
}: {
  label: string;
  role: OrgRole;
  onChange: (role: OrgRole) => void;
  onRemoveRole?: () => void;
}) {
  return (
    <fieldset className="admin-org-role">
      <legend>{label}</legend>
      <label>
        직책 (한글)
        <input
          value={role.roleKo}
          onChange={(e) => onChange({ ...role, roleKo: e.target.value })}
        />
      </label>
      <label>
        직책 (영문)
        <input
          value={role.roleEn}
          onChange={(e) => onChange({ ...role, roleEn: e.target.value })}
        />
      </label>
      {role.members.map((member, index) => (
        <div key={index} className="admin-org-member">
          <label>
            이름 (한글)
            <input
              value={member.nameKo}
              onChange={(e) => {
                const members = role.members.map((m, i) =>
                  i === index ? { ...m, nameKo: e.target.value } : m,
                );
                onChange({ ...role, members });
              }}
            />
          </label>
          <label>
            이름 (영문)
            <input
              value={member.nameEn}
              onChange={(e) => {
                const members = role.members.map((m, i) =>
                  i === index ? { ...m, nameEn: e.target.value } : m,
                );
                onChange({ ...role, members });
              }}
            />
          </label>
          <button
            type="button"
            className="admin-member-row__remove"
            onClick={() =>
              onChange({
                ...role,
                members:
                  role.members.length > 1
                    ? role.members.filter((_, i) => i !== index)
                    : [emptyMember()],
              })
            }
          >
            이름 삭제
          </button>
        </div>
      ))}
      <div className="compose-form__actions">
        <button
          type="button"
          className="cta cta--ghost"
          onClick={() =>
            onChange({ ...role, members: [...role.members, emptyMember()] })
          }
        >
          담당자 추가
        </button>
        {onRemoveRole ? (
          <button
            type="button"
            className="admin-member-row__remove"
            onClick={onRemoveRole}
          >
            직책 삭제
          </button>
        ) : null}
      </div>
    </fieldset>
  );
}
