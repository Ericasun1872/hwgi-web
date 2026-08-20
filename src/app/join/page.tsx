import type { Metadata } from "next";
import Link from "next/link";
import { CtaLink } from "@/components/CtaLink";
import { PolicyLinks } from "@/components/PolicyLinks";
import { APP_STORE_URL, buildMetadata, PLAY_STORE_URL } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "가입 안내",
  description:
    "한국작가회의 미주지회 가입·웹·앱 이용 안내. Join the USA Chapter.",
  path: "/join",
});

export default function JoinPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>가입 안내</h1>
        <p>
          Join the chapter
          <span className="en">
            iPhone은 웹에서 가입 · 승인 후 웹·앱 로그인
          </span>
        </p>
        <PolicyLinks />
      </header>

      <ol className="join-steps">
        <li>
          <h2>웹에서 가입 신청</h2>
          <p>
            한국작가회의 미주지회 웹사이트에서 회원가입을 신청합니다. (앱으로도
            가입할 수 있습니다.) 가입 전{" "}
            <Link
              href="/terms"
              style={{ borderBottom: "1px solid var(--gold-line)" }}
            >
              이용약관
            </Link>
            ·
            <Link
              href="/bylaws"
              style={{ borderBottom: "1px solid var(--gold-line)" }}
            >
              정관
            </Link>
            을 확인해 주세요.
          </p>
        </li>
        <li>
          <h2>운영진 승인</h2>
          <p>
            운영진·회장이 웹 「회원 관리」 또는 앱에서 승인하면 로그인할 수
            있습니다.
          </p>
        </li>
        <li>
          <h2>작품·댓글</h2>
          <p>
            승인 후 웹사이트나 회원 앱에서 글을 올리고 댓글을 남길 수 있습니다.
            미주지회 회원은 글쓰기, 일반 회원은 댓글이 가능합니다.
          </p>
        </li>
      </ol>

      <div className="download-row">
        <CtaLink href="/signup" variant="primary">
          웹 회원가입
        </CtaLink>
        <CtaLink href="/login" variant="gold">
          웹 로그인
        </CtaLink>
        <CtaLink href={PLAY_STORE_URL} variant="gold">
          Google Play
        </CtaLink>
        {APP_STORE_URL ? (
          <CtaLink href={APP_STORE_URL} variant="gold">
            App Store
          </CtaLink>
        ) : null}
      </div>

      <p className="phase-note">
        운영진·회장 계정으로 로그인한 뒤{" "}
        <Link
          href="/admin/members"
          style={{ borderBottom: "1px solid var(--gold-line)" }}
        >
          웹 회원 관리
        </Link>
        에서 승인 대기 목록을 확인하고 승인·반려할 수 있습니다. (앱 「회원
        관리」에서도 동일하게 가능합니다.)
      </p>
    </div>
  );
}
