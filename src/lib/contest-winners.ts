import type {
  ContestWinner,
  ContestWinnerAnnouncement,
  ContestWinnerGroup,
} from "@/lib/types";

export const DEFAULT_WINNER_ANNOUNCEMENT: ContestWinnerAnnouncement = {
  korean: [
    {
      id: "grand",
      labelKo: "대상 (Grand Prize)",
      labelEn: "Grand Prize",
      winners: [
        {
          genreKo: "시 부문",
          genreEn: "Poetry",
          nameKo: "양안나",
          nameEn: "Anna Yang",
          titleKo: "간장꽃",
          titleEn: "Ganjang-kkot",
        },
      ],
    },
    {
      id: "main",
      labelKo: "본상 (Main Prize)",
      labelEn: "Main Prize",
      winners: [
        {
          genreKo: "시 부문",
          genreEn: "Poetry",
          nameKo: "김부연 (Booyeon Kim)",
          nameEn: "Booyeon Kim",
          titleKo: "눈의 말",
          titleEn: "Nun-ui Mal",
        },
        {
          genreKo: "소설 부문",
          genreEn: "Fiction",
          nameKo: "이제니",
          nameEn: "Jenny Lee",
          titleKo: "도시를 건너는 이방인들",
          titleEn: "Dosi-reul Geonneoneun Ibangindeul",
        },
        {
          genreKo: "수필 부문",
          genreEn: "Essay",
          nameKo: "이지은",
          nameEn: "Jieun Lee",
          titleKo: "부르지 못한 이름",
          titleEn: "Bureuji Mothan Ireum",
        },
      ],
    },
    {
      id: "mention",
      labelKo: "입선 (Honorable Mention)",
      labelEn: "Honorable Mention",
      winners: [
        {
          genreKo: "시 부문",
          genreEn: "Poetry",
          nameKo: "강경",
          nameEn: "Kyung Kang",
          titleKo: "날개 실종 사건",
          titleEn: "Nalgae Siljong Sageon",
        },
        {
          genreKo: "시 부문",
          genreEn: "Poetry",
          nameKo: "조인숙",
          nameEn: "Insook Cho",
          titleKo: "종이 봉투",
          titleEn: "Jongi Bongtu",
        },
        {
          genreKo: "소설 부문",
          genreEn: "Fiction",
          nameKo: "이준호",
          nameEn: "Junho Lee",
          titleKo: "로스트",
          titleEn: "Lost",
        },
        {
          genreKo: "수필 부문",
          genreEn: "Essay",
          nameKo: "장 케일린",
          nameEn: "Caitlyn Jang",
          titleKo: "선을 넘은 시간",
          titleEn: "Seon-eul Neomeun Sigan",
        },
      ],
    },
  ],
  sijo: [
    {
      id: "general",
      labelKo: "일반부 (General Division)",
      labelEn: "General Division",
      winners: [
        {
          genreKo: "수상작",
          genreEn: "Winner",
          nameKo: "강영자",
          nameEn: "Youngja Kang",
          titleKo: "Chuseok (추석)",
          titleEn: "Chuseok",
        },
      ],
    },
    {
      id: "student",
      labelKo: "학생부 (Student Division)",
      labelEn: "Student Division",
      winners: [
        {
          genreKo: "1등",
          genreEn: "1st Place",
          nameKo: "Ayn Chung",
          nameEn: "Ayn Chung",
          titleKo: "switch",
          titleEn: "switch",
        },
        {
          genreKo: "2등",
          genreEn: "2nd Place",
          nameKo: "Cora Harley",
          nameEn: "Cora Harley",
          titleKo: "bonfire",
          titleEn: "bonfire",
        },
        {
          genreKo: "3등",
          genreEn: "3rd Place",
          nameKo: "Hangul Kim",
          nameEn: "Hangul Kim",
          titleKo: "Paper plane",
          titleEn: "Paper plane",
        },
      ],
    },
  ],
};

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function parseGroups(raw: unknown): ContestWinnerGroup[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map((item, index) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const winnersRaw = Array.isArray(row.winners) ? row.winners : [];
    const winners: ContestWinner[] = winnersRaw.map((winner) => {
      const fields = (winner ?? {}) as Record<string, unknown>;
      return {
        genreKo: asText(fields.genreKo),
        genreEn: asText(fields.genreEn),
        nameKo: asText(fields.nameKo),
        nameEn: asText(fields.nameEn),
        titleKo: asText(fields.titleKo),
        titleEn: asText(fields.titleEn),
      };
    });
    return {
      id: asText(row.id) || `group_${index + 1}`,
      labelKo: asText(row.labelKo),
      labelEn: asText(row.labelEn),
      winners,
    };
  });
}

/** Null when the contest document has never stored a winners list. */
export function parseWinnerAnnouncement(
  raw: unknown,
): ContestWinnerAnnouncement | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const korean = parseGroups(data.korean);
  const sijo = parseGroups(data.sijo);
  if (!korean && !sijo) return null;
  return { korean: korean ?? [], sijo: sijo ?? [] };
}

export function cloneWinnerAnnouncement(
  source: ContestWinnerAnnouncement = DEFAULT_WINNER_ANNOUNCEMENT,
): ContestWinnerAnnouncement {
  return {
    korean: source.korean.map(cloneGroup),
    sijo: source.sijo.map(cloneGroup),
  };
}

function cloneGroup(group: ContestWinnerGroup): ContestWinnerGroup {
  return {
    id: group.id,
    labelKo: group.labelKo,
    labelEn: group.labelEn,
    winners: group.winners.map((winner) => ({ ...winner })),
  };
}

export function emptyWinner(): ContestWinner {
  return {
    genreKo: "",
    genreEn: "",
    nameKo: "",
    nameEn: "",
    titleKo: "",
    titleEn: "",
  };
}

export function emptyWinnerGroup(): ContestWinnerGroup {
  return {
    id: `group_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    labelKo: "",
    labelEn: "",
    winners: [emptyWinner()],
  };
}

function winnerHasContent(winner: ContestWinner) {
  return Object.values(winner).some((value) => value.trim());
}

/** Drop blank rows. Keeps a group when it still has a label or a winner. */
export function sanitizeWinnerAnnouncement(
  source: ContestWinnerAnnouncement,
): ContestWinnerAnnouncement {
  const clean = (groups: ContestWinnerGroup[]) =>
    groups
      .map((group) => ({
        id: group.id.trim() || emptyWinnerGroup().id,
        labelKo: group.labelKo.trim(),
        labelEn: group.labelEn.trim(),
        winners: group.winners
          .map((winner) => ({
            genreKo: winner.genreKo.trim(),
            genreEn: winner.genreEn.trim(),
            nameKo: winner.nameKo.trim(),
            nameEn: winner.nameEn.trim(),
            titleKo: winner.titleKo.trim(),
            titleEn: winner.titleEn.trim(),
          }))
          .filter(winnerHasContent),
      }))
      .filter(
        (group) => group.labelKo || group.labelEn || group.winners.length > 0,
      );

  return { korean: clean(source.korean), sijo: clean(source.sijo) };
}
