"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "청약 공고" },
  { href: "/guide", label: "청약 가이드" },
];

// 상단 탭. 현재 경로만 알면 돼서 usePathname 하나로 처리한다.
export function SiteNav() {
  const path = usePathname();
  return (
    <nav aria-label="메뉴" className="flex gap-1 rounded-xl bg-zinc-100 p-1 text-sm dark:bg-zinc-900">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={path === t.href ? "page" : undefined}
          className="rounded-lg px-4 py-2 font-medium text-zinc-500 transition-colors hover:text-zinc-900 aria-[current=page]:bg-white aria-[current=page]:text-zinc-900 aria-[current=page]:shadow-sm dark:hover:text-zinc-100 dark:aria-[current=page]:bg-zinc-700 dark:aria-[current=page]:text-zinc-50"
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
