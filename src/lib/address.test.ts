import { test } from "node:test";
import assert from "node:assert/strict";
import { addressCandidates } from "./address.ts";

// 실제 청약홈 공고 주소. 각 줄의 기대값은 네이버 Geocoding에서 처음으로 성공한 후보다.
const firstHit = (raw: string, hit: string) => {
  const qs = addressCandidates(raw).map((c) => c.q);
  assert.ok(qs.includes(hit), `${raw}\n  후보: ${JSON.stringify(qs)}\n  기대: ${hit}`);
};

test("원본 주소가 항상 첫 후보", () => {
  const raw = "서울특별시 강서구 방화동 584-1";
  assert.deepEqual(addressCandidates(raw)[0], { q: raw, exact: true });
});

test("괄호 안의 실제 주소를 꺼낸다", () => {
  firstHit("경기도 파주시 파주운정3지구 주상복합 4블록(경기도 파주시 동패동 400-7번지 일원)", "경기도 파주시 동패동 400-7");
  firstHit("경기도 과천시 과천지식정보타운 공공주택지구 S6BL (과천대로8길 65, 과천푸르지오벨라르테)", "과천대로8길 65");
  firstHit("광주연구개발특구 첨단3지구 A6블록(전남광주통합특별시 북구 월출동) ", "전남광주통합특별시 북구 월출동");
});

test("시·군이 빠진 괄호 주소에 바깥 행정구역을 붙인다", () => {
  firstHit("경기도 안성시 아양지구 B-2블록 (옥산동 659번지)", "경기도 안성시 옥산동 659");
});

test("지구·블록명 앞 행정구역까지만 남긴다", () => {
  firstHit("경기도 시흥시 거모동 시흥거모지구 B-5블록", "경기도 시흥시 거모동");
  firstHit("인천광역시 검단구 불로동 검단신도시 AA22블록", "인천광역시 검단구 불로동");
  firstHit("경기도 남양주시 진접읍, 진건읍, 퇴계원읍 일원, 남양주왕숙 공공주택지구 내 A-2블록", "경기도 남양주시 진접읍");
});

test("신설 특례시 행정구는 빼고 재시도한다", () => {
  firstHit("경기도 화성특례시 동탄구 반송동 99번지[동탄(1) M1-2-2블록]", "경기도 화성시 반송동 99");
  firstHit("경기도 화성특례시 효행구 봉담읍 삼봉안길 30 (봉담내리지구 A1블록 봉담자이 프라이드시티)", "경기도 화성시 봉담읍 삼봉안길 30");
});

test("끝 단어를 줄인 후보는 근사(exact: false)로 표시한다", () => {
  const c = addressCandidates("경기도 평택시 고덕동 고덕면 일원(평택고덕국제화계획지구 A65BL)");
  assert.deepEqual(c.find((x) => x.q === "경기도 평택시 고덕동"), { q: "경기도 평택시 고덕동", exact: false });
  assert.equal(c.find((x) => x.q === "경기도 파주시 동패동 400-7")?.exact, undefined);
  assert.equal(addressCandidates("경기도 파주시 동패동 400-7번지 일원").find((x) => x.q === "경기도 파주시 동패동 400-7")?.exact, true);
});

test("후보에 중복이 없다", () => {
  const qs = addressCandidates("경기도 시흥시 하중동 일원 (시흥하중 공공주택지구 내 A-4블록)").map((c) => c.q);
  assert.equal(qs.length, new Set(qs).size);
});
