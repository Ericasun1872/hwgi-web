import Link from "next/link";
import {
  CONTACT,
  INQUIRY_FORM_URL,
  PLAY_STORE_URL,
  SITE_NAME_EN,
  SITE_NAME_KO,
  SOCIAL_LINKS,
} from "@/lib/site";

export function SiteFooter() {
  const emailHref = `mailto:${CONTACT.email}`;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="site-footer__brand">{SITE_NAME_KO}</p>
          <p className="site-footer__en">{SITE_NAME_EN}</p>
          <div className="site-footer__contact">
            <p>
              <span className="site-footer__contact-label">담당</span>
              {CONTACT.roleKo} {CONTACT.nameKo}
              <span className="site-footer__contact-en">
                {CONTACT.roleEn} · {CONTACT.nameEn}
              </span>
            </p>
            <p>
              <span className="site-footer__contact-label">문의</span>
              <a href={emailHref}>{CONTACT.email}</a>
            </p>
          </div>
        </div>
        <div className="site-footer__links">
          <Link href="/join">가입 안내</Link>
          {INQUIRY_FORM_URL.trim().startsWith("http") ? (
            <a href={INQUIRY_FORM_URL.trim()} target="_blank" rel="noopener noreferrer">
              문의 폼
            </a>
          ) : (
            <Link href={INQUIRY_FORM_URL.trim() || "/contact"}>문의 폼</Link>
          )}
          <Link href="/ebooks">작품집</Link>
          <Link href="/sponsors">후원</Link>
          <span className="site-footer__app">
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              Android 앱
            </a>
            <span className="site-footer__ios">
              iOS 사용자는 웹에서 이용 가능
            </span>
          </span>
          <Link href="/terms">이용약관</Link>
          <Link href="/bylaws">정관</Link>
          <Link href="/privacy">개인정보</Link>
          <Link href="/contest">공모전</Link>
          <Link href="/boards">게시판</Link>
          {SOCIAL_LINKS.filter((item) => item.href.trim()).map((item) => (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          ))}
        </div>
        <p className="site-footer__note">
          승인 회원은 웹·앱에서 작품·댓글 작성 · Members may post on web or app
        </p>
        <p className="site-footer__note">
          후원·광고 문의:{" "}
          <a href={emailHref}>{CONTACT.email}</a>
        </p>
      </div>
    </footer>
  );
}
