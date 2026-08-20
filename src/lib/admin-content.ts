import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { extractFirstUrl, isBareUrl } from "@/lib/linkify";
import { CONTEST_FALLBACK } from "@/lib/site";
import type { ChapterEvent, ContestPrize, ContestUpdate } from "@/lib/types";

export const CONTEST_EVENT_ID = "event_contest_2026";

export type EventInput = {
  titleKo: string;
  titleEn: string;
  dateLabel: string;
  locationKo: string;
  locationEn: string;
  bodyKo: string;
  bodyEn: string;
};

export type ContestInput = EventInput & {
  prizes: ContestPrize[];
  detailUrl: string;
};

function mapEvent(id: string, data: Record<string, unknown>): ChapterEvent {
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
    id,
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
}

export async function listChapterEventsClient(): Promise<ChapterEvent[]> {
  const snap = await getDocs(collection(getDb(), "chapter_events"));
  const events = snap.docs.map((d) => mapEvent(d.id, d.data()));
  events.sort((a, b) => {
    const aSeed = a.id.startsWith("event_seed_");
    const bSeed = b.id.startsWith("event_seed_");
    if (aSeed !== bSeed) return aSeed ? 1 : -1;
    return b.id.localeCompare(a.id);
  });
  return events;
}

export async function getContestEventClient(): Promise<ChapterEvent | null> {
  const snap = await getDoc(doc(getDb(), "chapter_events", CONTEST_EVENT_ID));
  if (!snap.exists()) return null;
  return mapEvent(snap.id, snap.data());
}

export async function saveChapterEvent(
  id: string | null,
  input: EventInput,
): Promise<string> {
  const eventId = id?.trim() || `event_web_${Date.now()}`;
  await setDoc(
    doc(getDb(), "chapter_events", eventId),
    {
      id: eventId,
      titleKo: input.titleKo.trim(),
      titleEn: input.titleEn.trim(),
      dateLabel: input.dateLabel.trim(),
      locationKo: input.locationKo.trim(),
      locationEn: input.locationEn.trim(),
      bodyKo: input.bodyKo.trim(),
      bodyEn: input.bodyEn.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return eventId;
}

export async function deleteChapterEvent(id: string): Promise<void> {
  if (id === CONTEST_EVENT_ID) {
    throw new Error("공모전 안내는 공모전 관리에서 수정해 주세요.");
  }
  await deleteDoc(doc(getDb(), "chapter_events", id));
}

export async function saveContestEvent(input: ContestInput): Promise<void> {
  const prizes = input.prizes
    .map((p) => ({
      place: p.place.trim(),
      amount: p.amount.trim(),
    }))
    .filter((p) => p.place || p.amount);

  const detailUrl = input.detailUrl.trim();

  await setDoc(
    doc(getDb(), "chapter_events", CONTEST_EVENT_ID),
    {
      id: CONTEST_EVENT_ID,
      titleKo: input.titleKo.trim(),
      titleEn: input.titleEn.trim(),
      dateLabel: input.dateLabel.trim(),
      locationKo: input.locationKo.trim(),
      locationEn: input.locationEn.trim(),
      bodyKo: input.bodyKo.trim(),
      bodyEn: input.bodyEn.trim(),
      detailUrl: detailUrl || null,
      prizes,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function createContestUpdate(input: {
  title: string;
  body: string;
  authorEmail: string;
  authorName: string;
  imageBytesBase64?: string | null;
}): Promise<string> {
  const id = `contest_update_${Date.now()}`;
  const data: Record<string, unknown> = {
    id,
    title: input.title.trim(),
    body: input.body.trim(),
    authorEmail: input.authorEmail.trim().toLowerCase(),
    authorName: input.authorName.trim(),
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };
  if (input.imageBytesBase64) {
    data.imageBytesBase64 = input.imageBytesBase64;
  }
  await setDoc(doc(getDb(), "contest_updates", id), data, { merge: true });
  return id;
}

export async function deleteContestUpdate(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "contest_updates", id));
}

export function emptyEventInput(): EventInput {
  return {
    titleKo: "",
    titleEn: "",
    dateLabel: "",
    locationKo: "",
    locationEn: "",
    bodyKo: "",
    bodyEn: "",
  };
}

export function eventToInput(event: ChapterEvent): EventInput {
  return {
    titleKo: event.titleKo,
    titleEn: event.titleEn,
    dateLabel: event.dateLabel,
    locationKo: event.locationKo,
    locationEn: event.locationEn,
    bodyKo: event.bodyKo,
    bodyEn: event.bodyEn,
  };
}

export function contestToInput(event: ChapterEvent | null): ContestInput {
  const base = event
    ? eventToInput(event)
    : {
        titleKo: CONTEST_FALLBACK.titleKo,
        titleEn: CONTEST_FALLBACK.titleEn,
        dateLabel: CONTEST_FALLBACK.dateLabel,
        locationKo: CONTEST_FALLBACK.locationKo,
        locationEn: CONTEST_FALLBACK.locationEn,
        bodyKo: CONTEST_FALLBACK.bodyKo,
        bodyEn: CONTEST_FALLBACK.bodyEn,
      };
  const prizes =
    event?.prizes && event.prizes.length > 0
      ? event.prizes
      : CONTEST_FALLBACK.prizes.map((p) => ({ ...p }));
  return {
    ...base,
    prizes,
    detailUrl:
      event?.detailUrl?.trim() ||
      (event && isBareUrl(event.locationKo) ? event.locationKo.trim() : "") ||
      extractFirstUrl(event?.bodyKo) ||
      "",
  };
}

export async function listContestUpdatesClient(): Promise<ContestUpdate[]> {
  try {
    const q = query(
      collection(getDb(), "contest_updates"),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapContestUpdate(d.id, d.data()));
  } catch {
    const snap = await getDocs(collection(getDb(), "contest_updates"));
    const items = snap.docs.map((d) => mapContestUpdate(d.id, d.data()));
    items.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    return items;
  }
}

function mapContestUpdate(
  id: string,
  data: Record<string, unknown>,
): ContestUpdate {
  let createdAt: string | null = null;
  const raw = data.createdAt;
  if (typeof raw === "string") createdAt = raw;
  else if (
    raw &&
    typeof raw === "object" &&
    "toDate" in raw &&
    typeof (raw as Timestamp).toDate === "function"
  ) {
    createdAt = (raw as Timestamp).toDate().toISOString();
  }
  return {
    id,
    title: String(data.title ?? ""),
    body: String(data.body ?? ""),
    imageBytesBase64: (data.imageBytesBase64 as string | undefined) ?? null,
    authorName: String(data.authorName ?? ""),
    authorEmail: (data.authorEmail as string | undefined) ?? null,
    createdAt,
  };
}
