import type { Metadata } from "next";
import { Noto_Serif_KR, Source_Serif_4 } from "next/font/google";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buildMetadata } from "@/lib/site";
import "./globals.css";

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const body = Noto_Serif_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = buildMetadata({
  description:
    "한국작가회의 미주지회 — 문학 모임, 공모전, 행사 안내와 회원 작품 게시판. Writers Association of Korea USA Chapter.",
  path: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${display.variable} ${body.variable} h-full`}>
      <body className="site-shell antialiased">
        <AppErrorBoundary>
          <AuthProvider>
            <SiteHeader />
            <main className="site-main">{children}</main>
            <SiteFooter />
          </AuthProvider>
        </AppErrorBoundary>
      </body>
    </html>
  );
}
