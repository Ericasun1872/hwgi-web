import type { BoardKind } from "./types";
import type { Metadata } from "next";

export const SITE_NAME_KO = "한국작가회의 미주지회";
export const SITE_NAME_EN = "Writers Association of Korea — USA Chapter";
export const SITE_TAGLINE_KO =
  "사람이 쓰는 글 모임이 되고자 합니다.";
export const SITE_TAGLINE_EN =
  "A gathering of writing that remains human.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://wak-usa.org";

/** Android package: com.hwgi.writerapp */
export const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL?.trim() ||
  "https://play.google.com/store/apps/details?id=com.hwgi.writerapp";

export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL?.trim() || "";

/** Footer contact — email only (no personal phone on public web) */
export const CONTACT = {
  roleKo: "지회장",
  roleEn: "Chapter President",
  nameKo: "김명주",
  nameEn: "Kim Myung-Joo (Tom)",
  email:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "wakusachapter@gmail.com",
} as const;

export const BOARD_KINDS: {
  kind: BoardKind;
  labelKo: string;
  labelEn: string;
  description: string;
}[] = [
  {
    kind: "poetry",
    labelKo: "시",
    labelEn: "Poetry",
    description: "회원 시 작품",
  },
  {
    kind: "dica",
    labelKo: "디카시",
    labelEn: "Dica-Poetry",
    description: "사진과 짧은 시",
  },
  {
    kind: "essay",
    labelKo: "수필",
    labelEn: "Essay",
    description: "수필·산문",
  },
  {
    kind: "korean_sijo",
    labelKo: "시조",
    labelEn: "Korean Sijo",
    description: "한국어 시조",
  },
  {
    kind: "english_sijo",
    labelKo: "영문 시조",
    labelEn: "English Sijo",
    description: "영문 시조 작품",
  },
  {
    kind: "dansang",
    labelKo: "단상",
    labelEn: "Notes",
    description: "짧은 단상",
  },
  {
    kind: "unpack_bundle",
    labelKo: "보따리를 풀다",
    labelEn: "Unpacking the Bundle",
    description: "보따리를 풀다 작품",
  },
];

export function boardMeta(kind: string) {
  return BOARD_KINDS.find((b) => b.kind === kind);
}

export function isBoardKind(value: string): value is BoardKind {
  return BOARD_KINDS.some((b) => b.kind === value);
}

/** Contest page fallback when Firestore event_contest_2026 is missing */
export const CONTEST_FALLBACK = {
  titleKo: "2026 미주지회 문학 공모전",
  titleEn: "2026 USA Chapter Literary Contest",
  dateLabel: "접수 · 심사 일정은 앱·웹 공지를 확인해 주세요",
  locationKo: "온라인 접수 (회원 앱)",
  locationEn: "Online via the member app",
  bodyKo:
    "시·디카시·수필·시조 등 장르별 작품을 모집합니다. 상금과 시상 일정은 지회 공지를 따르며, 작품 제출은 회원 앱에서 진행합니다.",
  bodyEn:
    "We invite poetry, dica-poetry, essays, sijo, and more. Prizes and timeline follow chapter announcements; submit works through the member app.",
  prizes: [
    { place: "대상", amount: "상금 안내 (공지 확인)" },
    { place: "우수상", amount: "장르별 시상" },
    { place: "입선", amount: "작품집·시상식 초대" },
  ],
};

export const NAV_LINKS = [
  { href: "/about", labelKo: "소개", labelEn: "About" },
  { href: "/events", labelKo: "행사", labelEn: "Events" },
  { href: "/contest", labelKo: "공모전", labelEn: "Contest" },
  { href: "/boards", labelKo: "게시판", labelEn: "Boards" },
  { href: "/join", labelKo: "가입", labelEn: "Join" },
] as const;

export function buildMetadata({
  title,
  description,
  path = "/",
}: {
  title?: string;
  description: string;
  path?: string;
}): Metadata {
  const fullTitle = title
    ? `${title} · ${SITE_NAME_KO}`
    : `${SITE_NAME_KO} | ${SITE_NAME_EN}`;
  const url = `${SITE_URL}${path}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    icons: {
      icon: [
        { url: "/favicon.ico?v=20260811", sizes: "any" },
        { url: "/icon.png?v=20260811", type: "image/png", sizes: "512x512" },
      ],
      apple: [
        {
          url: "/apple-icon.png?v=20260811",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME_KO,
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    alternates: { canonical: url },
  };
}

export function formatCommentTime(iso?: string | null, label?: string): string {
  if (label) return label;
  if (!iso) return "";
  const created = new Date(iso);
  if (Number.isNaN(created.getTime())) return "";
  const diff = Date.now() - created.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "방금";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${created.getMonth() + 1}/${created.getDate()}`;
}
