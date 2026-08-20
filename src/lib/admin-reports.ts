import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { BoardReport, ReportReason } from "@/lib/types";

function fieldToIso(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (raw instanceof Timestamp) return raw.toDate().toISOString();
  if (
    raw &&
    typeof raw === "object" &&
    "toDate" in raw &&
    typeof (raw as { toDate: unknown }).toDate === "function"
  ) {
    try {
      return (raw as Timestamp).toDate().toISOString();
    } catch {
      return null;
    }
  }
  return null;
}

function mapReport(id: string, data: Record<string, unknown>): BoardReport {
  return {
    id,
    reporterEmail: String(data.reporterEmail ?? "").toLowerCase(),
    contentType: String(data.contentType ?? "comment"),
    contentId: String(data.contentId ?? ""),
    postId: (data.postId as string | undefined) ?? null,
    authorKey: String(data.authorKey ?? ""),
    authorName: String(data.authorName ?? ""),
    reason: (String(data.reason ?? "inappropriate") as ReportReason),
    boardType: String(data.boardType ?? ""),
    reportedAt: fieldToIso(data.reportedAt),
    source: data.source === "app" ? "app" : "web",
    status: data.status === "dismissed" ? "dismissed" : "open",
    commentBody: (data.commentBody as string | undefined) ?? null,
  };
}

export async function fetchBoardReports(): Promise<BoardReport[]> {
  const q = query(
    collection(getDb(), "board_reports"),
    orderBy("reportedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapReport(d.id, d.data()));
}

export async function dismissBoardReport(id: string): Promise<void> {
  await updateDoc(doc(getDb(), "board_reports", id), {
    status: "dismissed",
    dismissedAt: serverTimestamp(),
  });
}

export async function deleteBoardReport(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "board_reports", id));
}
