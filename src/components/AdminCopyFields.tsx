"use client";

import { emptyCopyBlock } from "@/lib/contest-winners";
import type { ContestAnnouncementCopy, ContestCopyBlock } from "@/lib/types";

type BlockKey = "before" | "after";

type Props = {
  value: ContestAnnouncementCopy;
  onChange: (next: ContestAnnouncementCopy) => void;
};

export function AdminCopyFields({ value, onChange }: Props) {
  function patch(partial: Partial<ContestAnnouncementCopy>) {
    onChange({ ...value, ...partial });
  }

  function updateBlocks(key: BlockKey, blocks: ContestCopyBlock[]) {
    patch({ [key]: blocks });
  }

  function updateBlock(
    key: BlockKey,
    index: number,
    partial: Partial<ContestCopyBlock>,
  ) {
    updateBlocks(
      key,
      value[key].map((block, i) =>
        i === index ? { ...block, ...partial } : block,
      ),
    );
  }

  function moveBlock(key: BlockKey, index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    const blocks = [...value[key]];
    if (nextIndex < 0 || nextIndex >= blocks.length) return;
    const [moved] = blocks.splice(index, 1);
    if (!moved) return;
    blocks.splice(nextIndex, 0, moved);
    updateBlocks(key, blocks);
  }

  return (
    <div className="admin-copy-fields">
      <div className="admin-winner-card__grid">
        <label>
          발표 제목 (한글)
          <input
            value={value.headingKo}
            onChange={(e) => patch({ headingKo: e.target.value })}
          />
        </label>
        <label>
          발표 제목 (영문)
          <input
            value={value.headingEn}
            onChange={(e) => patch({ headingEn: e.target.value })}
          />
        </label>
      </div>
      <BlockList
        title="수상자 명단 앞 문단"
        blocks={value.before}
        onUpdate={(index, partial) => updateBlock("before", index, partial)}
        onMove={(index, direction) => moveBlock("before", index, direction)}
        onRemove={(index) =>
          updateBlocks(
            "before",
            value.before.filter((_, i) => i !== index),
          )
        }
        onAdd={() => updateBlocks("before", [...value.before, emptyCopyBlock()])}
      />
      <div className="admin-winner-card__grid">
        <label>
          한국어 부문 제목
          <input
            value={value.koreanDivisionKo}
            onChange={(e) => patch({ koreanDivisionKo: e.target.value })}
          />
        </label>
        <label>
          한국어 부문 제목 (영문)
          <input
            value={value.koreanDivisionEn}
            onChange={(e) => patch({ koreanDivisionEn: e.target.value })}
          />
        </label>
        <label>
          영어시조 부문 제목
          <input
            value={value.sijoDivisionKo}
            onChange={(e) => patch({ sijoDivisionKo: e.target.value })}
          />
        </label>
        <label>
          영어시조 부문 제목 (영문)
          <input
            value={value.sijoDivisionEn}
            onChange={(e) => patch({ sijoDivisionEn: e.target.value })}
          />
        </label>
      </div>
      <BlockList
        title="수상자 명단 뒤 문단"
        blocks={value.after}
        onUpdate={(index, partial) => updateBlock("after", index, partial)}
        onMove={(index, direction) => moveBlock("after", index, direction)}
        onRemove={(index) =>
          updateBlocks(
            "after",
            value.after.filter((_, i) => i !== index),
          )
        }
        onAdd={() => updateBlocks("after", [...value.after, emptyCopyBlock()])}
      />
    </div>
  );
}

function BlockList({
  title,
  blocks,
  onUpdate,
  onMove,
  onRemove,
  onAdd,
}: {
  title: string;
  blocks: ContestCopyBlock[];
  onUpdate: (index: number, partial: Partial<ContestCopyBlock>) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <fieldset className="admin-winner-division">
      <legend>{title}</legend>
      {blocks.map((block, index) => (
        <div key={block.id} className="admin-winner-card">
          <label>
            한글
            <textarea
              rows={block.heading ? 2 : 5}
              value={block.ko}
              onChange={(e) => onUpdate(index, { ko: e.target.value })}
            />
          </label>
          <label>
            영문
            <textarea
              rows={block.heading ? 2 : 5}
              value={block.en}
              onChange={(e) => onUpdate(index, { en: e.target.value })}
            />
          </label>
          <div className="admin-winner-card__actions">
            <label className="compose-form__check">
              <input
                type="checkbox"
                checked={Boolean(block.heading)}
                onChange={(e) => onUpdate(index, { heading: e.target.checked })}
              />
              제목으로 표시
            </label>
            <button
              type="button"
              className="text-action"
              disabled={index === 0}
              onClick={() => onMove(index, -1)}
            >
              위로
            </button>
            <button
              type="button"
              className="text-action"
              disabled={index === blocks.length - 1}
              onClick={() => onMove(index, 1)}
            >
              아래로
            </button>
            <button
              type="button"
              className="admin-member-row__remove"
              onClick={() => onRemove(index)}
            >
              문단 삭제
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="cta cta--ghost" onClick={onAdd}>
        문단 추가
      </button>
    </fieldset>
  );
}
