import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { ReportReason } from "@/lib/types";

export type { ReportReason };

export const REPORT_REASONS: { id: ReportReason; labelKo: string }[] = [
  { id: "inappropriate", labelKo: "부적절한 콘텐츠" },
  { id: "spam", labelKo: "스팸" },
];

export function reportReasonLabelKo(reason: ReportReason): string {
  return REPORT_REASONS.find((r) => r.id === reason)?.labelKo ?? reason;
}

const REPORTS_KEY = "hwgi_web_reports_v1";

function blockedKey(viewerEmail: string) {
  return `hwgi_web_blocked_${viewerEmail.trim().toLowerCase()}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getBlockedAuthorKeys(viewerEmail: string): string[] {
  return readJson<string[]>(blockedKey(viewerEmail), []);
}

export function isAuthorBlocked(
  viewerEmail: string,
  authorKey: string,
): boolean {
  return getBlockedAuthorKeys(viewerEmail).includes(authorKey);
}

export function blockAuthor(viewerEmail: string, authorKey: string): void {
  const key = authorKey.trim();
  if (!key) return;
  const list = getBlockedAuthorKeys(viewerEmail);
  if (list.includes(key)) return;
  writeJson(blockedKey(viewerEmail), [...list, key]);
}

export async function reportComment(input: {
  reporterEmail: string;
  commentId: string;
  postId: string;
  authorKey: string;
  authorName: string;
  reason: ReportReason;
  boardType: string;
  commentBody?: string;
}): Promise<void> {
  const reporterEmail = input.reporterEmail.trim().toLowerCase();
  const id = `report_web_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await setDoc(doc(getDb(), "board_reports", id), {
    id,
    reporterEmail,
    contentType: "comment",
    contentId: input.commentId,
    postId: input.postId,
    authorKey: input.authorKey,
    authorName: input.authorName,
    reason: input.reason,
    boardType: input.boardType,
    commentBody: input.commentBody?.trim().slice(0, 300) ?? "",
    source: "web",
    status: "open",
    reportedAt: serverTimestamp(),
  });

  // Legacy local log (optional backup on this device)
  type LegacyReport = {
    id: string;
    reporterEmail: string;
    contentType: "comment";
    contentId: string;
    authorKey: string;
    authorName: string;
    reason: ReportReason;
    boardType: string;
    reportedAt: string;
  };
  const reports = readJson<LegacyReport[]>(REPORTS_KEY, []);
  reports.push({
    id,
    reporterEmail,
    contentType: "comment",
    contentId: input.commentId,
    authorKey: input.authorKey,
    authorName: input.authorName,
    reason: input.reason,
    boardType: input.boardType,
    reportedAt: new Date().toISOString(),
  });
  writeJson(REPORTS_KEY, reports);
}
