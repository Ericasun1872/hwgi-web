"use client";

type Props = {
  label?: string;
};

/** 브라우저 인쇄 대화상자 → PDF로 저장 */
export function EbookPrintButton({ label = "PDF로 저장 · 인쇄" }: Props) {
  return (
    <button
      type="button"
      className="cta cta--gold ebook-print-btn"
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}
