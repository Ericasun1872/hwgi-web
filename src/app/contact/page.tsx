import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { buildMetadata, CONTACT, INQUIRY_FORM_URL } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "문의",
  description: "한국작가회의 미주지회 문의. Contact the USA Chapter.",
  path: "/contact",
});

export default function ContactPage() {
  const external = INQUIRY_FORM_URL.trim();

  return (
    <div className="page">
      <header className="page-header">
        <h1>문의</h1>
        <p>
          지회에 전할 말을 남겨 주세요
          <span className="en">Write to the chapter</span>
        </p>
      </header>
      {external ? (
        <p>
          <a className="cta cta--primary" href={external} target="_blank" rel="noopener noreferrer">
            문의 폼 열기
          </a>
        </p>
      ) : (
        <ContactForm />
      )}
      <p className="phase-note">
        {CONTACT.roleKo} {CONTACT.nameKo}
        <span className="en">
          {CONTACT.roleEn} · {CONTACT.nameEn}
        </span>
      </p>
    </div>
  );
}
