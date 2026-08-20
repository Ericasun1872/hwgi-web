import type { Metadata } from "next";
import { EventsAdminLink } from "@/components/ContestAdminLink";
import { EventsPageClient } from "@/components/EventsPageClient";
import { PolicyLinks } from "@/components/PolicyLinks";
import { getChapterEvents } from "@/lib/firestore";
import { buildMetadata } from "@/lib/site";
import type { ChapterEvent } from "@/lib/types";

export const metadata: Metadata = buildMetadata({
  title: "행사",
  description:
    "한국작가회의 미주지회 행사·정기 모임 안내. Chapter events and gatherings.",
  path: "/events",
});

export const revalidate = 30;

const FALLBACK_EVENTS: ChapterEvent[] = [
  {
    id: "event_seed_monthly",
    titleKo: "정기 문학 모임",
    titleEn: "Monthly Literary Gathering",
    dateLabel: "매월 셋째 토요일 / 3rd Saturday monthly",
    locationKo: "시애틀 지역 (장소 추후 공지)",
    locationEn: "Seattle area (venue TBA)",
    bodyKo:
      "회원 작품 낭독·디카시 공유·자유 토론. 비회원 관람은 사전 문의해 주세요.",
    bodyEn:
      "Member readings, dica-poetry sharing, and open discussion. Guests welcome by inquiry.",
  },
  {
    id: "event_seed_workshop",
    titleKo: "봄맞이 디카시 워크숍",
    titleEn: "Spring Dica-Poetry Workshop",
    dateLabel: "2026년 6월 (일정 확정 중)",
    locationKo: "온라인 + 현장 병행 예정",
    locationEn: "Hybrid (online + in person, TBA)",
    bodyKo:
      "사진과 시 한 편을 함께 만드는 실습. 참가 신청은 운영진에게 연락해 주세요.",
    bodyEn:
      "Hands-on session pairing photos with short poems. Contact the chapter to register.",
  },
];

export default async function EventsPage() {
  const remote = await getChapterEvents();
  const events =
    remote.length > 0
      ? remote.filter((e) => e.id !== "event_contest_2026")
      : FALLBACK_EVENTS;

  return (
    <div className="page">
      <header className="page-header">
        <h1>행사 안내</h1>
        <p>
          정기 모임 · 워크숍 · 지회 소식
          <span className="en">Gatherings, workshops &amp; chapter news</span>
        </p>
        <EventsAdminLink />
        <PolicyLinks />
      </header>

      <EventsPageClient initialEvents={events} />
    </div>
  );
}
