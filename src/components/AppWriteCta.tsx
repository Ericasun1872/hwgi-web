import Link from "next/link";

export function AppWriteCta({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`app-write-cta ${compact ? "is-compact" : ""}`}>
      <p>
        작품 올리기·댓글 작성은 회원 앱에서 이용할 수 있습니다.
        <span> Posting &amp; comments are available in the member app.</span>
      </p>
      <Link href="/join">앱 · 가입 안내</Link>
    </aside>
  );
}
