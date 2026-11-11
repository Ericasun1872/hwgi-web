import { isPastEvent } from "@/lib/event-status";
import { CONTACT, EVENT_SIGNUP_URL } from "@/lib/site";
import type { ChapterEvent } from "@/lib/types";

function publicCopy(text: string) {
  return text
    .replace(/참가 신청은 운영진에게 연락해 주세요\.?\s*/g, "")
    .replace(/Contact the chapter to register\.?\s*/g, "")
    .trim();
}

function signupHref() {
  const configured = EVENT_SIGNUP_URL.trim();
  if (configured) return configured;
  const subject = encodeURIComponent("행사 신청 / Event registration");
  return `mailto:${CONTACT.email}?subject=${subject}`;
}

function meetingIsLink(value: string) {
  return /^https?:\/\//i.test(value);
}

export function EventCard({ event }: { event: ChapterEvent }) {
  const past = isPastEvent(event.dateLabel);
  const time = event.timeLabel?.trim();
  const meeting = event.meetingUrl?.trim() ?? "";
  const bodyKo = publicCopy(event.bodyKo);
  const bodyEn = publicCopy(event.bodyEn);
  const href = signupHref();
  const external = /^https?:\/\//i.test(href);

  return (
    <article className="event-card">
      <p className="event-card__date">
        {event.dateLabel}
        {past ? <span className="event-card__status">종료 · Ended</span> : null}
      </p>
      <h2>
        {event.titleKo}
        <small>{event.titleEn}</small>
      </h2>
      <p className="event-card__loc">
        {event.locationKo}
        <span>{event.locationEn}</span>
      </p>
      <p className="event-card__meta">
        <span>시간 · Time</span>
        {time || "추후 공지"}
        {time ? null : <em>To be announced</em>}
      </p>
      <p className="event-card__meta">
        <span>장소 · 줌 · Place / Zoom</span>
        {meeting && meetingIsLink(meeting) ? (
          <a href={meeting} target="_blank" rel="noopener noreferrer">
            {meeting}
          </a>
        ) : (
          meeting || "추후 공지"
        )}
        {meeting ? null : <em>To be announced</em>}
      </p>
      {bodyKo ? <p className="event-card__body">{bodyKo}</p> : null}
      {bodyEn ? <p className="event-card__body-en">{bodyEn}</p> : null}
      {past ? null : (
        <a
          className="cta cta--primary event-card__apply"
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          신청하기
        </a>
      )}
    </article>
  );
}
