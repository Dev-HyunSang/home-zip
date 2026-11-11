// 현재 청약 공고 주소를 좌표로 바꿔 data/geocode.json에 저장한다.
// 실행: npm run geocode   (공고가 새로 올라오면 다시 실행하고 커밋)
import { readFileSync, writeFileSync } from "node:fs";
import { fetchNotices } from "../src/lib/applyhome.ts";
import { geocodeLive, type GeoFile } from "../src/lib/geocode.ts";

const FILE = new URL("../data/geocode.json", import.meta.url);
const old: GeoFile = JSON.parse(readFileSync(FILE, "utf8"));

const addrs = [...new Set((await fetchNotices()).map((n) => n.HSSPLY_ADRES))];
// 이미 좌표가 있는 주소는 다시 부르지 않는다. 실패(null)였던 주소는 규칙이 바뀌었을 수 있으니 재시도.
const todo = addrs.filter((a) => !old[a]);

const next: GeoFile = {};
for (const a of addrs) if (old[a]) next[a] = old[a];

let failed = 0;
for (let i = 0; i < todo.length; i += 5) {
  await Promise.all(
    todo.slice(i, i + 5).map(async (a) => {
      next[a] = await geocodeLive(a);
      if (!next[a]) {
        failed++;
        console.warn("  ✗ 위치를 찾지 못함:", a);
      }
    }),
  );
}

// 지난 공고 주소는 빼고, 키를 정렬해서 diff가 작게 남도록 저장한다.
const sorted = Object.fromEntries(Object.keys(next).sort().map((k) => [k, next[k]]));
writeFileSync(FILE, JSON.stringify(sorted, null, 2) + "\n");

const values = Object.values(sorted);
console.log(
  `주소 ${addrs.length}개 · 새로 변환 ${todo.length}개 · 정확 ${values.filter((g) => g?.exact).length} · 근사 ${values.filter((g) => g && !g.exact).length} · 실패 ${failed} · 삭제(지난 공고) ${Object.keys(old).filter((k) => !(k in sorted)).length}`,
);
