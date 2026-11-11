import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { KINDS, type Notice } from "@/lib/applyhome";
import { geocode, getNotices } from "@/lib/cached";
import { DEVELOPER_GROUPS, developerGroup } from "@/lib/developer";
import type { Geo } from "@/lib/geocode";
import { NoticeMap, type MapPoint } from "./notice-map";
import { addDays, isISODate, overlaps, receiptStatus, todayKST, type ReceiptStatus } from "@/lib/status";

// 기간 필터로 거슬러 올라갈 수 있는 최대 일수 (API 호출량 제한)
const MAX_BACK_DAYS = 365;

const DATE =
  "h-11 rounded-lg border border-zinc-300 bg-white px-4 transition-colors hover:border-zinc-400 focus-visible:border-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:scheme-dark dark:hover:border-zinc-500 dark:focus-visible:border-zinc-100 dark:focus-visible:outline-zinc-100";

// 기본 화살표는 오른쪽 끝에 붙어 있어서 숨기고 globals.css의 .select-chevron으로 직접 그린다
const SELECT =
  "h-11 min-w-36 cursor-pointer appearance-none rounded-lg border border-zinc-300 bg-white select-chevron bg-[length:1.25rem] bg-[position:right_0.75rem_center] bg-no-repeat pl-4 pr-10 transition-colors hover:border-zinc-400 focus-visible:border-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500 dark:focus-visible:border-zinc-100 dark:focus-visible:outline-zinc-100";

const BADGE: Record<ReceiptStatus, string> = {
  접수중: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  접수예정: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100",
  마감: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">집.zip - 청약 공고 한눈에 보기</h1>
      <p className="mt-1">손쉽게 청약 공고를 확인하실 수 있어요.</p>
      <p className="mt-1 text-sm text-zinc-500">
        분양·무순위·오피스텔·임대 공고 (기간을 고르지 않으면 최근 60일 공고)
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        출처: 청약홈. 신청 전 반드시 공고문을 확인하세요.
      </p>
      <p className="mt-1 text-sm text-red-400">
        본 청약 내용은 정확하지 않을 수도 있어요. 신청 전 반드시 공고문과 청약홈 등의 정식 청약 공고 홈페이지의 정보를 확인하세요.
      </p>
      <Suspense fallback={<p className="mt-8">불러오는 중…</p>}>
        <NoticeList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function NoticeList({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = await searchParams;
  const { region, status, kind, dev } = params;
  const view = params.view === "map" ? "map" : "list";
  await connection(); // 오늘 날짜 기준 판정이라 요청 시점에 렌더
  const today = todayKST();

  // 접수기간 필터. 잘못된 날짜는 무시하고, 앞뒤가 바뀌면 바로잡는다.
  const minDate = addDays(today, -MAX_BACK_DAYS);
  let from = isISODate(params.from) ? params.from : undefined;
  let to = isISODate(params.to) ? params.to : undefined;
  if (from && to && from > to) [from, to] = [to, from];
  if (from && from < minDate) from = minDate;
  // 공고일은 접수 시작보다 앞서므로, 선택한 시작일보다 60일 앞선 공고부터 받아온다.
  const since = addDays(from && from < today ? from : today, -60);

  const all = (await getNotices(since)).map((n) => ({
    ...n,
    status: receiptStatus(n.RCEPT_BGNDE, n.RCEPT_ENDDE, today),
  }));
  const regions = [...new Set(all.map((n) => n.SUBSCRPT_AREA_CODE_NM))].sort();
  const list = all.filter(
    (n) =>
      (!region || n.SUBSCRPT_AREA_CODE_NM === region) &&
      (!status || n.status === status) &&
      (!kind || n.KIND === kind) &&
      (!dev || developerGroup(n.BSNS_MBY_NM) === dev) &&
      overlaps(n.RCEPT_BGNDE, n.RCEPT_ENDDE, from, to),
  );

  return (
    <>
      {/* ponytail: GET 폼이라 클라이언트 JS 없이 필터가 URL에 남는다 */}
      <form className="mt-6 flex flex-wrap gap-3 text-sm">
        <input type="hidden" name="view" value={view} />
        {/* legend는 flex 안에서 배치가 불안정해서, fieldset은 블록으로 두고 입력칸만 안쪽 div에서 flex로 */}
        <fieldset className="w-full">
          <legend className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">접수기간</legend>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" name="from" aria-label="접수기간 시작일" defaultValue={from ?? ""} min={minDate} className={DATE} />
            <span className="text-zinc-400" aria-hidden>
              ~
            </span>
            <input type="date" name="to" aria-label="접수기간 종료일" defaultValue={to ?? ""} min={minDate} className={DATE} />
          </div>
        </fieldset>
        <select name="region" defaultValue={region ?? ""} className={SELECT}>
          <option value="">전체 지역</option>
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className={SELECT}>
          <option value="">전체 상태</option>
          <option>접수중</option>
          <option>접수예정</option>
          <option>마감</option>
        </select>
        <select name="kind" defaultValue={kind ?? ""} className={SELECT}>
          <option value="">전체 유형</option>
          {Object.keys(KINDS).map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <select name="dev" defaultValue={dev ?? ""} className={SELECT} aria-label="사업주체">
          <option value="">전체 사업주체</option>
          {DEVELOPER_GROUPS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <button className="h-11 rounded-lg bg-zinc-900 px-5 font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
          검색
        </button>
      </form>

      <nav className="mt-6 flex items-center gap-1 text-sm" aria-label="보기 방식">
        {(["list", "map"] as const).map((v) => (
          <Link
            key={v}
            href={`/?${new URLSearchParams({ ...pick({ region, status, kind, dev, from, to }), view: v })}`}
            aria-current={view === v ? "page" : undefined}
            className="rounded-lg px-4 py-2 text-zinc-600 hover:bg-zinc-100 aria-[current=page]:bg-zinc-900 aria-[current=page]:text-white dark:text-zinc-400 dark:hover:bg-zinc-800 dark:aria-[current=page]:bg-zinc-100 dark:aria-[current=page]:text-zinc-900"
          >
            {v === "list" ? "목록" : "지도"}
          </Link>
        ))}
        <span className="ml-auto text-zinc-500">{list.length}건</span>
      </nav>
      <hr className="mt-3"/>
      {view === "map" ? <MapSection list={list} /> : <ul className="mt-4 divide-y rounded border">
        {list.length === 0 && <li className="p-4 text-zinc-500">조건에 맞는 공고가 없습니다.</li>}
        {list.map((n) => (
          <li key={`${n.KIND}-${n.HOUSE_MANAGE_NO}-${n.PBLANC_NO}`} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${BADGE[n.status]}`}>
                {n.status}
              </span>
              <span className="rounded border px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {n.KIND}
              </span>
              <a href={n.PBLANC_URL} target="_blank" rel="noreferrer" className="font-semibold hover:underline">
                {n.HOUSE_NM}
              </a>
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{n.HSSPLY_ADRES}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              사업주체 <span className="font-medium">{developerGroup(n.BSNS_MBY_NM)}</span> · {n.BSNS_MBY_NM}
            </p>
            <p className="mt-1 text-sm">
              접수 {n.RCEPT_BGNDE} ~ {n.RCEPT_ENDDE} · {n.TOT_SUPLY_HSHLDCO.toLocaleString()}세대
            </p>
          </li>
        ))}
      </ul>}
    </>
  );
}

// 빈 필터 값은 URL에 남기지 않는다.
function pick(o: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(Object.entries(o).filter((e): e is [string, string] => typeof e[1] === "string" && e[1] !== ""));
}

type Row = Notice & { status: ReceiptStatus };

async function MapSection({ list }: { list: Row[] }) {
  const addrs = [...new Set(list.map((n) => n.HSSPLY_ADRES))];
  const geo = new Map<string, Geo | null>();
  let failed = 0;
  // ponytail: 5개씩 나눠 호출한다. 첫 호출 이후로는 주소별 캐시에서 바로 나온다.
  for (let i = 0; i < addrs.length; i += 5) {
    await Promise.all(
      addrs.slice(i, i + 5).map(async (a) => {
        try {
          geo.set(a, await geocode(a));
        } catch (e) {
          console.error("[geocode]", a, e);
          failed++;
          geo.set(a, null);
        }
      }),
    );
  }

  // 다른 주소라도 같은 좌표(예: 같은 동 근사 위치)면 핀 하나로 묶는다.
  const byPos = new Map<string, MapPoint>();
  let missing = 0;
  for (const n of list) {
    const g = geo.get(n.HSSPLY_ADRES);
    if (!g) {
      missing++;
      continue;
    }
    const key = `${g.lat},${g.lng}`;
    const p = byPos.get(key) ?? { ...g, notices: [] };
    p.exact &&= g.exact;
    p.notices.push({
      id: `${n.KIND}-${n.HOUSE_MANAGE_NO}-${n.PBLANC_NO}`,
      name: n.HOUSE_NM,
      kind: n.KIND,
      status: n.status,
      begin: n.RCEPT_BGNDE,
      end: n.RCEPT_ENDDE,
      url: n.PBLANC_URL,
    });
    byPos.set(key, p);
  }

  return (
    <>
      <NoticeMap points={[...byPos.values()]} />
      {missing > 0 && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
          위치를 찾지 못한 공고 {missing}건은 지도에 표시되지 않았습니다
          {failed > 0 && ` (지오코딩 오류 ${failed}건)`}. 목록에서 확인하세요.
        </p>
      )}
    </>
  );
}
