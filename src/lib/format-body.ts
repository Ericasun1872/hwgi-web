import type { BoardKind } from "@/lib/types";

/**
 * 수필 등 산문: 입력기·복사 과정에서 생긴 문장 중간 줄바꿈을 이어 붙입니다.
 * 시·시조 등 의도된 개행은 그대로 둡니다.
 */
export function shouldUnwrapSoftLineBreaks(kind: string): boolean {
  return kind === "essay" || kind === "unpack_bundle";
}

export function normalizeProseBody(body: string): string {
  const text = body.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").trim();
  if (!text) return "";

  return text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const lines = paragraph.split("\n").map((line) => line.trimEnd());
      let joined = "";
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (!joined) {
          joined = line;
          continue;
        }
        joined += joinGap(joined, line) + line;
      }
      return joined.replace(/[ \t]{2,}/g, " ").trim();
    })
    .filter(Boolean)
    .join("\n\n");
}

export function formatBoardBody(kind: string | BoardKind, body: string): string {
  if (!body) return "";
  if (shouldUnwrapSoftLineBreaks(kind)) return normalizeProseBody(body);
  return body.replace(/\r\n/g, "\n");
}

function joinGap(left: string, right: string): string {
  const a = left.slice(-1);
  const b = right.charAt(0);
  if (!a || !b) return "";
  // 한글·일본어·한자끼리는 공백 없이 이음
  if (isCjk(a) && isCjk(b)) return "";
  // 이미 공백/구두점이면 추가 공백 없음
  if (/\s/.test(a) || /\s/.test(b)) return "";
  if (/[([{“‘"']/.test(b) || /[),\]}.!?:;”’"']/.test(a)) return "";
  // 영문·숫자 단어 경계만 공백
  if (/[A-Za-z0-9]/.test(a) && /[A-Za-z0-9]/.test(b)) return " ";
  return "";
}

function isCjk(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return (
    (code >= 0x1100 && code <= 0x11ff) ||
    (code >= 0x3130 && code <= 0x318f) ||
    (code >= 0xac00 && code <= 0xd7a3) ||
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0x3040 && code <= 0x30ff)
  );
}
