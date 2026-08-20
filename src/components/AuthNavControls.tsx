"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { memberDisplayName } from "@/lib/member";

const ADMIN_LINKS = [
  { href: "/admin/members", label: "회원 관리" },
  { href: "/admin/reports", label: "신고 관리" },
  { href: "/admin/events", label: "행사 관리" },
  { href: "/admin/contest", label: "공모전 관리" },
  { href: "/admin/policies", label: "약관·정관 관리" },
  { href: "/admin/about", label: "소개 관리" },
] as const;

export function AuthNavControls() {
  const { user, member, loading, logout, canWrite, isAdmin } = useAuth();
  const [adminOpen, setAdminOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!adminOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAdminOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [adminOpen]);

  if (loading) {
    return <span className="auth-nav auth-nav--muted">…</span>;
  }

  if (!user || !member) {
    return (
      <Link href="/login" className="auth-nav">
        <span>로그인</span>
        <small>Login</small>
      </Link>
    );
  }

  return (
    <div className="auth-nav-user" ref={menuRef}>
      <span className="auth-nav-user__name" title={member.email}>
        {memberDisplayName(member)}
        {canWrite ? "" : " · 댓글"}
      </span>
      <div className="auth-nav-user__row">
        {isAdmin ? (
          <div className="auth-nav-user__admin-menu">
            <button
              type="button"
              className="auth-nav-user__admin-toggle"
              aria-expanded={adminOpen}
              aria-controls={menuId}
              onClick={() => setAdminOpen((v) => !v)}
            >
              운영진
              <span aria-hidden>{adminOpen ? "▴" : "▾"}</span>
            </button>
            {adminOpen ? (
              <div id={menuId} className="auth-nav-user__admin-panel" role="menu">
                {ADMIN_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="auth-nav-user__admin"
                    role="menuitem"
                    onClick={() => setAdminOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          className="auth-nav-user__out"
          onClick={() => logout()}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
