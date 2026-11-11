function pad(value: number) {
  return String(value).padStart(2, "0");
}

function pacificDay(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** 반복 모임은 예정으로 두고, 지난 날짜가 적힌 행사만 종료로 나눕니다. */
export function isPastEvent(dateLabel: string, now = new Date()) {
  const label = dateLabel.trim();
  if (!label) return false;
  if (/매주|매달|매월|정기|언제든지/.test(label)) return false;

  const today = pacificDay(now);

  const ranged = label.match(
    /(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\s*[~～\-–]\s*(\d{1,2})\.\s*(\d{1,2})/,
  );
  if (ranged) {
    const year = Number(ranged[1]);
    const startMonth = Number(ranged[2]);
    const endMonth = Number(ranged[4]);
    const endDay = Number(ranged[5]);
    const endYear = endMonth < startMonth ? year + 1 : year;
    return today > `${endYear}-${pad(endMonth)}-${pad(endDay)}`;
  }

  const full = label.match(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (full) {
    return today > `${full[1]}-${pad(Number(full[2]))}-${pad(Number(full[3]))}`;
  }

  const monthOnly = label.match(/(\d{4})\s*년\s*(\d{1,2})\s*월/);
  if (monthOnly) {
    const year = Number(monthOnly[1]);
    const month = Number(monthOnly[2]);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return today > `${year}-${pad(month)}-${pad(lastDay)}`;
  }

  const dotted = label.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
  if (dotted) {
    return today > `${dotted[1]}-${pad(Number(dotted[2]))}-${pad(Number(dotted[3]))}`;
  }

  return false;
}
