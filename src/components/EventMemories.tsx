import { EVENT_MEMORIES } from "@/lib/event-memories";

export function EventMemories() {
  if (EVENT_MEMORIES.length === 0) return null;

  return (
    <section className="event-memories" aria-labelledby="event-memories">
      <h2 id="event-memories" className="section-heading">
        지난 행사 사진 · 후기
        <small>Photos &amp; notes</small>
      </h2>
      <div className="event-list">
        {EVENT_MEMORIES.map((memory) => (
          <article key={memory.id} className="event-card">
            <h3>
              {memory.titleKo}
              <small>{memory.titleEn}</small>
            </h3>
            {memory.photos.length > 0 ? (
              <ul className="event-memory-photos">
                {memory.photos.map((photo) => (
                  <li key={photo.src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.src} alt={`${photo.altKo} / ${photo.altEn}`} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="event-card__meta">
                사진은 준비되면 이 자리에 올립니다.
                <em>Photos will appear here when they are ready.</em>
              </p>
            )}
            <p className="event-card__body">{memory.reviewKo}</p>
            <p className="event-card__body-en">{memory.reviewEn}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
