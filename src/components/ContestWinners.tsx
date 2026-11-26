import Link from "next/link";
import {
  DEFAULT_ANNOUNCEMENT_COPY,
  DEFAULT_WINNER_ANNOUNCEMENT,
} from "@/lib/contest-winners";
import type {
  ContestAnnouncementCopy,
  ContestCopyBlock,
  ContestWinnerAnnouncement,
  ContestWinnerGroup,
} from "@/lib/types";

function CopyBlocks({ blocks }: { blocks: ContestCopyBlock[] }) {
  return blocks.map((block) =>
    block.heading ? (
      <h3 key={block.id} className="winner-division">
        {block.ko}
        {block.en ? <small>{block.en}</small> : null}
      </h3>
    ) : (
      <div key={block.id}>
        {block.ko ? <p className="event-card__body contest-copy">{block.ko}</p> : null}
        {block.en ? (
          <p className="event-card__body-en contest-copy">{block.en}</p>
        ) : null}
      </div>
    ),
  );
}

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
  copy,
}: {
  announcement?: ContestWinnerAnnouncement | null;
  copy?: ContestAnnouncementCopy | null;
}) {
  const list = announcement ?? DEFAULT_WINNER_ANNOUNCEMENT;
  const text = copy ?? DEFAULT_ANNOUNCEMENT_COPY;
  return (
    <section className="contest-winners" aria-labelledby="contest-winners">
      <p className="contest-edit-entry">
        <Link href="/admin/contest" className="cta cta--gold">
          운영진 공모전 내용 수정
        </Link>
        <span>
          회장·운영진 계정으로 로그인하면 발표 글과 수상자 이름을 고칠 수
          있습니다.
        </span>
      </p>
      <h2 id="contest-winners">
        {text.headingKo}
        {text.headingEn ? <small>{text.headingEn}</small> : null}
      </h2>

      <CopyBlocks blocks={text.before} />

      <h3 className="winner-division">
        {text.koreanDivisionKo}
        {text.koreanDivisionEn ? <small>{text.koreanDivisionEn}</small> : null}
      </h3>
      {list.korean.map((group) => (
        <WinnerGroup key={group.id} group={group} />
      ))}

      <h3 className="winner-division">
        {text.sijoDivisionKo}
        {text.sijoDivisionEn ? <small>{text.sijoDivisionEn}</small> : null}
      </h3>
      {list.sijo.map((group) => (
        <WinnerGroup key={group.id} group={group} />
      ))}

      <CopyBlocks blocks={text.after} />
    </section>
  );
}
