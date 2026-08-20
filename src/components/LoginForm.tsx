"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function LoginForm() {
  const { login, resetPassword, error, clearError, user, loading: authLoading } =
    useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/boards";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace(next);
    }
  }, [user, next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setInfo(null);
    clearError();
    setSubmitting(true);
    try {
      await login(email, password);
      router.push(next);
      router.refresh();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "로그인 실패");
    } finally {
      setSubmitting(false);
    }
  }

  async function onForgotPassword() {
    setLocalError(null);
    setInfo(null);
    clearError();
    setResetting(true);
    try {
      await resetPassword(email);
      setInfo(
        "비밀번호 재설정 링크를 이메일로 보냈습니다. 메일함을 확인해 주세요.",
      );
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "재설정 메일 발송에 실패했습니다.",
      );
    } finally {
      setResetting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      {authLoading ? (
        <p className="empty-state" style={{ margin: 0 }}>
          로그인 상태 확인 중…
        </p>
      ) : null}
      <label>
        이메일
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        비밀번호
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="password-field__toggle"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "숨기기" : "보기"}
          </button>
        </div>
      </label>
      {(localError || error) && (
        <p className="form-error" role="alert">
          {localError || error}
        </p>
      )}
      {info ? (
        <p className="form-info" role="status">
          {info}
        </p>
      ) : null}
      <button
        type="submit"
        className="cta cta--primary"
        disabled={submitting}
      >
        {submitting ? "로그인 중…" : "로그인"}
      </button>
      <button
        type="button"
        className="text-action"
        disabled={resetting}
        onClick={onForgotPassword}
      >
        {resetting ? "보내는 중…" : "비밀번호 찾기 / 재설정"}
      </button>
    </form>
  );
}
