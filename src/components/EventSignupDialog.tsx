"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FormEvent, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { getDb } from "@/lib/firebase";
import { CONTACT } from "@/lib/site";

const NOTICE_TO = ["sunjin1872@gmail.com", "wakusachapter@gmail.com"];

type Props = {
  eventTitleKo: string;
  eventTitleEn: string;
  eventDate: string;
};

export function EventSignupDialog({
  eventTitleKo,
  eventTitleEn,
  eventDate,
}: Props) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<"sent" | "mail" | null>(null);
  const [mailHref, setMailHref] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  function close() {
    if (busy) return;
    setOpen(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const party = String(data.get("party") ?? "1").trim();
    const note = String(data.get("note") ?? "").trim();
    const subject = `[행사 신청] ${eventTitleKo}`;
    const text = [
      "한국작가회의 미주지회 행사 참가 신청이 접수되었습니다.",
      "",
      `행사: ${eventTitleKo}`,
      eventTitleEn ? `Event: ${eventTitleEn}` : "",
      eventDate ? `일정: ${eventDate}` : "",
      `이름: ${name}`,
      `이메일: ${email}`,
      `전화: ${phone || "—"}`,
      `인원: ${party}`,
      note ? `메모: ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setBusy(true);
    try {
      await addDoc(collection(getDb(), "mail"), {
        to: NOTICE_TO,
        message: { subject, text },
        createdAt: serverTimestamp(),
      });
      setDone("sent");
    } catch {
      setMailHref(gmailComposeUrl(subject, text));
      setDone("mail");
    } finally {
      setBusy(false);
    }
  }

  const dialog = open ? (
    <div className="signup-dialog" role="presentation">
      <button
        type="button"
        className="signup-dialog__backdrop"
        aria-label="신청 창 닫기"
        onClick={close}
      />
      <div
        className="signup-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button type="button" className="signup-dialog__close" onClick={close} aria-label="닫기">
          ×
        </button>
        <p className="signup-dialog__eyebrow">행사 신청 · Registration</p>
        <h2 id={titleId}>
          {eventTitleKo}
          {eventTitleEn ? <small>{eventTitleEn}</small> : null}
        </h2>
        {eventDate ? <p className="signup-dialog__date">{eventDate}</p> : null}

        {done === "sent" ? (
          <p className="signup-dialog__result">
            신청이 접수되었습니다. 운영진에게 전달했습니다.
            <span className="en">Your registration was sent to the chapter.</span>
          </p>
        ) : (
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
              전화번호 · Phone
              <input name="phone" type="tel" autoComplete="tel" />
            </label>
            <label>
              참가 인원 · People
              <input name="party" type="number" min={1} max={20} defaultValue={1} required />
            </label>
            <label>
              메모 · Note
              <textarea name="note" rows={3} />
            </label>
            {error ? <p className="signup-dialog__error">{error}</p> : null}
            {done === "mail" ? (
              <p className="signup-dialog__result">
                신청 내용을 확인했습니다. 아래 버튼을 누르면 이 내용이 적힌 메일 창이 열리고, 보내기를 누르면 접수됩니다.
                <span className="en">
                  Press the button below, then send the email to finish your registration.
                </span>
              </p>
            ) : null}
            <div className="signup-dialog__actions">
              {done === "mail" && mailHref ? (
                <a className="cta cta--primary" href={mailHref} target="_blank" rel="noopener noreferrer">
                  신청 메일 열기
                </a>
              ) : (
                <button type="submit" className="cta cta--primary" disabled={busy}>
                  {busy ? "보내는 중…" : "신청하기"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className="cta cta--primary event-card__apply"
        onClick={() => {
          setDone(null);
          setError("");
          setMailHref("");
          setOpen(true);
        }}
      >
        신청하기
      </button>
      {mounted && dialog ? createPortal(dialog, document.body) : null}
    </>
  );
}

function gmailComposeUrl(subject: string, body: string) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: CONTACT.email,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
