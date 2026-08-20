export type ChapterMember = {
  email: string;
  nameKo: string;
  nickname?: string | null;
  nameEn?: string | null;
  approvalStatus: string;
  memberType: string;
  isWriter?: boolean;
  region?: string | null;
  genre?: string | null;
  joinedAt?: string | null;
  duesStatus?: string | null;
  approvedAt?: string | null;
};

export function memberTypeLabelKo(memberType: string | null | undefined): string {
  return memberType === "basic" ? "일반 회원" : "미주지회 회원";
}

/** YYYY-MM-DD for admin lists; null if missing/invalid */
export function formatMemberDate(
  iso: string | null | undefined,
): string | null {
  if (!iso) return null;
  const day = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

export function memberDisplayName(m: ChapterMember): string {
  const nick = m.nickname?.trim() ?? "";
  if (nick) return nick;
  const name = m.nameKo?.trim() ?? "";
  if (name) return name;
  return m.email;
}

export function authorKeyFromEmail(email: string): string {
  return `member:${email.trim().toLowerCase()}`;
}

/** 게시글·댓글이 로그인한 회원 본인 것인지 */
export function isOwnAuthoredContent(
  memberEmail: string | null | undefined,
  content: { authorKey?: string | null; authorEmail?: string | null },
): boolean {
  if (!memberEmail?.trim()) return false;
  const email = memberEmail.trim().toLowerCase();
  const myKey = authorKeyFromEmail(email);
  if ((content.authorKey ?? "").trim() === myKey) return true;
  return (content.authorEmail ?? "").trim().toLowerCase() === email;
}

export function isApproved(m: ChapterMember | null): boolean {
  return m?.approvalStatus === "approved";
}

/** Chapter members may create/edit posts (matches app canWrite). */
export function canWritePosts(m: ChapterMember | null): boolean {
  if (!m || !isApproved(m)) return false;
  const type = m.memberType || "chapter";
  return type === "chapter";
}

/** Approved members (chapter or basic) may comment. */
export function canComment(m: ChapterMember | null): boolean {
  return isApproved(m);
}

export const ADMIN_EMAILS = new Set([
  "sunjin1872@gmail.com",
  "wakusachapter@gmail.com",
]);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}
