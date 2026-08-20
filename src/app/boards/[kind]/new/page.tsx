import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewPostForm } from "@/components/NewPostForm";
import { boardMeta, buildMetadata, isBoardKind } from "@/lib/site";

type Props = { params: Promise<{ kind: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind } = await params;
  const meta = boardMeta(kind);
  if (!meta) return {};
  return buildMetadata({
    title: `${meta.labelKo} 새 글`,
    description: `${meta.labelKo} 작품 올리기`,
    path: `/boards/${kind}/new`,
  });
}

export default async function NewPostPage({ params }: Props) {
  const { kind } = await params;
  if (!isBoardKind(kind)) notFound();
  const meta = boardMeta(kind)!;

  return (
    <div className="page">
      <header className="page-header">
        <p style={{ marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          <Link href={`/boards/${kind}`} style={{ color: "var(--muted)" }}>
            {meta.labelKo}
          </Link>
        </p>
        <h1>새 글</h1>
        <p>
          {meta.labelKo}
          <span className="en">New post</span>
        </p>
      </header>
      <NewPostForm kind={kind} labelKo={meta.labelKo} />
    </div>
  );
}
