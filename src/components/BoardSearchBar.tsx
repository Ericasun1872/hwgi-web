"use client";

import { useState } from "react";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

/** Controlled or uncontrolled title/author search field */
export function BoardSearchBar({
  value,
  onChange,
  placeholder = "제목·작가명 검색… / Search title or author",
  className = "",
  autoFocus = false,
}: Props) {
  const [internal, setInternal] = useState("");
  const current = value ?? internal;

  return (
    <label className={`board-search ${className}`.trim()}>
      <span className="sr-only">게시글 검색</span>
      <input
        type="search"
        value={current}
        autoFocus={autoFocus}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          const next = e.target.value;
          if (onChange) onChange(next);
          else setInternal(next);
        }}
      />
    </label>
  );
}

export function matchesBoardSearch(
  query: string,
  title: string,
  authorName: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    title.toLowerCase().includes(q) || authorName.toLowerCase().includes(q)
  );
}
