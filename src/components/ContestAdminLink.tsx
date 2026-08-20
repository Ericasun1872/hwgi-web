"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export function ContestAdminLink() {
  const { isAdmin, loading } = useAuth();
  if (loading || !isAdmin) return null;
  return (
    <p className="admin-inline-link">
      <a href="#contest-manage">이 페이지에서 바로 수정·포스트</a>
      {" · "}
      <Link href="/admin/contest">공모전 관리 전용 화면</Link>
    </p>
  );
}

export function EventsAdminLink() {
  const { isAdmin, loading } = useAuth();
  if (loading || !isAdmin) return null;
  return (
    <p className="admin-inline-link">
      <a href="#events-manage">이 페이지에서 바로 수정·저장</a>
      {" · "}
      <Link href="/admin/events">행사 관리 전용 화면</Link>
    </p>
  );
}

export function AboutAdminLink() {
  const { isAdmin, loading } = useAuth();
  if (loading || !isAdmin) return null;
  return (
    <p className="admin-inline-link">
      <a href="#about-manage">인사말씀 수정</a>
      {" · "}
      <a href="#org-manage">조직도 분야별 이름 수정</a>
      {" · "}
      <Link href="/admin/about">소개 관리 전용 화면</Link>
    </p>
  );
}
