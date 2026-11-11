"use client";

import { FormEvent } from "react";
import { CONTACT } from "@/lib/site";

export function ContactForm() {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = encodeURIComponent(`[미주지회 문의] ${name}`);
    const body = encodeURIComponent(`${message}\n\n${name}\n${email}`);
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label>
        이름 · Name
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        이메일 · Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        문의 내용 · Message
        <textarea name="message" required rows={6} />
      </label>
      <button type="submit" className="cta cta--primary">
        메일로 보내기
      </button>
      <p className="phase-note">
        보내기를 누르면 메일 앱이 열립니다. 받는 주소는 {CONTACT.email} 입니다.
        <span className="en">
          Submit opens your mail app, addressed to {CONTACT.email}.
        </span>
      </p>
    </form>
  );
}
