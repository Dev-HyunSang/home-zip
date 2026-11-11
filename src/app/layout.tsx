import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "./theme-toggle";
import { SiteNav } from "./site-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "home-zip · 청약 공고 한눈에",
  description: "주택 청약 공고를 한눈에 모아 보기",
};

// 첫 페인트 전에 테마를 정해서 새로고침 때 깜빡이지 않게 한다.
// 저장된 선택이 없으면 시스템 설정을 따른다. 내용이 고정 문자열이라 인라인 실행해도 안전하다.
const THEME_INIT = `(()=>{let t;try{t=localStorage.getItem("theme")}catch{}if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme을 스크립트가 하이드레이션 전에 넣으므로 속성 불일치 경고를 끈다 (이 요소 한 단계만 적용됨)
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-4 pt-4">
          <SiteNav />
          <ThemeToggle />
        </header>
        {children}
      </body>
    </html>
  );
}
