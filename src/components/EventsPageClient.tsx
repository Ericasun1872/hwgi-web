"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminEventsPanel } from "@/components/AdminEventsPanel";
import { EventCard } from "@/components/EventCard";
import { useAuth } from "@/components/AuthProvider";
import { listChapterEventsClient } from "@/lib/admin-content";
import type { ChapterEvent } from "@/lib/types";

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

      {events.length === 0 ? (
        <p className="empty-state">등록된 행사가 없습니다.</p>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </>
  );
}
