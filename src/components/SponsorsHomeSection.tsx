import Link from "next/link";
import { CtaLink } from "@/components/CtaLink";

export function SponsorsHomeSection() {
  return (
    <section className="home-sponsors" aria-label="후원">
      <div className="home-sponsors__inner">
        <p className="home-sponsors__label">
          후원 · Sponsors
          <span className="home-sponsors__badge">후원·광고</span>
        </p>
        <h2>문학의 자리를 함께 지켜 주시는 분들</h2>
        <p className="home-sponsors__en">
          Friends who keep this literary home open
        </p>
        <p className="home-sponsors__body">
          미주지회 모임·공모전·작품 나눔은 후원자와 파트너의 응원으로 이어집니다.
        </p>
        <div className="home-sponsors__actions">
          <CtaLink href="/sponsors" variant="gold">
            후원 안내
          </CtaLink>
          <Link href="/sponsors" className="home-sponsors__more">
            자세히 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
