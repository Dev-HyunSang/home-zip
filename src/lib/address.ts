// 청약 공고 주소("…일원", "…지구 내 A-2블록", "(실제 주소)")를 지오코딩 가능한 후보로 바꾼다.
// 앞에서부터 순서대로 시도하고, 처음 성공한 후보를 쓴다.

export type Candidate = { q: string; exact: boolean };

const ADMIN = /^[가-힣0-9]+(특별자치도|특별자치시|특별시|광역시|도|시|군|구|읍|면|동|리|가)$/;
const LOT = /^(산\s?)?\d+(-\d+)?(번지)?$/;
const ROAD = /^[가-힣0-9]+(로|길)$/;
// "시흥거모지구", "검단신도시", "연구개발특구"는 시·구로 끝나지만 행정구역이 아니다.
const NOT_ADMIN = /(지구|신도시|특구)$/;

// 앞에서부터 행정구역 → (도로명 + 번호 | 지번)까지만 남긴다. 지구명·블록명이 나오면 멈춘다.
function addressPrefix(text: string): Candidate | null {
  const tokens = text.replace(/[,，]/g, " , ").split(/\s+/).filter(Boolean);
  const kept: string[] = [];
  let exact = false;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === ",") break; // "진접읍, 진건읍, …" 처럼 나열되면 첫 지역만
    if (ROAD.test(t) && LOT.test(tokens[i + 1] ?? "")) {
      kept.push(t, tokens[i + 1].replace("번지", ""));
      exact = true;
      break;
    }
    if (LOT.test(t)) {
      if (kept.length === 0) return null;
      kept.push(t.replace("번지", ""));
      exact = true;
      break;
    }
    if (!ADMIN.test(t) || NOT_ADMIN.test(t)) break;
    kept.push(t);
  }
  // 시·도 하나만 남으면 지도에 찍을 의미가 없다.
  return kept.length >= 2 ? { q: kept.join(" "), exact } : null;
}

export function addressCandidates(raw: string): Candidate[] {
  const addr = raw.trim();
  const inner = [...addr.matchAll(/[(\[]([^)\]]+)[)\]]/g)].map((m) => m[1].trim());
  const outer = addr.replace(/[(\[][^)\]]*[)\]]/g, " ");
  const outerPrefix = addressPrefix(outer);

  const list: (Candidate | null)[] = [{ q: addr, exact: true }];
  for (const s of inner) {
    const p = addressPrefix(s);
    list.push(p);
    // "(옥산동 659번지)" 처럼 시·군이 빠진 괄호는 바깥 행정구역을 앞에 붙인다.
    if (outerPrefix && p) {
      const region = outerPrefix.q.split(" ").filter((t) => /(도|시|군|구)$/.test(t)).join(" ");
      list.push({ q: `${region} ${p.q}`, exact: p.exact });
    }
  }
  list.push(outerPrefix);

  if (outerPrefix) {
    // 신설 행정구(화성특례시 동탄구 등)는 지도 DB에 없을 수 있다 → "화성시 반송동 99"로 재시도
    const legacy = outerPrefix.q.replace(/(\S+)특례시 \S+구(?= )/, "$1시");
    if (legacy !== outerPrefix.q) list.push({ q: legacy, exact: outerPrefix.exact });

    // 마지막으로 끝 단어를 하나씩 줄여 근사 위치라도 찾는다 ("고덕동 고덕면" → "고덕동")
    for (const base of new Set([legacy, outerPrefix.q])) {
      const t = base.split(" ");
      for (let n = t.length - 1; n >= 2; n--) list.push({ q: t.slice(0, n).join(" "), exact: false });
    }
  }

  const seen = new Set<string>();
  return list.filter((c): c is Candidate => !!c && !seen.has(c.q) && !!seen.add(c.q));
}
