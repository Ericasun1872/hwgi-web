"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, addDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getClientAuth, getDb } from "@/lib/firebase";

type MemberType = "chapter" | "basic";

const ADMIN_NOTIFY = ["sunjin1872@gmail.com", "wakusachapter@gmail.com"];

export function SignUpForm() {
  const router = useRouter();
  const [memberType, setMemberType] = useState<MemberType>("chapter");
  const [nameKo, setNameKo] = useState("");
  const [nickname, setNickname] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [region, setRegion] = useState("");
  const [genre, setGenre] = useState("");
  const [termsOk, setTermsOk] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Honeypot — bots fill this; humans never see it. */
  const [companyWebsite, setCompanyWebsite] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Silent reject for automated form fillers
    if (companyWebsite.trim()) {
      setBusy(true);
      await new Promise((r) => setTimeout(r, 600));
      setBusy(false);
      router.push("/signup/pending");
      return;
    }

    const trimmedName = nameKo.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (!trimmedEmail.includes("@")) {
      setError("이메일 형식이 올바르지 않습니다.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    if (!termsOk) {
      setError("이용약관·개인정보 안내에 동의해 주세요.");
      return;
    }

    setBusy(true);
    const auth = getClientAuth();
    try {
      await createUserWithEmailAndPassword(auth, trimmedEmail, password);

      const nick = nickname.trim() || null;
      const en = nameEn.trim() || null;
      const reg = region.trim() || null;
      const gen = memberType === "chapter" ? genre.trim() || null : null;
      const joinedAt = new Date().toISOString();

      await setDoc(doc(getDb(), "chapter_members", trimmedEmail), {
        email: trimmedEmail,
        nameKo: trimmedName,
        nickname: nick,
        nameEn: en,
        region: reg,
        genre: gen,
        joinedAt,
        approvalStatus: "pending",
        duesStatus: memberType === "chapter" ? "unpaid" : "none",
        approvedAt: null,
        isWriter: false,
        memberType,
        updatedAt: serverTimestamp(),
      });

      const display =
        nick || trimmedName || trimmedEmail;
      try {
        await addDoc(collection(getDb(), "mail"), {
          to: ADMIN_NOTIFY,
          message: {
            subject:
              "[한국작가회의 미주지회] 신규 회원가입 알림 / New Member Registration",
            text: `한국작가회의 미주지회 웹에 신규 회원가입 신청이 접수되었습니다.

■ 신청 정보
· 표시명: ${display}
· 본명(한글): ${trimmedName}
${nick ? `· 닉네임: ${nick}\n` : ""}${en ? `· 영문명: ${en}\n` : ""}· 이메일: ${trimmedEmail}
· 지역: ${reg || "—"}
· 장르: ${gen || "—"}
· 회원 유형: ${memberType === "chapter" ? "미주지회 회원" : "일반 회원"}
· 신청일: ${joinedAt.slice(0, 10)}

웹사이트 [회원 관리] 또는 앱 [회원 관리]에서 승인·연회비 상태를 확인해 주세요.
`,
          },
        });
      } catch {
        // Mail queue is best-effort; signup still succeeds.
      }

      await signOut(auth);
      router.push("/signup/pending");
    } catch (err) {
      try {
        await signOut(auth);
      } catch {
        /* ignore */
      }
      setError(mapSignupError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form signup-form" onSubmit={onSubmit}>
      <fieldset className="signup-type">
        <legend>회원 유형</legend>
        <label className="signup-type__option">
          <input
            type="radio"
            name="memberType"
            checked={memberType === "chapter"}
            onChange={() => setMemberType("chapter")}
          />
          <span>
            <strong>미주지회 회원</strong>
            <small>연회비 · 승인 후 글쓰기</small>
          </span>
        </label>
        <label className="signup-type__option">
          <input
            type="radio"
            name="memberType"
            checked={memberType === "basic"}
            onChange={() => setMemberType("basic")}
          />
          <span>
            <strong>일반 회원</strong>
            <small>무료 · 승인 후 읽기·댓글</small>
          </span>
        </label>
      </fieldset>

      <label>
        이름 (한글) *
        <input
          required
          value={nameKo}
          onChange={(e) => setNameKo(e.target.value)}
          autoComplete="name"
        />
      </label>
      <label>
        닉네임 (선택)
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </label>
      <label>
        영문 이름 (선택)
        <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
      </label>
      <div className="signup-honeypot" aria-hidden="true">
        <label>
          회사 웹사이트 (작성하지 마세요)
          <input
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
          />
        </label>
      </div>
      <label>
        이메일 *
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        비밀번호 * (8자 이상)
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
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
      <label>
        비밀번호 확인 *
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </div>
      </label>
      <label>
        지역 (선택)
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="예: Seattle"
        />
      </label>
      {memberType === "chapter" ? (
        <label>
          장르·관심 분야 (선택)
          <input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="예: 시 / Poetry"
          />
        </label>
      ) : null}

      <label className="compose-form__check">
        <input
          type="checkbox"
          checked={termsOk}
          onChange={(e) => setTermsOk(e.target.checked)}
        />
        <span>
          <Link href="/terms" target="_blank" rel="noreferrer">
            이용약관
          </Link>
          ·
          <Link href="/privacy" target="_blank" rel="noreferrer">
            개인정보
          </Link>
          ·
          <Link href="/bylaws" target="_blank" rel="noreferrer">
            정관
          </Link>
          에 동의합니다.
        </span>
      </label>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="cta cta--primary" disabled={busy}>
        {busy ? "신청 중…" : "가입 신청"}
      </button>
    </form>
  );
}

function mapSignupError(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: string }).code)
      : "";
  if (code.includes("email-already-in-use")) {
    return "이미 등록된 이메일입니다. 로그인을 시도해 보세요.";
  }
  if (code.includes("weak-password")) {
    return "비밀번호가 너무 약합니다. 8자 이상으로 해 주세요.";
  }
  if (code.includes("invalid-email")) {
    return "이메일 형식이 올바르지 않습니다.";
  }
  if (err instanceof Error && err.message) return err.message;
  return "가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}
