import type { BoardKind, BoardPost, ChapterEvent } from "@/lib/types";
import { formatBoardBody } from "@/lib/format-body";
import {
  CONTACT,
  SITE_NAME_EN,
  SITE_NAME_KO,
  SITE_TAGLINE_KO,
  SITE_URL,
  boardMeta,
} from "@/lib/site";

/** 본문 첫 문장(또는 앞부분)으로 메타 설명 생성 */
export function excerptFromBody(
  kind: string,
  body: string,
  maxLen = 150,
): string {
  const text = formatBoardBody(kind, body).replace(/\s+/g, " ").trim();
  if (!text) return "";

  const sentenceSplit = text.split(/(?<=[.!?。！？])\s+/);
  let sentence = (sentenceSplit[0] || text).trim();
  if (sentence.length < 12 && sentenceSplit[1]) {
    sentence = `${sentence} ${sentenceSplit[1]}`.trim();
  }
  if (sentence.length <= maxLen) return sentence;
  return `${sentence.slice(0, maxLen - 1).trimEnd()}…`;
}

export function postMetaDescription(post: BoardPost): string {
  const fromBody = excerptFromBody(String(post.kind), post.body);
  if (fromBody) return fromBody;
  const genre = boardMeta(String(post.kind))?.labelKo ?? "작품";
  return `${post.authorName} — ${genre} · ${SITE_NAME_KO}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME_KO,
    alternateName: SITE_NAME_EN,
    url: SITE_URL,
    email: CONTACT.email,
    description: SITE_TAGLINE_KO,
    areaServed: "US",
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT.email,
      contactType: "customer service",
      availableLanguage: ["Korean", "English"],
    },
  };
}

function creativeWorkType(kind: string): string {
  switch (kind) {
    case "poetry":
    case "dica":
    case "korean_sijo":
    case "english_sijo":
      return "Poem";
    case "essay":
      return "Article";
    default:
      return "CreativeWork";
  }
}

export function creativeWorkJsonLd(post: BoardPost, kind: BoardKind) {
  const url = `${SITE_URL}/boards/${kind}/${post.id}`;
  const genre = boardMeta(kind);
  return {
    "@context": "https://schema.org",
    "@type": creativeWorkType(kind),
    name: post.title || "(제목 없음)",
    headline: post.title || undefined,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    text: excerptFromBody(kind, post.body, 280) || undefined,
    description: postMetaDescription(post),
    inLanguage: kind === "english_sijo" ? "en" : "ko",
    url,
    datePublished: post.createdAt || undefined,
    genre: genre?.labelEn || genre?.labelKo,
    isPartOf: {
      "@type": "CollectionPage",
      name: `${SITE_NAME_KO} ${genre?.labelKo ?? ""} 게시판`.trim(),
      url: `${SITE_URL}/boards/${kind}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME_KO,
      url: SITE_URL,
    },
  };
}

export function eventJsonLd(event: ChapterEvent) {
  const description = [event.dateLabel, event.bodyKo || event.bodyEn]
    .filter(Boolean)
    .join(" — ")
    .slice(0, 300);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.titleKo || event.titleEn,
    alternateName: event.titleEn || undefined,
    description: description || undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.locationKo || event.locationEn || SITE_NAME_KO,
      address: event.locationKo || event.locationEn || undefined,
    },
    organizer: {
      "@type": "Organization",
      name: SITE_NAME_KO,
      url: SITE_URL,
      email: CONTACT.email,
    },
    url: `${SITE_URL}/events`,
  };
}

export function eventsListJsonLd(events: ChapterEvent[]) {
  return events.map(eventJsonLd);
}
