export type BoardKind =
  | "poetry"
  | "english_sijo"
  | "korean_sijo"
  | "dica"
  | "essay"
  | "dansang"
  | "unpack_bundle";

export type BoardPost = {
  id: string;
  kind: BoardKind | string;
  authorKey: string;
  authorName: string;
  title: string;
  body: string;
  authorEmail?: string | null;
  imageAsset?: string | null;
  imageBytesBase64?: string | null;
  hasBakedText?: boolean;
  boardType?: string;
  createdAt?: string | null;
};

export type BoardComment = {
  id: string;
  postId: string;
  authorKey: string;
  authorName: string;
  body: string;
  createdAtLabel?: string;
  authorEmail?: string | null;
  createdAt?: string | null;
  kind?: string | null;
};

export type ReportReason = "inappropriate" | "spam";

export type BoardReport = {
  id: string;
  reporterEmail: string;
  contentType: string;
  contentId: string;
  postId?: string | null;
  authorKey: string;
  authorName: string;
  reason: ReportReason;
  boardType: string;
  reportedAt?: string | null;
  source: "web" | "app";
  status: "open" | "dismissed";
  commentBody?: string | null;
};

export type ChapterEvent = {
  id: string;
  titleKo: string;
  titleEn: string;
  dateLabel: string;
  locationKo: string;
  locationEn: string;
  bodyKo: string;
  bodyEn: string;
  /** 공모전 상세 요강 등 외부 안내 페이지 */
  detailUrl?: string | null;
  prizes?: ContestPrize[];
};

export type ContestPrize = {
  place: string;
  amount: string;
};

export type ContestUpdate = {
  id: string;
  title: string;
  body: string;
  imageBytesBase64?: string | null;
  authorName: string;
  authorEmail?: string | null;
  createdAt?: string | null;
};

export type OrgMember = {
  nameKo: string;
  nameEn: string;
};

export type OrgRole = {
  roleKo: string;
  roleEn: string;
  members: OrgMember[];
  highlight?: boolean;
};

export type ChapterContent = {
  greeting: {
    dateLabelKo: string;
    dateLabelEn: string;
    bodyKo: string;
    bodyEn: string;
  } | null;
  orgChart: {
    chapterPresident: OrgRole | null;
    executiveBoard: OrgRole[];
    secretariat: OrgRole[];
    committees: OrgRole[];
    genreDivisions: OrgRole[];
  } | null;
};
