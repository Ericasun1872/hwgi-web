import Link from "next/link";
import { CONTACT, SITE_NAME_EN, SITE_NAME_KO } from "@/lib/site";

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
          <Link href="/terms">이용약관</Link>
          <Link href="/bylaws">정관</Link>
          <Link href="/privacy">개인정보</Link>
          <Link href="/contest">공모전</Link>
          <Link href="/boards">게시판</Link>
        </div>
        <p className="site-footer__note">
          승인 회원은 웹·앱에서 작품·댓글 작성 · Members may post on web or app
        </p>
      </div>
    </footer>
  );
}
