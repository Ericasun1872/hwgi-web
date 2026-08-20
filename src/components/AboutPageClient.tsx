"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminAboutPanel } from "@/components/AdminAboutPanel";
import { useAuth } from "@/components/AuthProvider";
import { OrgSection } from "@/components/OrgSection";
import { getAboutDraftClient, type AboutDraft } from "@/lib/admin-about";
import type { OrgRole } from "@/lib/types";

export type AboutGreetingView = {
  dateLabelKo: string;
  dateLabelEn: string;
  bodyKo: string;
  bodyEn: string;
};

export type AboutOrgView = {
  chapterPresident: OrgRole | null;
  executiveBoard: OrgRole[];
  secretariat: OrgRole[];
  committees: OrgRole[];
  genreDivisions: OrgRole[];
};

type Props = {
  initialGreeting: AboutGreetingView;
  initialOrg: AboutOrgView | null;
};

function draftToViews(draft: AboutDraft): {
  greeting: AboutGreetingView;
  org: AboutOrgView;
} {
  return {
    greeting: { ...draft.greeting },
    org: {
      chapterPresident: draft.orgChart.chapterPresident,
      executiveBoard: draft.orgChart.executiveBoard,
      secretariat: draft.orgChart.secretariat,
      committees: draft.orgChart.committees,
      genreDivisions: draft.orgChart.genreDivisions,
    },
  };
}

export function AboutPageClient({ initialGreeting, initialOrg }: Props) {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState(initialGreeting);
  const [org, setOrg] = useState(initialOrg);
  const [greetingManageOpen, setGreetingManageOpen] = useState(true);
  const [orgManageOpen, setOrgManageOpen] = useState(true);

  useEffect(() => {
    setGreeting(initialGreeting);
    setOrg(initialOrg);
  }, [initialGreeting, initialOrg]);

  async function refreshView() {
    try {
      const draft = await getAboutDraftClient();
      const next = draftToViews(draft);
      setGreeting(next.greeting);
      setOrg(next.org);
    } catch {
      /* keep current */
    }
    router.refresh();
  }

  const president =
    org?.chapterPresident?.members?.find(
      (m) => m.nameKo && m.nameKo !== "공석",
    ) ?? null;

  return (
    <>
      {!authLoading && isAdmin ? (
        <section
          id="about-manage"
          className="events-manage"
          aria-labelledby="about-manage-heading"
        >
          <div className="events-manage__header">
            <h2 id="about-manage-heading">회장 인사말씀 수정·저장</h2>
            <button
              type="button"
              className="cta cta--ghost"
              onClick={() => setGreetingManageOpen((v) => !v)}
            >
              {greetingManageOpen ? "접기" : "열기"}
            </button>
          </div>
          <p className="admin-section__lead">
            운영진·회장만 보입니다. 인사말씀을 수정한 뒤 저장하면 아래 내용에
            바로 반영됩니다.
          </p>
          {greetingManageOpen ? (
            <AdminAboutPanel
              embedded
              sections="greeting"
              onChanged={() => {
                void refreshView();
              }}
            />
          ) : null}
        </section>
      ) : null}

      <section className="greeting-block" aria-labelledby="greeting-heading">
        <div className="greeting-meta">
          <figure className="greeting-photo">
            <Image
              src="/president.png"
              alt={`지회장 ${president?.nameKo || "김명주"}`}
              width={480}
              height={600}
              priority
              className="greeting-photo__img"
            />
          </figure>
          <p className="role">지회장 · Chapter President</p>
          <h2 id="greeting-heading">{president?.nameKo || "김명주"}</h2>
          <p className="name-en">{president?.nameEn || "Kim Myung-Joo (Tom)"}</p>
          <p className="date">
            {greeting.dateLabelKo}
            {greeting.dateLabelEn ? ` · ${greeting.dateLabelEn}` : ""}
          </p>
        </div>
        <div>
          <div className="greeting-body">{greeting.bodyKo}</div>
          {greeting.bodyEn ? (
            <div className="greeting-body-en">{greeting.bodyEn}</div>
          ) : null}
        </div>
      </section>

      {org ? (
        <section aria-labelledby="org-heading">
          <header className="page-header">
            <h1 id="org-heading" style={{ fontSize: "1.75rem" }}>
              미주지회 조직
            </h1>
            <p>
              USA Chapter Organization
              <span className="en">임원 · 사무국 · 위원회 · 분과</span>
            </p>
          </header>

          {!authLoading && isAdmin ? (
            <section
              id="org-manage"
              className="events-manage"
              aria-labelledby="org-manage-heading"
            >
              <div className="events-manage__header">
                <h2 id="org-manage-heading">
                  분야별 한글·영문 이름 수정·저장
                </h2>
                <button
                  type="button"
                  className="cta cta--ghost"
                  onClick={() => setOrgManageOpen((v) => !v)}
                >
                  {orgManageOpen ? "접기" : "열기"}
                </button>
              </div>
              <p className="admin-section__lead">
                지회장 · 임원 · 사무국 · 위원회 · 문학 분과마다 직책·이름(한·영)을
                고친 뒤 「조직도 저장」을 눌러 주세요.
              </p>
              {orgManageOpen ? (
                <AdminAboutPanel
                  embedded
                  sections="org"
                  onChanged={() => {
                    void refreshView();
                  }}
                />
              ) : null}
            </section>
          ) : null}

          {org.chapterPresident ? (
            <OrgSection
              titleKo="지회장"
              titleEn="Chapter President"
              roles={[org.chapterPresident]}
            />
          ) : null}
          <OrgSection
            titleKo="임원"
            titleEn="Executive Board"
            roles={org.executiveBoard}
          />
          <OrgSection
            titleKo="사무국"
            titleEn="Secretariat"
            roles={org.secretariat}
          />
          <OrgSection
            titleKo="위원회"
            titleEn="Committees"
            roles={org.committees}
          />
          <OrgSection
            titleKo="문학 분과"
            titleEn="Genre Divisions"
            roles={org.genreDivisions}
          />
        </section>
      ) : (
        <p className="empty-state">
          조직도 데이터를 불러오는 중입니다. 앱에 동기화된 내용이 여기에
          표시됩니다.
        </p>
      )}
    </>
  );
}
