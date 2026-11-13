import type { Metadata } from "next";
import { GUIDE } from "../../../data/guide.ts";

export const metadata: Metadata = {
  title: "청약 가이드",
  description: "주택 청약 당첨 기준과 자격 조건 안내",
};

export default function GuidePage() {
  const groups = [...Map.groupBy(GUIDE, (g) => g.category)];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">청약 가이드</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">당첨 기준과 자격 조건을 한눈에 정리했어요.</p>

      <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <span aria-hidden>⚠️</span>
        <p>요약 정보라 실제와 다를 수 있어요. 신청 전 반드시 공고문과 청약홈에서 확인하세요.</p>
      </div>

      {/* 카테고리 바로가기. 스크롤해도 위에 붙어 있다. */}
      {groups.length > 1 && (
        <nav
          aria-label="카테고리"
          className="sticky top-0 z-10 -mx-4 mt-6 flex gap-2 overflow-x-auto bg-[var(--background)]/90 px-4 py-3 text-sm backdrop-blur"
        >
          {groups.map(([c, entries], i) => (
            <a
              key={c}
              href={`#cat-${i}`}
              className="shrink-0 rounded-full border border-zinc-300 px-4 py-1.5 font-medium transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-700 dark:hover:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
            >
              {c} <span className="text-zinc-400">{entries.length}</span>
            </a>
          ))}
        </nav>
      )}

      {GUIDE.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed p-8 text-center text-zinc-500">아직 등록된 안내가 없어요.</p>
      )}

      {groups.map(([category, entries], i) => (
        <section key={category} id={`cat-${i}`} className="mt-8 scroll-mt-16">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <span className="h-5 w-1 rounded-full bg-zinc-900 dark:bg-zinc-100" aria-hidden />
            {category}
          </h2>
          <div className="mt-3 space-y-3">
            {entries.map((e) => (
              // ponytail: 네이티브 details라 클라이언트 JS 없이 접고 펼친다
              <details
                key={e.title}
                className="group rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow open:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{e.title}</p>
                    {e.summary && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{e.summary}</p>}
                  </div>
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition-transform group-open:rotate-180 dark:bg-zinc-800"
                  >
                    ▾
                  </span>
                </summary>

                <div className="space-y-4 border-t border-zinc-100 px-5 pt-4 pb-5 dark:border-zinc-800">
                  {e.conditions && e.conditions.length > 0 && (
                    <dl className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-100 text-sm dark:divide-zinc-800 dark:border-zinc-800">
                      {e.conditions.map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[7rem_1fr] sm:grid-cols-[9rem_1fr]">
                          <dt className="bg-zinc-50 px-4 py-3 font-medium text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                            {label}
                          </dt>
                          <dd className="px-4 py-3 whitespace-pre-line">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {e.notes && e.notes.length > 0 && (
                    <div className="rounded-xl bg-sky-50 p-4 text-sm dark:bg-sky-950">
                      <p className="font-medium text-sky-900 dark:text-sky-200">참고</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sky-900/80 dark:text-sky-200/80">
                        {e.notes.map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(e.source || e.updated) && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                      {e.source && (
                        <a
                          href={e.source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border px-3 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                          출처 · {e.source.label} ↗
                        </a>
                      )}
                      {e.updated && <span>확인일 {e.updated}</span>}
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
