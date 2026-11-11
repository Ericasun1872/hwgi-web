"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminEventsPanel } from "@/components/AdminEventsPanel";
import { EventCard } from "@/components/EventCard";
import { EventMemories } from "@/components/EventMemories";
import { useAuth } from "@/components/AuthProvider";
import { listChapterEventsClient } from "@/lib/admin-content";
import { isPastEvent } from "@/lib/event-status";
import type { ChapterEvent } from "@/lib/types";

function EventGroups({ events }: { events: ChapterEvent[] }) {
  const upcoming = events.filter((event) => !isPastEvent(event.dateLabel));
  const past = events.filter((event) => isPastEvent(event.dateLabel));

  return (
    <>
      <section aria-labelledby="upcoming-events">
        <h2 id="upcoming-events" className="section-heading">
          예정 행사
          <small>Upcoming</small>
        </h2>
        {upcoming.length === 0 ? (
          <p className="empty-state">예정된 행사가 없습니다.</p>
        ) : (
          <div className="event-list">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 ? (
        <section aria-labelledby="past-events">
          <h2 id="past-events" className="section-heading">
            지난 행사
            <small>Past events</small>
          </h2>
          <div className="event-list">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

type Props = {
  initialEvents: ChapterEvent[];
};

export function EventsPageClient({ initialEvents }: Props) {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [manageOpen, setManageOpen] = useState(true);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  async function refreshList() {
    try {
      const list = await listChapterEventsClient();
      setEvents(list.filter((e) => e.id !== "event_contest_2026"));
    } catch {
      /* keep current */
    }
    router.refresh();
  }

  return (
    <>
      {!authLoading && isAdmin ? (
        <section
          id="events-manage"
          className="events-manage"
          aria-labelledby="events-manage-heading"
        >
          <div className="events-manage__header">
            <h2 id="events-manage-heading">행사 바로 수정·저장</h2>
            <button
              type="button"
              className="cta cta--ghost"
              onClick={() => setManageOpen((v) => !v)}
            >
              {manageOpen ? "접기" : "열기"}
            </button>
          </div>
          <p className="admin-section__lead">
            운영진·회장만 보입니다. 여기서 행사를 추가·수정·삭제한 뒤 저장하면
            바로 아래에 반영됩니다.
          </p>
          {manageOpen ? (
            <AdminEventsPanel
              embedded
              onChanged={() => {
                void refreshList();
              }}
            />
          ) : null}
        </section>
      ) : null}

      <EventGroups events={events} />
      <EventMemories />
    </>
  );
}
