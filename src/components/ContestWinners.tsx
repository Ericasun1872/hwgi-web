import Link from "next/link";
import { DEFAULT_WINNER_ANNOUNCEMENT } from "@/lib/contest-winners";
import type {
  ContestWinnerAnnouncement,
  ContestWinnerGroup,
} from "@/lib/types";

function WinnerGroup({ group }: { group: ContestWinnerGroup }) {
  const winners = group.winners.filter(
    (winner) =>
      winner.nameKo ||
      winner.nameEn ||
      winner.titleKo ||
      winner.titleEn,
  );
  if (winners.length === 0 && !group.labelKo && !group.labelEn) return null;
  return (
    <div className="winner-group">
      <h3>
        {group.labelKo}
        <small>{group.labelEn}</small>
      </h3>
      <ul>
        {winners.map((winner) => (
          <li key={`${group.id}-${winner.nameKo}-${winner.titleKo}`}>
            <p>
              {winner.genreKo}: {winner.nameKo} — 「{winner.titleKo}」
            </p>
            <p className="en">
              {winner.genreEn}: {winner.nameEn} — “{winner.titleEn}”
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContestWinners({
  announcement,
}: {
  announcement?: ContestWinnerAnnouncement | null;
}) {
  const list = announcement ?? DEFAULT_WINNER_ANNOUNCEMENT;
  return (
    <section className="contest-winners" aria-labelledby="contest-winners">
      <p className="contest-edit-entry">
        <Link href="/admin/contest" className="cta cta--gold">
          운영진 수상자 명단 수정
        </Link>
        <span>
          회장·운영진 계정으로 로그인하면 이름과 작품 제목을 고칠 수 있습니다.
        </span>
      </p>
      <h2 id="contest-winners">
        제1회 한국작가회의 미주지회 문학공모전 수상자 발표
        <small>Winners of the 1st WAKUSA Literary Contest</small>
      </h2>

      <p className="event-card__body">
        한국작가회의 미주지회(WAKUSA)가 주최한 「제1회 문학공모전」에 깊은
        관심과 소중한 작품을 보내주신 모든 응모자 여러분께 진심으로
        감사드립니다.
      </p>
      <p className="event-card__body-en">
        The Writers Association of Korea USA Chapter (WAKUSA) extends its
        heartfelt gratitude to everyone who submitted their valuable works to
        the 1st Annual WAKUSA Literary Contest.
      </p>

      <p className="event-card__body">
        이번 공모전은 한국 중앙본부 심사위원단의 공정하고 엄정한 심사를 거쳐
        수상작을 선정하였습니다. 당초 대상 1명, 본상 1명, 우수상 2명, 입선
        3명을 선정할 계획이었으나, 각 장르의 우수 작품을 고르게 조명하기 위해
        시·소설·수필 부문별 본상을 각각 선정하는 방식으로 시상 내역을
        조정하였습니다. 또한 함께 진행된 영어시조(English Sijo) 공모전에도
        학생부 54편을 비롯해 많은 작품이 응모하여 차세대와 현지 독자들의
        뜨거운 관심을 확인할 수 있었습니다.
      </p>
      <p className="event-card__body-en">
        Following a rigorous and fair evaluation by the judging panel from the
        Writers Association of Korea headquarters, we are pleased to announce
        this year&apos;s winners. While the original plan was to select one
        Grand Prize, one Main Prize, two Excellence Awards, and three Honorable
        Mentions, the judging committee adjusted the award structure to select
        a Main Prize winner in each genre (Poetry, Fiction, and Essay) in order
        to recognize outstanding works across all categories equally.
        Furthermore, the inaugural English Sijo Contest drew enthusiastic
        participation, including 54 entries in the Student Division.
      </p>

      <p className="event-card__body">
        수상하신 모든 분들께 진심으로 축하의 말씀을 전하며, 영예의 수상자
        명단을 아래와 같이 발표합니다.
      </p>
      <p className="event-card__body-en">
        Warmest congratulations to all the winners!
      </p>

      <h3 className="winner-division">
        1. 한국어 문학 부문
        <small>Korean Literature Division</small>
      </h3>
      {list.korean.map((group) => (
        <WinnerGroup key={group.id} group={group} />
      ))}

      <h3 className="winner-division">
        2. 영어시조(English Sijo) 부문
        <small>English Sijo Division</small>
      </h3>
      {list.sijo.map((group) => (
        <WinnerGroup key={group.id} group={group} />
      ))}

      <h3 className="winner-division">
        심사위원단 총평 요약
        <small>Judges&apos; Remarks</small>
      </h3>
      <p className="event-card__body">
        한국어 문학 부문에서는 각 장르의 문학적 성취와 디아스포라의 섬세한
        시선이 돋보이는 작품들이 고르게 선정되었습니다. 영어시조 부문에서는
        사물을 바라보는 학생들의 날카로운 시선이 돋보였으며, 일반부 수상작
        「Chuseok」은 마지막 연의 아름다운 마무리가 깊은 인상을 남겼습니다.
      </p>
      <p className="event-card__body-en">
        Across the Korean literature categories, the selected works demonstrated
        strong literary craftsmanship and nuanced perspectives. In the English
        Sijo division, the judges praised the student entrants for their sharp,
        observant perspectives on everyday objects, while noting that Youngja
        Kang&apos;s &quot;Chuseok&quot; left a lasting impression with its
        poignant and graceful closing stanza.
      </p>

      <p className="event-card__body">
        향후 일정 안내: 시상식 일정 및 수상작 작품집(E-book) 게재 일정은 추후
        공지사항 및 개별 연락을 통해 안내해 드릴 예정입니다.
      </p>
      <p className="event-card__body-en">
        Upcoming Schedule: Details regarding the awards ceremony and the
        digital anthology (E-book) publication of the winning works will be
        announced separately and sent directly to the winners.
      </p>

      <p className="event-card__body">
        다시 한번 참여해 주신 모든 분께 감사드리며, 앞으로도 미주 한인 문학의
        발전을 위해 많은 성원 부탁드립니다.
      </p>
      <p className="event-card__body-en">
        Thank you once again for your passion and support for Korean-American
        literature.
      </p>
      <p className="event-card__body">
        한국작가회의 미주지회
        <span className="en">
          Writers Association of Korea USA Chapter (WAKUSA)
        </span>
      </p>
    </section>
  );
}
