# 한국작가회의 미주지회 홍보 웹 (hwgi-web)

Next.js(App Router) + Firebase Firestore 공개 읽기. Flutter 회원 앱(`writer_app`)과 같은 Firebase 프로젝트 `writerapp-3a1b3`를 사용합니다.

## 로컬 실행

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

http://localhost:3000

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | 히어로 · CTA |
| `/about` | 회장 인사 · 조직도 (`chapter_content/main`) |
| `/events` | 행사 (`chapter_events`) |
| `/contest` | 공모전 (`event_contest_2026` + 고정 카피) |
| `/boards` · `/boards/[kind]` · `/boards/[kind]/[id]` | 게시판·댓글 읽기 |
| `/join` | 가입 · 앱 안내 |

1단계는 **읽기 전용**. 글쓰기·댓글·로그인은 회원 앱에서.

## Vercel 배포

```bash
npx vercel --yes
npx vercel --prod --yes
```

배포 후 `NEXT_PUBLIC_SITE_URL`을 실제 도메인으로 맞추면 OG·sitemap이 올바르게 동작합니다.
