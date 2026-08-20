import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  doc,
  where,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import {
  ADMIN_EMAILS,
  memberDisplayName,
  memberTypeLabelKo,
  type ChapterMember,
} from "@/lib/member";

function fieldToIso(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (raw instanceof Timestamp) return raw.toDate().toISOString();
  if (
    raw &&
    typeof raw === "object" &&
    "toDate" in raw &&
    typeof (raw as { toDate: unknown }).toDate === "function"
  ) {
    try {
      return (raw as Timestamp).toDate().toISOString();
    } catch {
      return null;
    }
  }
  return null;
}

function mapMemberDoc(
  id: string,
  data: Record<string, unknown>,
): ChapterMember {
  return {
    email: String(data.email ?? id).toLowerCase(),
    nameKo: String(data.nameKo ?? ""),
    nickname: (data.nickname as string | undefined) ?? null,
    nameEn: (data.nameEn as string | undefined) ?? null,
    approvalStatus: String(data.approvalStatus ?? "pending").toLowerCase(),
    memberType: String(data.memberType ?? "chapter"),
    isWriter: Boolean(data.isWriter),
    region: (data.region as string | undefined) ?? null,
    genre: (data.genre as string | undefined) ?? null,
    joinedAt: fieldToIso(data.joinedAt),
    duesStatus: (data.duesStatus as string | undefined) ?? null,
    approvedAt: fieldToIso(data.approvedAt),
  };
}

async function fetchByApprovalStatus(
  status: "pending" | "approved",
): Promise<ChapterMember[]> {
  const q = query(
    collection(getDb(), "chapter_members"),
    where("approvalStatus", "==", status),
  );
  const snap = await getDocs(q);
  const members = snap.docs.map((d) => mapMemberDoc(d.id, d.data()));
  members.sort((a, b) => {
    const aDate = a.joinedAt || a.approvedAt || "";
    const bDate = b.joinedAt || b.approvedAt || "";
    const byDate = bDate.localeCompare(aDate);
    if (byDate !== 0) return byDate;
    return a.nameKo.localeCompare(b.nameKo, "ko");
  });
  return members;
}

export async function fetchPendingMembers(): Promise<ChapterMember[]> {
  return fetchByApprovalStatus("pending");
}

export async function fetchApprovedMembers(): Promise<ChapterMember[]> {
  return fetchByApprovalStatus("approved");
}

export type ApprovalActionResult = {
  ok: boolean;
  emailQueued?: boolean;
  message: string;
};

export async function approveMember(
  member: ChapterMember,
): Promise<ApprovalActionResult> {
  const email = member.email.trim().toLowerCase();
  const approvedAt = new Date().toISOString();
  try {
    await setDoc(
      doc(getDb(), "chapter_members", email),
      {
        approvalStatus: "approved",
        approvedAt,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    return {
      ok: false,
      message: "승인 저장에 실패했습니다. 네트워크·권한을 확인해 주세요.",
    };
  }

  let emailQueued = false;
  try {
    emailQueued = await queueApprovalEmail(member);
  } catch {
    emailQueued = false;
  }

  return {
    ok: true,
    emailQueued,
    message: emailQueued
      ? `${memberDisplayName(member)}님을 승인했습니다. 안내 메일을 예약했습니다.`
      : `${memberDisplayName(member)}님을 승인했습니다. (안내 메일 예약은 실패했을 수 있습니다.)`,
  };
}

export async function rejectMember(
  member: ChapterMember,
): Promise<ApprovalActionResult> {
  const email = member.email.trim().toLowerCase();
  try {
    await setDoc(
      doc(getDb(), "chapter_members", email),
      {
        approvalStatus: "rejected",
        approvedAt: null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return {
      ok: true,
      message: `${memberDisplayName(member)}님 가입을 반려했습니다.`,
    };
  } catch {
    return {
      ok: false,
      message: "반려 저장에 실패했습니다. 네트워크·권한을 확인해 주세요.",
    };
  }
}

/** 운영진: 승인 회원 기록을 목록에서 삭제 (Auth 계정은 Console에서 별도 삭제) */
export async function removeApprovedMember(
  member: ChapterMember,
): Promise<ApprovalActionResult> {
  const email = member.email.trim().toLowerCase();
  if (ADMIN_EMAILS.has(email)) {
    return {
      ok: false,
      message: "운영진·회장 계정은 이 목록에서 삭제할 수 없습니다.",
    };
  }
  try {
    await deleteDoc(doc(getDb(), "chapter_members", email));
    return {
      ok: true,
      message: `${memberDisplayName(member)}님을 회원 목록에서 삭제했습니다.`,
    };
  } catch {
    return {
      ok: false,
      message:
        "삭제에 실패했습니다. 네트워크·권한을 확인해 주세요. (Firebase Auth 계정은 Console에서 별도 삭제하세요.)",
    };
  }
}

async function queueApprovalEmail(member: ChapterMember): Promise<boolean> {
  const display = memberDisplayName(member);
  const typeLabel = memberTypeLabelKo(member.memberType);
  await addDoc(collection(getDb(), "mail"), {
    to: [member.email],
    message: {
      subject:
        "[한국작가회의 미주지회] 회원 승인 완료 / Membership Approved",
      text: `${display}님, 한국작가회의 미주지회 회원 승인이 완료되었습니다.
Dear ${display}, your membership has been approved.

■ 회원 유형 / Membership
· ${typeLabel}

■ 로그인 / Sign in
· 이메일 / Email: ${member.email}
· 웹사이트(wak-usa.org) 또는 회원 앱에서 가입 시 설정한 비밀번호로 로그인해 주세요.
  Sign in on the website or the member app with the password you registered.

■ 문의 / Contact
로그인에 문제가 있으면 지회 운영진에게 연락해 주세요.
If you cannot log in, please contact the chapter admin.

—
한국작가회의 미주지회
Writers Association of Korea — USA Chapter
`,
    },
  });
  return true;
}
