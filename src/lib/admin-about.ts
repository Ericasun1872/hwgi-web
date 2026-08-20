import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { ensureAdvisorVacancies, preferredOrgNameEn } from "@/lib/firestore";
import type { ChapterContent, OrgMember, OrgRole } from "@/lib/types";

export type GreetingDraft = {
  dateLabelKo: string;
  dateLabelEn: string;
  bodyKo: string;
  bodyEn: string;
};

export type OrgChartDraft = {
  chapterPresident: OrgRole;
  executiveBoard: OrgRole[];
  secretariat: OrgRole[];
  committees: OrgRole[];
  genreDivisions: OrgRole[];
};

export type AboutDraft = {
  greeting: GreetingDraft;
  orgChart: OrgChartDraft;
};

function asMember(raw: unknown): OrgMember {
  const m = (raw ?? {}) as Record<string, unknown>;
  const nameKo = String(m.nameKo ?? "");
  const rawEn = String(m.nameEn ?? "");
  const preferred = preferredOrgNameEn(nameKo, rawEn);
  return {
    nameKo,
    // 송숙자 등: Firestore에 Suk-ja가 남아 있어도 편집·표시는 Cha로 맞춤
    nameEn: preferred ?? rawEn,
  };
}

function asRole(raw: unknown, fallback?: OrgRole): OrgRole {
  if (!raw || typeof raw !== "object") {
    return (
      fallback ?? {
        roleKo: "",
        roleEn: "",
        members: [{ nameKo: "공석", nameEn: "Vacant" }],
        highlight: false,
      }
    );
  }
  const r = raw as Record<string, unknown>;
  const members = Array.isArray(r.members)
    ? r.members.map(asMember)
    : [{ nameKo: "공석", nameEn: "Vacant" }];
  return {
    roleKo: String(r.roleKo ?? fallback?.roleKo ?? ""),
    roleEn: String(r.roleEn ?? fallback?.roleEn ?? ""),
    members: members.length ? members : [{ nameKo: "공석", nameEn: "Vacant" }],
    highlight: Boolean(r.highlight ?? fallback?.highlight),
  };
}

function asRoles(raw: unknown): OrgRole[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => asRole(r));
}

export const DEFAULT_GREETING: GreetingDraft = {
  dateLabelKo: "2026년 5월 28일",
  dateLabelEn: "May 28, 2026",
  bodyKo: `안녕하세요

한국작가회의 미주지회 방문을 환영합니다.

사람이 쓰는 글 모임이 되고자 합니다.

김 명주 드림`,
  bodyEn: `Hello,

Welcome to the Writers Association of Korea USA Chapter.

We wish to be a gathering of writing that remains human.

Sincerely,
Kim Myung-joo`,
};

export const DEFAULT_ORG_CHART: OrgChartDraft = {
  chapterPresident: {
    roleKo: "지회장",
    roleEn: "Chapter President",
    members: [{ nameKo: "김명주", nameEn: "Kim Myung-Joo (Tom)" }],
    highlight: true,
  },
  executiveBoard: [
    {
      roleKo: "부회장",
      roleEn: "Vice President",
      members: [{ nameKo: "공석", nameEn: "Vacant" }],
    },
    {
      roleKo: "고문",
      roleEn: "Advisor",
      members: [
        { nameKo: "이윤홍", nameEn: "Lee Yun-hong" },
        { nameKo: "공석", nameEn: "Vacant" },
        { nameKo: "공석", nameEn: "Vacant" },
      ],
    },
    {
      roleKo: "감사",
      roleEn: "Auditor",
      members: [
        { nameKo: "정효순", nameEn: "Jung Hyo-soon" },
        { nameKo: "마재영", nameEn: "Ma Jae-young" },
      ],
    },
  ],
  secretariat: [
    {
      roleKo: "사무국장",
      roleEn: "Executive Secretary",
      members: [{ nameKo: "김민정", nameEn: "Kim Min-jeong" }],
    },
    {
      roleKo: "서기",
      roleEn: "Recording Secretary",
      members: [{ nameKo: "배유나", nameEn: "Bae Euna" }],
    },
    {
      roleKo: "회계",
      roleEn: "Treasurer",
      members: [{ nameKo: "장선진", nameEn: "Chang Sun-jin (Erica)" }],
    },
    {
      roleKo: "기획위원",
      roleEn: "Planning Officer",
      members: [{ nameKo: "공석", nameEn: "Vacant" }],
    },
  ],
  committees: [
    {
      roleKo: "학술포럼 위원회",
      roleEn: "Academic Forum Committee",
      members: [{ nameKo: "배유나", nameEn: "Bae Euna" }],
    },
    {
      roleKo: "디아스포라 문학위원회",
      roleEn: "Diaspora Literature Committee",
      members: [{ nameKo: "김종박", nameEn: "Kim Jong-bak" }],
    },
    {
      roleKo: "국제교류 위원회",
      roleEn: "International Exchange Committee",
      members: [{ nameKo: "김용규", nameEn: "Kim Yong-kyu" }],
    },
    {
      roleKo: "한국문학 번역위원회",
      roleEn: "Korean Literature Translation Committee",
      members: [{ nameKo: "공석", nameEn: "Vacant" }],
    },
    {
      roleKo: "영어시조 위원회",
      roleEn: "English Sijo Committee",
      members: [{ nameKo: "송숙자", nameEn: "Song Suk-Cha" }],
    },
  ],
  genreDivisions: [
    {
      roleKo: "시 분과",
      roleEn: "Poetry Division",
      members: [
        { nameKo: "김명주", nameEn: "Kim Myung-Joo (Tom)" },
        { nameKo: "고경호", nameEn: "Ko Gyeong-ho" },
      ],
    },
    {
      roleKo: "소설 분과",
      roleEn: "Fiction Division",
      members: [{ nameKo: "김사라", nameEn: "Kim Sara" }],
    },
    {
      roleKo: "시조 분과",
      roleEn: "Sijo Division",
      members: [{ nameKo: "송숙자", nameEn: "Song Suk-Cha" }],
    },
    {
      roleKo: "수필 분과",
      roleEn: "Essay Division",
      members: [{ nameKo: "우성숙", nameEn: "Woo Seong-sook" }],
    },
    {
      roleKo: "디카시 분과",
      roleEn: "Dica-Poetry Division",
      members: [{ nameKo: "류성현", nameEn: "Ryu Sung-hyun" }],
    },
  ],
};

export async function getAboutDraftClient(): Promise<AboutDraft> {
  try {
    const snap = await getDoc(doc(getDb(), "chapter_content", "main"));
    if (!snap.exists()) {
      return {
        greeting: { ...DEFAULT_GREETING },
        orgChart: structuredClone(DEFAULT_ORG_CHART),
      };
    }
    const data = snap.data();
    const g = (data.greeting ?? {}) as Record<string, unknown>;
    const o = (data.orgChart ?? {}) as Record<string, unknown>;
    return {
      greeting: {
        dateLabelKo: String(g.dateLabelKo ?? DEFAULT_GREETING.dateLabelKo),
        dateLabelEn: String(g.dateLabelEn ?? DEFAULT_GREETING.dateLabelEn),
        bodyKo: String(g.bodyKo ?? DEFAULT_GREETING.bodyKo),
        bodyEn: String(g.bodyEn ?? DEFAULT_GREETING.bodyEn),
      },
      orgChart: {
        chapterPresident: asRole(
          o.chapterPresident,
          DEFAULT_ORG_CHART.chapterPresident,
        ),
        executiveBoard: ensureAdvisorVacancies(
          asRoles(o.executiveBoard).length
            ? asRoles(o.executiveBoard)
            : structuredClone(DEFAULT_ORG_CHART.executiveBoard),
        ),
        secretariat: asRoles(o.secretariat).length
          ? asRoles(o.secretariat)
          : structuredClone(DEFAULT_ORG_CHART.secretariat),
        committees: asRoles(o.committees).length
          ? asRoles(o.committees)
          : structuredClone(DEFAULT_ORG_CHART.committees),
        genreDivisions: asRoles(o.genreDivisions).length
          ? asRoles(o.genreDivisions)
          : structuredClone(DEFAULT_ORG_CHART.genreDivisions),
      },
    };
  } catch {
    return {
      greeting: { ...DEFAULT_GREETING },
      orgChart: structuredClone(DEFAULT_ORG_CHART),
    };
  }
}

function roleToJson(role: OrgRole) {
  return {
    roleKo: role.roleKo.trim(),
    roleEn: role.roleEn.trim(),
    // 운영진 입력을 그대로 저장 (preferred 맵으로 Myung-joo 등 덮어쓰지 않음)
    members: role.members
      .map((m) => ({
        nameKo: m.nameKo.trim(),
        nameEn: m.nameEn.trim(),
      }))
      .filter((m) => m.nameKo || m.nameEn),
    highlight: Boolean(role.highlight),
  };
}

/** Saves greeting and/or orgChart; keeps other chapter_content fields. */
export async function saveAboutDraft(
  draft: AboutDraft,
  options: { includeGreeting?: boolean; includeOrg?: boolean } = {},
): Promise<void> {
  const includeGreeting = options.includeGreeting !== false;
  const includeOrg = options.includeOrg !== false;
  const ref = doc(getDb(), "chapter_content", "main");
  const existing = await getDoc(ref);
  const prev = existing.exists() ? existing.data() : {};
  const executiveBoard = ensureAdvisorVacancies(
    draft.orgChart.executiveBoard,
  ).map(roleToJson);

  const next: Record<string, unknown> = {
    ...prev,
    updatedAt: serverTimestamp(),
  };

  if (includeGreeting) {
    next.greeting = {
      dateLabelKo: draft.greeting.dateLabelKo.trim(),
      dateLabelEn: draft.greeting.dateLabelEn.trim(),
      bodyKo: draft.greeting.bodyKo.trim(),
      bodyEn: draft.greeting.bodyEn.trim(),
    };
  }

  if (includeOrg) {
    next.orgChart = {
      chapterPresident: roleToJson(draft.orgChart.chapterPresident),
      executiveBoard,
      secretariat: draft.orgChart.secretariat.map(roleToJson),
      committees: draft.orgChart.committees.map(roleToJson),
      genreDivisions: draft.orgChart.genreDivisions.map(roleToJson),
    };
  }

  await setDoc(ref, next, { merge: true });
}

export function emptyMember(): OrgMember {
  return { nameKo: "공석", nameEn: "Vacant" };
}

export function contentToAboutDraft(content: ChapterContent): AboutDraft {
  return {
    greeting: content.greeting
      ? { ...content.greeting }
      : { ...DEFAULT_GREETING },
    orgChart: content.orgChart
      ? {
          chapterPresident:
            content.orgChart.chapterPresident ??
            structuredClone(DEFAULT_ORG_CHART.chapterPresident),
          executiveBoard: ensureAdvisorVacancies(
            content.orgChart.executiveBoard.length
              ? content.orgChart.executiveBoard
              : structuredClone(DEFAULT_ORG_CHART.executiveBoard),
          ),
          secretariat: content.orgChart.secretariat.length
            ? content.orgChart.secretariat
            : structuredClone(DEFAULT_ORG_CHART.secretariat),
          committees: content.orgChart.committees.length
            ? content.orgChart.committees
            : structuredClone(DEFAULT_ORG_CHART.committees),
          genreDivisions: content.orgChart.genreDivisions.length
            ? content.orgChart.genreDivisions
            : structuredClone(DEFAULT_ORG_CHART.genreDivisions),
        }
      : structuredClone(DEFAULT_ORG_CHART),
  };
}
