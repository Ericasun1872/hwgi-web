/**
 * 웹·앱에서 더 이상 노출·재업로드하지 않을 게시글/작성자.
 * (시드·과거 샘플이 Firestore에 다시 올라와도 숨김)
 */
export const SUPPRESSED_POST_IDS = new Set(["poetry_4"]);

const SUPPRESSED_AUTHOR_NEEDLES = [
  "마틸다",
  "matilda",
  "김 마틸다",
  "김마틸다",
  "kim matilda",
  "matilda kim",
];

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isSuppressedAuthorName(authorName: string): boolean {
  const name = normalizeLabel(authorName);
  if (!name) return false;
  return SUPPRESSED_AUTHOR_NEEDLES.some((needle) => name.includes(needle));
}

export function isSuppressedPost(input: {
  id?: string | null;
  authorName?: string | null;
}): boolean {
  const id = (input.id ?? "").trim();
  if (id && SUPPRESSED_POST_IDS.has(id)) return true;
  return isSuppressedAuthorName(input.authorName ?? "");
}
