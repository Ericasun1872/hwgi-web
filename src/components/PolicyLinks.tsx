"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

/** Links to terms/bylaws — always visible; admin also gets edit link. */
export function PolicyLinks({
  showAdminEdit = true,
}: {
  showAdminEdit?: boolean;
}) {
  const { isAdmin, loading } = useAuth();

  return (
    <p className="policy-links">
      <Link href="/terms">이용약관</Link>
      <span aria-hidden>·</span>
      <Link href="/privacy">개인정보</Link>
      <span aria-hidden>·</span>
      <Link href="/bylaws">정관</Link>
      {showAdminEdit && !loading && isAdmin ? (
        <>
          <span aria-hidden>·</span>
          <Link href="/admin/policies">약관·정관 관리</Link>
        </>
      ) : null}
    </p>
  );
}
