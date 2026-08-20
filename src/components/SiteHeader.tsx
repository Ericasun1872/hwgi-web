"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthNavControls } from "@/components/AuthNavControls";
import { NAV_LINKS, SITE_NAME_EN, SITE_NAME_KO } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-brand" onClick={() => setOpen(false)}>
          <span className="site-brand__ko">{SITE_NAME_KO}</span>
          <span className="site-brand__en">{SITE_NAME_EN}</span>
        </Link>

        <div className="site-header__right">
          <Link
            href="/"
            className="site-header__logo"
            aria-label="한국작가회의"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/logo-white.png"
              alt=""
              width={88}
              height={50}
              className="site-header__logo-img"
              priority
            />
          </Link>

          <button
            type="button"
            className="site-nav-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">메뉴</span>
            <span aria-hidden className={open ? "is-open" : undefined} />
          </button>

          <nav
            id="site-nav"
            className={`site-nav ${open ? "is-open" : ""}`}
            aria-label="주요 메뉴"
          >
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? "is-active" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span>{link.labelKo}</span>
                  <small>{link.labelEn}</small>
                </Link>
              );
            })}
            <div className="site-nav__auth" onClick={() => setOpen(false)}>
              <AuthNavControls />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
