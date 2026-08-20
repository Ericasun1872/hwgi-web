import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { DeletePostButton } from "@/components/DeletePostButton";
import { EditPostForm } from "@/components/EditPostForm";
import { getCommentsForPost, getPost } from "@/lib/firestore";
import { boardMeta, buildMetadata, isBoardKind } from "@/lib/site";

type Props = { params: Promise<{ kind: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind, id } = await params;
  if (!isBoardKind(kind)) return {};
  const post = await getPost(kind, id);
  if (!post) return {};
  const meta = boardMeta(kind);
  return buildMetadata({
    title: post.title || "작품",
    description: `${post.authorName} — ${meta?.labelKo ?? kind} · 미주지회`,
    path: `/boards/${kind}/${id}`,
  });
}

export const revalidate = 30;

export default async function PostDetailPage({ params }: Props) {
  const { kind, id } = await params;
  if (!isBoardKind(kind)) notFound();

  const post = await getPost(kind, id);
  if (!post) notFound();

  const comments = await getCommentsForPost(id);
  const meta = boardMeta(kind)!;
  const imageSrc = post.imageBytesBase64
    ? `data:image/jpeg;base64,${post.imageBytesBase64}`
    : null;

  return (
    <div className="page">
      <article className="post-article">
        <header>
          <p style={{ marginBottom: "0.75rem", fontSize: "0.9rem" }}>
            <Link href="/boards" style={{ color: "var(--muted)" }}>
              게시판
            </Link>
            {" · "}
            <Link href={`/boards/${kind}`} style={{ color: "var(--muted)" }}>
              {meta.labelKo}
            </Link>
          </p>
          <h1>{post.title || "(제목 없음)"}</h1>
          <p className="meta">{post.authorName}</p>
        </header>

        {imageSrc ? (
          <figure className="post-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageSrc} alt="" />
          </figure>
        ) : null}

        <div className="post-body">{post.body}</div>

        <div className="post-actions">
          <EditPostForm kind={kind} post={post} />
          <DeletePostButton kind={kind} post={post} />
        </div>
      </article>

      <section className="comments" aria-labelledby="comments-heading">
        <h2 id="comments-heading">댓글 · Comments</h2>
        <CommentList comments={comments} kind={kind} postId={id} />
        <CommentForm postId={id} kind={kind} />
      </section>
    </div>
  );
}
