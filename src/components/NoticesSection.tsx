import Link from "next/link";
import { NOTICES } from "@/lib/site";

export function NoticesSection({ heading = "h2" }: { heading?: "h1" | "h2" }) {
  const Title = heading;

  return (
    <section className="notices" aria-labelledby="notices-heading">
      <Title id="notices-heading" className="section-heading">
        공지
        <small>Notices</small>
      </Title>
      <ul className="notice-list">
        {NOTICES.map((notice) => (
          <li key={notice.id}>
            <h3>
              <Link href={notice.href}>{notice.titleKo}</Link>
              <small>{notice.titleEn}</small>
            </h3>
            <p>{notice.bodyKo}</p>
            <p className="en">{notice.bodyEn}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
