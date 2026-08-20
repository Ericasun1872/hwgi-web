"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getClientAuth, getDb } from "@/lib/firebase";
import {
  canComment,
  canWritePosts,
  isAdminEmail,
  isApproved,
  type ChapterMember,
} from "@/lib/member";

type AuthState = {
  user: User | null;
  member: ChapterMember | null;
  loading: boolean;
  error: string | null;
  canWrite: boolean;
  canComment: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

async function loadMember(email: string): Promise<ChapterMember | null> {
  const id = email.trim().toLowerCase();
  const fetchDoc = getDoc(doc(getDb(), "chapter_members", id));
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 10000),
  );
  const snap = await Promise.race([
    fetchDoc.then((s) => s),
    timeout.then(() => null),
  ]);

  if (!snap || !("exists" in snap) || !snap.exists()) {
    // Admin allowlist may have Auth without a chapter_members doc yet
    if (isAdminEmail(id)) {
      return {
        email: id,
        nameKo: "운영진",
        nickname: null,
        nameEn: null,
        approvalStatus: "approved",
        memberType: "chapter",
        isWriter: false,
      };
    }
    return null;
  }

  const data = snap.data();
  const status = String(data.approvalStatus ?? "pending").toLowerCase();
  return {
    email: String(data.email ?? id).toLowerCase(),
    nameKo: String(data.nameKo ?? ""),
    nickname: (data.nickname as string | undefined) ?? null,
    nameEn: (data.nameEn as string | undefined) ?? null,
    approvalStatus: status,
    memberType: String(data.memberType ?? "chapter"),
    isWriter: Boolean(data.isWriter),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<ChapterMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsub = () => {};

    try {
      const auth = getClientAuth();
      unsub = onAuthStateChanged(auth, async (next) => {
        if (!next?.email) {
          if (!cancelled) {
            setUser(null);
            setMember(null);
            setLoading(false);
          }
          return;
        }
        try {
          const profile = await loadMember(next.email);
          if (cancelled) return;
          if (!profile || !isApproved(profile)) {
            await signOut(auth);
            setUser(null);
            setMember(null);
            if (profile?.approvalStatus === "pending") {
              setError(
                "가입 승인 대기 중입니다. 운영진 승인 후 로그인해 주세요.",
              );
            } else if (profile?.approvalStatus === "rejected") {
              setError("가입이 반려되었습니다. 지회로 문의해 주세요.");
            } else {
              setError(
                "회원 정보를 찾을 수 없습니다. 앱에서 한 번 로그인해 회원 정보가 동기화되었는지 확인해 주세요.",
              );
            }
          } else {
            setUser(next);
            setMember(profile);
            setError(null);
          }
        } catch {
          if (!cancelled) {
            setUser(null);
            setMember(null);
            setError(
              "회원 정보를 불러오지 못했습니다. 네트워크를 확인해 주세요.",
            );
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      });
    } catch {
      if (!cancelled) {
        setLoading(false);
        setError("인증 초기화에 실패했습니다. 페이지를 새로고침해 주세요.");
      }
    }

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const normalized = email.trim().toLowerCase();
    try {
      const cred = await signInWithEmailAndPassword(
        getClientAuth(),
        normalized,
        password,
      );
      const profile = await loadMember(cred.user.email ?? normalized);
      if (!profile || !isApproved(profile)) {
        await signOut(getClientAuth());
        setUser(null);
        setMember(null);
        if (profile?.approvalStatus === "pending") {
          throw new Error(
            "가입 승인 대기 중입니다. 운영진 승인 후 로그인해 주세요.",
          );
        }
        if (profile?.approvalStatus === "rejected") {
          throw new Error("가입이 반려되었습니다. 지회로 문의해 주세요.");
        }
        throw new Error(
          "회원 정보를 찾을 수 없습니다. 앱에서 한 번 로그인한 뒤 다시 시도해 주세요.",
        );
      }
      setUser(cred.user);
      setMember(profile);
      setLoading(false);
    } catch (e) {
      const code =
        e && typeof e === "object" && "code" in e
          ? String((e as { code: string }).code)
          : "";
      const raw = e instanceof Error ? e.message : "로그인에 실패했습니다.";
      const mapped = mapAuthError(code || raw);
      setError(mapped);
      setLoading(false);
      throw new Error(mapped);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(getClientAuth());
    setUser(null);
    setMember(null);
    setError(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      throw new Error("비밀번호 재설정을 위해 이메일을 먼저 입력해 주세요.");
    }
    try {
      await sendPasswordResetEmail(getClientAuth(), normalized);
    } catch (e) {
      const code =
        e && typeof e === "object" && "code" in e
          ? String((e as { code: string }).code)
          : "";
      const raw = e instanceof Error ? e.message : "재설정 메일 발송 실패";
      throw new Error(mapAuthError(code || raw));
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      member,
      loading,
      error,
      canWrite: canWritePosts(member),
      canComment: canComment(member),
      isAdmin: isAdminEmail(user?.email ?? member?.email),
      login,
      logout,
      resetPassword,
      clearError: () => setError(null),
    }),
    [user, member, loading, error, login, logout, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function mapAuthError(message: string): string {
  if (
    message.includes("auth/invalid-credential") ||
    message.includes("auth/wrong-password") ||
    message.includes("auth/invalid-login-credentials")
  ) {
    return "이메일 또는 비밀번호가 올바르지 않습니다. 비밀번호 찾기로 재설정해 보세요.";
  }
  if (message.includes("auth/user-not-found")) {
    return "등록되지 않은 이메일입니다. 회원가입을 먼저 해 주세요.";
  }
  if (message.includes("auth/too-many-requests")) {
    return "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (message.includes("auth/invalid-email")) {
    return "이메일 형식이 올바르지 않습니다.";
  }
  if (message.includes("auth/network-request-failed")) {
    return "네트워크 오류입니다. 연결을 확인해 주세요.";
  }
  return message;
}
