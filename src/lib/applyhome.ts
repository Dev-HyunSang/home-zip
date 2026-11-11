import { addDays, toISODate, todayKST } from "./status.ts";

// 한국부동산원 청약홈 분양정보 조회 서비스 (data.go.kr → api.odcloud.kr)
const BASE = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/";
const PER_PAGE = 500;

// 공급 유형 → API 오퍼레이션. 모두 같은 서비스키로 호출된다.
export const KINDS = {
  APT: "getAPTLttotPblancDetail",
  무순위: "getRemndrLttotPblancDetail",
  임의공급: "getOPTLttotPblancDetail",
  "오피스텔·도시형": "getUrbtyOfctlLttotPblancDetail",
  공공지원민간임대: "getPblPvtRentLttotPblancDetail",
} as const;
export type Kind = keyof typeof KINDS;

export type Notice = {
  KIND: Kind;
  HOUSE_MANAGE_NO: string;
  PBLANC_NO: string;
  HOUSE_NM: string;
  HSSPLY_ADRES: string;
  SUBSCRPT_AREA_CODE_NM: string;
  RCRIT_PBLANC_DE: string;
  RCEPT_BGNDE: string;
  RCEPT_ENDDE: string;
  TOT_SUPLY_HSHLDCO: number;
  PBLANC_URL: string;
  BSNS_MBY_NM: string; // 사업주체 (5개 API 모두 같은 이름의 필드)
};

// 캐시 없는 원본 호출. 화면에서는 cached.ts의 getNotices를 쓴다 (scripts/geocode.ts는 Next 밖이라 이걸 직접 쓴다).
// since: 이 날짜 이후 공고일(RCRIT_PBLANC_DE)인 공고만. 기본은 최근 60일.
export async function fetchNotices(since = addDays(todayKST(), -60)): Promise<Notice[]> {
  const key = process.env.APPLY_HOME_API_KEY;
  if (!key) return SAMPLE; // ponytail: 키 없을 때 화면 확인용

  const serviceKey = decodeURIComponent(key); // Encoding/Decoding 키 둘 다 허용 (이중 인코딩 방지)

  const lists = await Promise.all(
    (Object.keys(KINDS) as Kind[]).map((kind) => fetchKind(kind, serviceKey, since)),
  );
  return lists.flat().sort((a, b) => b.RCEPT_BGNDE.localeCompare(a.RCEPT_BGNDE));
}

// APT만 RCEPT_*, 나머지는 SUBSCRPT_RCEPT_* 로 접수일 필드 이름이 다르다.
type Raw = Omit<Notice, "KIND" | "RCEPT_BGNDE" | "RCEPT_ENDDE"> & {
  RCEPT_BGNDE?: string;
  RCEPT_ENDDE?: string;
  SUBSCRPT_RCEPT_BGNDE?: string;
  SUBSCRPT_RCEPT_ENDDE?: string;
};

// 이 두 유형만 날짜를 YYYYMMDD로 저장한다. 서버 필터도 같은 형식으로 보내야 걸러진다.
const COMPACT_DATE = new Set<Kind>(["임의공급", "공공지원민간임대"]);

async function fetchKind(kind: Kind, serviceKey: string, since: string): Promise<Notice[]> {
  const out: Notice[] = [];
  for (let page = 1; ; page++) {
    const qs = new URLSearchParams({
      page: String(page),
      perPage: String(PER_PAGE),
      serviceKey,
      "cond[RCRIT_PBLANC_DE::GTE]": COMPACT_DATE.has(kind) ? since.replaceAll("-", "") : since,
    });
    const res = await fetch(`${BASE}${KINDS[kind]}?${qs}`);
    // URL에 서비스키가 들어 있으니 에러 메시지에 URL을 넣지 않는다.
    if (!res.ok) throw new Error(`청약홈 API 오류 (${kind}): ${res.status}`);
    const { data }: { data: Raw[] } = await res.json();
    for (const { SUBSCRPT_RCEPT_BGNDE, SUBSCRPT_RCEPT_ENDDE, ...r } of data) {
      out.push({
        ...r,
        KIND: kind,
        RCRIT_PBLANC_DE: toISODate(r.RCRIT_PBLANC_DE),
        RCEPT_BGNDE: toISODate(r.RCEPT_BGNDE ?? SUBSCRPT_RCEPT_BGNDE ?? ""),
        RCEPT_ENDDE: toISODate(r.RCEPT_ENDDE ?? SUBSCRPT_RCEPT_ENDDE ?? ""),
      });
    }
    if (data.length < PER_PAGE) return out;
  }
}

const SAMPLE: Notice[] = [
  {
    KIND: "APT",
    HOUSE_MANAGE_NO: "2026000001",
    PBLANC_NO: "2026000001",
    HOUSE_NM: "(샘플) 한강 자이 더 리버",
    HSSPLY_ADRES: "서울특별시 마포구 상암동 일원",
    SUBSCRPT_AREA_CODE_NM: "서울",
    RCRIT_PBLANC_DE: "2026-11-01",
    RCEPT_BGNDE: "2026-11-05",
    RCEPT_ENDDE: "2026-11-07",
    TOT_SUPLY_HSHLDCO: 412,
    PBLANC_URL: "https://www.applyhome.co.kr",
    BSNS_MBY_NM: "서울주택도시개발공사",
  },
  {
    KIND: "무순위",
    HOUSE_MANAGE_NO: "2026000002",
    PBLANC_NO: "2026000002",
    HOUSE_NM: "(샘플) 동탄 푸르지오 파크",
    HSSPLY_ADRES: "경기도 화성시 동탄면 일원",
    SUBSCRPT_AREA_CODE_NM: "경기",
    RCRIT_PBLANC_DE: "2026-11-04",
    RCEPT_BGNDE: "2026-11-17",
    RCEPT_ENDDE: "2026-11-19",
    TOT_SUPLY_HSHLDCO: 980,
    PBLANC_URL: "https://www.applyhome.co.kr",
    BSNS_MBY_NM: "한국토지주택공사 경기남부지역본부",
  },
  {
    KIND: "오피스텔·도시형",
    HOUSE_MANAGE_NO: "2026000003",
    PBLANC_NO: "2026000003",
    HOUSE_NM: "(샘플) 해운대 센텀 아이파크",
    HSSPLY_ADRES: "부산광역시 해운대구 재송동 일원",
    SUBSCRPT_AREA_CODE_NM: "부산",
    RCRIT_PBLANC_DE: "2026-10-10",
    RCEPT_BGNDE: "2026-10-20",
    RCEPT_ENDDE: "2026-10-22",
    TOT_SUPLY_HSHLDCO: 655,
    PBLANC_URL: "https://www.applyhome.co.kr",
    BSNS_MBY_NM: "강변사정동지역주택조합",
  },
];
