import type { ChapterEvent } from "@/lib/types";

export function EventCard({ event }: { event: ChapterEvent }) {
  return (
    <article className="event-card">
      <p className="event-card__date">{event.dateLabel}</p>
      <h2>
        {event.titleKo}
        <small>{event.titleEn}</small>
      </h2>
      <p className="event-card__loc">
        {event.locationKo}
        <span>{event.locationEn}</span>
      </p>
      <p className="event-card__body">{event.bodyKo}</p>
      {event.bodyEn ? (
        <p className="event-card__body-en">{event.bodyEn}</p>
      ) : null}
    </article>
  );
}
