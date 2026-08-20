import type { ReactNode } from "react";

const URL_RE = /(https?:\/\/[^\s<>"']+)/gi;

export function extractFirstUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  if (!match) return null;
  return match[0].replace(/[),.\]]+$/g, "");
}

export function isBareUrl(text: string | null | undefined): boolean {
  if (!text) return false;
  return /^https?:\/\/\S+$/i.test(text.trim());
}

export function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Split text into plain runs and clickable absolute URLs. */
export function linkifyNodes(text: string): ReactNode[] {
  if (!text) return [];
  const parts = text.split(URL_RE);
  return parts.map((part, index) => {
    if (/^https?:\/\//i.test(part)) {
      const href = part.replace(/[),.\]]+$/g, "");
      return (
        <a
          key={`url-${index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          {part}
        </a>
      );
    }
    return <span key={`t-${index}`}>{part}</span>;
  });
}
