import type { Metadata } from "next";
import { AboutAdminLink } from "@/components/ContestAdminLink";
import { AboutPageClient } from "@/components/AboutPageClient";
import { PolicyLinks } from "@/components/PolicyLinks";
import { getChapterContent } from "@/lib/firestore";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "소개",
  description:
    "한국작가회의 미주지회 회장 인사와 조직도. About the Writers Association of Korea USA Chapter.",
  path: "/about",
});

export const revalidate = 60;

const FALLBACK_GREETING = {
  dateLabelKo: "2026년 5월 28일",
  dateLabelEn: "May 28, 2026",
  bodyKo: `안녕하세요

한국작가회의 미주지회 방문을 환영합니다.

소리조차 자유가 되던 날들도 있었습니다.
문학을 사람을 통해 바라보지 않고, 생각을 통한
옳고 그름으로 판단하려는 시선들..

작은 목소리 들으려고 합니다.
소외된 몸짓 보려고 합니다.

저희들의 걸음이 서툴더라도
지켜 봐주고 응원하는 시선을 느끼며
좀 더 힘이 들어가는 발자국을 만들어
가려고 합니다.

마음이 담긴 비판은 감사히 받을 것이고,
언제고 후원의 마음은 또 감사함으로
인사합니다.

사람이 쓰는 글 모임이 되고자 합니다.

김 명주 드림`,
  bodyEn: `Hello,

Welcome to the Writers Association of Korea USA Chapter.

There were days when even a voice could be free.
There are gazes that would judge literature not through people,
but through thought—through right and wrong…

We try to listen for small voices.
We try to see gestures that have been left out.

Though our steps may be awkward,
we mean to go on—feeling your watchful, encouraging eyes—
and to leave footprints that carry a little more strength.

We will receive criticism offered with heart as gratitude;
and whenever you offer support, we will answer with thanks.

We wish to be a gathering of writing that remains human.

Sincerely,
Kim Myung-joo`,
};

export default async function AboutPage() {
  const content = await getChapterContent();
  const greeting = content.greeting ?? FALLBACK_GREETING;
  const org = content.orgChart;

  return (
    <div className="page">
      <header className="page-header">
        <h1>소개</h1>
        <p>
          회장 인사 · 조직
          <span className="en">Greeting &amp; Organization</span>
        </p>
        <PolicyLinks />
        <AboutAdminLink />
      </header>

      <AboutPageClient initialGreeting={greeting} initialOrg={org} />
    </div>
  );
}
