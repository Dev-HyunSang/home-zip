"use client";

import { useSyncExternalStore } from "react";

// 테마의 원본은 <html data-theme>. layout.tsx의 인라인 스크립트가 첫 페인트 전에 정해 둔다.
const read = () => document.documentElement.dataset.theme === "dark";
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};

export function ThemeToggle() {
  // 서버에서는 테마를 알 수 없으니 false로 렌더하고, 하이드레이션 후 실제 값으로 맞춘다.
  const dark = useSyncExternalStore(subscribe, read, () => false);

  const toggle = () => {
    const next = read() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // 시크릿 모드 등 저장소를 못 쓰면 이번 방문에만 적용된다.
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="다크 모드"
      onClick={toggle}
      className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-zinc-300 bg-zinc-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:focus-visible:outline-zinc-100"
    >
      {/* 아이콘·위치는 CSS dark: 로만 바꿔서 하이드레이션 전에도 올바르게 보인다 */}
      <span className="absolute left-1 flex size-6 items-center justify-center rounded-full bg-white text-zinc-700 shadow transition-transform dark:translate-x-6 dark:bg-zinc-950 dark:text-zinc-200">
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 dark:hidden" aria-hidden>
          <path d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm4 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-.46 4.95.7.7a1 1 0 0 0 1.42-1.41l-.71-.71a1 1 0 0 0-1.41 1.42ZM16 10a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1Zm-1.05-5.54a1 1 0 0 0-1.41 1.42l.7.7a1 1 0 0 0 1.42-1.41l-.71-.71ZM10 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm-5.66-.34a1 1 0 0 0 1.42 0l.7-.71a1 1 0 0 0-1.41-1.41l-.71.7a1 1 0 0 0 0 1.42ZM2 10a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm2.34-5.66a1 1 0 0 0 0 1.42l.71.7a1 1 0 0 0 1.41-1.41l-.7-.71a1 1 0 0 0-1.42 0Z" />
        </svg>
        <svg viewBox="0 0 20 20" fill="currentColor" className="hidden size-4 dark:block" aria-hidden>
          <path d="M17.29 13.29A8 8 0 0 1 6.71 2.71a8 8 0 1 0 10.58 10.58Z" />
        </svg>
      </span>
    </button>
  );
}
