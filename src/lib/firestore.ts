import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type {
  BoardComment,
  BoardKind,
  BoardPost,
  ChapterContent,
  ChapterEvent,
  ContestUpdate,
  OrgRole,
} from "./types";

function tsToIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    return (value as Timestamp).toDate().toISOString();
  }
  return null;
}

function asOrgRole(raw: unknown): OrgRole | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const members = Array.isArray(r.members)
    ? r.members.map((m) => {
        const mm = (m ?? {}) as Record<string, unknown>;
        const nameKo = String(mm.nameKo ?? "");
        const rawEn = String(mm.nameEn ?? "");
        const preferred = preferredOrgNameEn(nameKo, rawEn);
        return {
          nameKo,
          nameEn: preferred ?? rawEn,
        };
      })
    : [];
  return {
    roleKo: String(r.roleKo ?? ""),
    roleEn: String(r.roleEn ?? ""),
    members,
    highlight: Boolean(r.highlight),
  };
}

function asOrgRoles(raw: unknown): OrgRole[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(asOrgRole).filter((r): r is OrgRole => r !== null);
}

const VACANT = { nameKo: "공석", nameEn: "Vacant" } as const;
const SONG_SUKJA = { nameKo: "송숙자", nameEn: "Song Suk-Cha" } as const;
/** 고문 직책에 최소로 유지할 공석 칸 수 (기존 임명자 외에 추가). */
const ADVISOR_MIN_VACANT_SLOTS = 2;

function isAdvisorRole(role: OrgRole): boolean {
  return (
    role.roleKo.includes("고문") ||
    role.roleEn.toLowerCase().includes("advisor")
  );
}

function isVacantMember(m: { nameKo: string }): boolean {
  return !m.nameKo.trim() || m.nameKo.trim() === "공석";
}

/** Ensure 고문 has at least two vacant name slots for later appointments. */
export function ensureAdvisorVacancies(roles: OrgRole[]): OrgRole[] {
  let found = false;
  const next = roles.map((role) => {
    if (!isAdvisorRole(role)) return role;
    found = true;
    const vacantCount = role.members.filter(isVacantMember).length;
    const need = Math.max(0, ADVISOR_MIN_VACANT_SLOTS - vacantCount);
    if (need === 0) return role;
    return {
      ...role,
      members: [
        ...role.members,
        ...Array.from({ length: need }, () => ({ ...VACANT })),
      ],
    };
  });
  if (found) return next;
  return [
    ...next,
    {
      roleKo: "고문",
      roleEn: "Advisor",
      members: [
        { ...VACANT },
        { ...VACANT },
      ],
    },
  ];
}

/**
 * 표시용 최소 교정만. null이면 저장된 영문을 그대로 씀.
 * 운영진이 입력한 표기(대소문자, 괄호 별칭 등)는 절대 덮어쓰지 않음.
 * 김명주 등 기본값 맵으로 저장값을 바꾸던 동작은 제거함.
 */
export function preferredOrgNameEn(
  nameKo: string,
  currentEn?: string | null,
): string | null {
  const key = nameKo.trim();
  const en = (currentEn ?? "").trim();

  // 송숙자: 잘못된 Suk-ja / Sook-ja 만 Song Suk-Cha 로 교정
  if (key === "송숙자") {
    if (!en) return "Song Suk-Cha";
    if (/suk-?ja\b/i.test(en) || /sook-?ja\b/i.test(en)) return "Song Suk-Cha";
  }

  return null;
}

/** Keep committee roster in sync with app policy. */
function normalizeCommittees(roles: OrgRole[]): OrgRole[] {
  const isTranslation = (role: OrgRole) =>
    role.roleKo.includes("번역") ||
    role.roleEn.toLowerCase().includes("translation");
  const isEnglishSijo = (role: OrgRole) =>
    role.roleKo.includes("영어시조") ||
    (role.roleEn.toLowerCase().includes("english") &&
      role.roleEn.toLowerCase().includes("sijo"));

  let next = roles.map((role) => {
    if (isTranslation(role)) {
      return {
        ...role,
        roleKo: "한국문학 번역위원회",
        roleEn: "Korean Literature Translation Committee",
        members: [{ ...VACANT }],
      };
    }
    if (isEnglishSijo(role)) {
      const existing =
        role.members.find((m) => m.nameKo.trim() === SONG_SUKJA.nameKo) ??
        role.members.find((m) => !isVacantMember(m)) ??
        null;
      const rawEn = existing?.nameEn?.trim() ?? "";
      const nameEn =
        preferredOrgNameEn(SONG_SUKJA.nameKo, rawEn) ??
        (rawEn || SONG_SUKJA.nameEn);
      return {
        ...role,
        roleKo: "영어시조 위원회",
        roleEn: "English Sijo Committee",
        members: [{ nameKo: SONG_SUKJA.nameKo, nameEn }],
      };
    }
    return role;
  });

  if (!next.some(isTranslation)) {
    next = [
      ...next,
      {
        roleKo: "한국문학 번역위원회",
        roleEn: "Korean Literature Translation Committee",
        members: [{ ...VACANT }],
      },
    ];
  }

  if (!next.some(isEnglishSijo)) {
    next = [
      ...next,
      {
        roleKo: "영어시조 위원회",
        roleEn: "English Sijo Committee",
        members: [{ ...SONG_SUKJA }],
      },
    ];
  }

  return next;
}

export async function getChapterContent(): Promise<ChapterContent> {
  try {
    const snap = await getDoc(doc(getDb(), "chapter_content", "main"));
    if (!snap.exists()) {
      return { greeting: null, orgChart: null };
    }
    const data = snap.data();
    const greetingRaw = data.greeting as Record<string, unknown> | undefined;
    const orgRaw = data.orgChart as Record<string, unknown> | undefined;

    return {
      greeting: greetingRaw
        ? {
            dateLabelKo: String(greetingRaw.dateLabelKo ?? ""),
            dateLabelEn: String(greetingRaw.dateLabelEn ?? ""),
            bodyKo: String(greetingRaw.bodyKo ?? ""),
            bodyEn: String(greetingRaw.bodyEn ?? "").replaceAll(
              "Kim Myeong-ju",
              "Kim Myung-joo",
            ),
          }
        : null,
      orgChart: orgRaw
        ? {
            chapterPresident: asOrgRole(orgRaw.chapterPresident),
            executiveBoard: ensureAdvisorVacancies(
              asOrgRoles(orgRaw.executiveBoard),
            ),
            secretariat: asOrgRoles(orgRaw.secretariat),
            committees: normalizeCommittees(asOrgRoles(orgRaw.committees)),
            genreDivisions: asOrgRoles(orgRaw.genreDivisions),
          }
        : null,
    };
  } catch {
    return { greeting: null, orgChart: null };
  }
}

export async function getChapterEvents(): Promise<ChapterEvent[]> {
  try {
    const snap = await getDocs(collection(getDb(), "chapter_events"));
    const events: ChapterEvent[] = [];
    for (const d of snap.docs) {
      const data = d.data();
      events.push({
        id: d.id,
        titleKo: String(data.titleKo ?? ""),
        titleEn: String(data.titleEn ?? ""),
        dateLabel: String(data.dateLabel ?? ""),
        locationKo: String(data.locationKo ?? ""),
        locationEn: String(data.locationEn ?? ""),
        bodyKo: String(data.bodyKo ?? ""),
        bodyEn: String(data.bodyEn ?? ""),
      });
    }
    events.sort((a, b) => {
      const aSeed = a.id.startsWith("event_seed_");
      const bSeed = b.id.startsWith("event_seed_");
      if (aSeed !== bSeed) return aSeed ? 1 : -1;
      return b.id.localeCompare(a.id);
    });
    return events;
  } catch {
    return [];
  }
}

export async function getContestEvent(): Promise<ChapterEvent | null> {
  try {
    const snap = await getDoc(doc(getDb(), "chapter_events", "event_contest_2026"));
    if (!snap.exists()) return null;
    const data = snap.data();
    const prizesRaw = data.prizes;
    const prizes = Array.isArray(prizesRaw)
      ? prizesRaw
          .map((p) => {
            const row = (p ?? {}) as Record<string, unknown>;
            return {
              place: String(row.place ?? ""),
              amount: String(row.amount ?? ""),
            };
          })
          .filter((p) => p.place || p.amount)
      : undefined;
    return {
      id: snap.id,
      titleKo: String(data.titleKo ?? ""),
      titleEn: String(data.titleEn ?? ""),
      dateLabel: String(data.dateLabel ?? ""),
      locationKo: String(data.locationKo ?? ""),
      locationEn: String(data.locationEn ?? ""),
      bodyKo: String(data.bodyKo ?? ""),
      bodyEn: String(data.bodyEn ?? ""),
      detailUrl: String(data.detailUrl ?? "").trim() || null,
      prizes,
    };
  } catch {
    return null;
  }
}

export async function getContestUpdates(): Promise<ContestUpdate[]> {
  try {
    const q = query(
      collection(getDb(), "contest_updates"),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapContestUpdate(d.id, d.data()));
  } catch {
    try {
      const snap = await getDocs(collection(getDb(), "contest_updates"));
      const items = snap.docs.map((d) => mapContestUpdate(d.id, d.data()));
      items.sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      );
      return items;
    } catch {
      return [];
    }
  }
}

function mapContestUpdate(
  id: string,
  data: Record<string, unknown>,
): ContestUpdate {
  return {
    id,
    title: String(data.title ?? ""),
    body: String(data.body ?? ""),
    imageBytesBase64: (data.imageBytesBase64 as string | undefined) ?? null,
    authorName: String(data.authorName ?? ""),
    authorEmail: (data.authorEmail as string | undefined) ?? null,
    createdAt: tsToIso(data.createdAt),
  };
}

function mapPost(
  id: string,
  data: Record<string, unknown>,
): BoardPost | null {
  try {
    return {
      id,
      kind: String(data.kind ?? data.boardType ?? ""),
      authorKey: String(data.authorKey ?? ""),
      authorName: String(data.authorName ?? ""),
      title: String(data.title ?? ""),
      body: String(data.body ?? ""),
      authorEmail: (data.authorEmail as string | undefined) ?? null,
      imageAsset: (data.imageAsset as string | undefined) ?? null,
      imageBytesBase64: (data.imageBytesBase64 as string | undefined) ?? null,
      hasBakedText: Boolean(data.hasBakedText),
      boardType: (data.boardType as string | undefined) ?? undefined,
      createdAt: tsToIso(data.createdAt),
    };
  } catch {
    return null;
  }
}

export async function getPostsByKind(kind: BoardKind): Promise<BoardPost[]> {
  try {
    const q = query(
      collection(getDb(), "board_posts"),
      where("kind", "==", kind),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => mapPost(d.id, d.data()))
      .filter((p): p is BoardPost => p !== null);
  } catch {
    // Fallback without composite index / orderBy
    try {
      const q = query(
        collection(getDb(), "board_posts"),
        where("kind", "==", kind),
      );
      const snap = await getDocs(q);
      const posts = snap.docs
        .map((d) => mapPost(d.id, d.data()))
        .filter((p): p is BoardPost => p !== null);
      posts.sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      );
      return posts;
    } catch {
      return [];
    }
  }
}

export async function getPost(
  kind: BoardKind,
  id: string,
): Promise<BoardPost | null> {
  try {
    const snap = await getDoc(doc(getDb(), "board_posts", id));
    if (!snap.exists()) return null;
    const post = mapPost(snap.id, snap.data());
    if (!post) return null;
    if (post.kind && post.kind !== kind) return null;
    return post;
  } catch {
    return null;
  }
}

export async function getCommentsForPost(
  postId: string,
): Promise<BoardComment[]> {
  try {
    const q = query(
      collection(getDb(), "board_comments"),
      where("postId", "==", postId),
    );
    const snap = await getDocs(q);
    const comments: BoardComment[] = [];
    for (const d of snap.docs) {
      const data = d.data();
      const createdAt = tsToIso(data.createdAt);
      comments.push({
        id: d.id,
        postId: String(data.postId ?? postId),
        authorKey: String(data.authorKey ?? ""),
        authorName: String(data.authorName ?? ""),
        body: String(data.body ?? ""),
        createdAtLabel: String(data.createdAtLabel ?? ""),
        authorEmail: (data.authorEmail as string | undefined) ?? null,
        createdAt,
        kind: (data.kind as string | undefined) ?? null,
      });
    }
    comments.sort((a, b) =>
      (a.createdAt ?? "").localeCompare(b.createdAt ?? ""),
    );
    return comments;
  } catch {
    return [];
  }
}
