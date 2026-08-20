import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardPostList } from "@/components/BoardPostList";
import { WriteCta } from "@/components/WriteCta";
import { getPostsByKind } from "@/lib/firestore";
import { boardMeta, buildMetadata, isBoardKind } from "@/lib/site";

type Props = { params: Promise<{ kind: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind } = await params;
  const meta = boardMeta(kind);
  if (!meta) return {};
  return buildMetadata({
    title: meta.labelKo,
    description: `${meta.labelKo} (${meta.labelEn}) — 미주지회 회원 작품`,
    path: `/boards/${kind}`,
  });
}

export const revalidate = 30;

export default async function BoardKindPage({ params }: Props) {
  const { kind } = await params;
  if (!isBoardKind(kind)) notFound();

  const meta = boardMeta(kind)!;
  const posts = await getPostsByKind(kind);

  return (
    <div className="page">
      <header className="page-header">
        <p style={{ marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          <Link href="/boards" style={{ color: "var(--muted)" }}>
            게시판
          </Link>
          {" · "}
          <Link href="/boards/search" style={{ color: "var(--muted)" }}>
            통합 검색
          </Link>
        </p>
        <h1>{meta.labelKo}</h1>
        <p>
          {meta.labelEn}
          <span className="en">{meta.description}</span>
        </p>
      </header>

      <WriteCta kind={kind} />

      <BoardPostList kind={kind} posts={posts} />
    </div>
  );
}
