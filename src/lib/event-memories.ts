export type EventMemory = {
  id: string;
  titleKo: string;
  titleEn: string;
  reviewKo: string;
  reviewEn: string;
  photos: { src: string; altKo: string; altEn: string }[];
};

/** 지난 행사 사진·후기. photos.src 가 있을 때만 이미지가 보입니다. */
export const EVENT_MEMORIES: EventMemory[] = [
  {
    id: "dica-workshop-2026-06",
    titleKo: "봄맞이 디카시 워크숍",
    titleEn: "Spring Dica-Poetry Workshop",
    reviewKo:
      "2026년 6월에 사진과 짧은 시를 함께 읽고 쓰는 디카시 워크숍을 열었습니다.",
    reviewEn:
      "In June 2026 the chapter held a workshop for reading and writing a photograph with a short poem.",
    photos: [],
  },
];
