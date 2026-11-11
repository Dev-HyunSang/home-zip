import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, isISODate, overlaps, receiptStatus, toISODate, todayKST } from "./status.ts";

test("receiptStatus", () => {
  assert.equal(receiptStatus("2026-11-10", "2026-11-12", "2026-11-09"), "접수예정");
  assert.equal(receiptStatus("2026-11-10", "2026-11-12", "2026-11-10"), "접수중");
  assert.equal(receiptStatus("2026-11-10", "2026-11-12", "2026-11-12"), "접수중");
  assert.equal(receiptStatus("2026-11-10", "2026-11-12", "2026-11-13"), "마감");
});

test("todayKST는 UTC 15시 이후를 다음 날로 본다", () => {
  assert.equal(todayKST(new Date("2026-11-06T14:59:00Z")), "2026-11-06");
  assert.equal(todayKST(new Date("2026-11-06T15:00:00Z")), "2026-11-07");
});

test("toISODate는 YYYYMMDD만 바꾸고 나머지는 그대로 둔다", () => {
  assert.equal(toISODate("20261028"), "2026-10-28");
  assert.equal(toISODate("2026-10-28"), "2026-10-28");
  assert.equal(toISODate(""), "");
  // 회귀: 하이픈 없는 마감 공고가 "접수예정"으로 나오던 버그
  assert.equal(receiptStatus(toISODate("20261026"), toISODate("20261028"), "2026-11-06"), "마감");
});

test("isISODate는 실제로 있는 날짜만 통과시킨다", () => {
  assert.equal(isISODate("2026-11-06"), true);
  assert.equal(isISODate("2026-02-30"), false);
  assert.equal(isISODate("2026-13-01"), false);
  assert.equal(isISODate("20261106"), false);
  assert.equal(isISODate(["2026-11-06"]), false);
  assert.equal(isISODate(undefined), false);
});

test("overlaps는 접수기간과 선택 기간이 겹치는지 본다 (경계 포함)", () => {
  const [b, e] = ["2026-11-10", "2026-11-12"];
  assert.equal(overlaps(b, e, "2026-11-01", "2026-11-09"), false); // 전부 이전
  assert.equal(overlaps(b, e, "2026-11-01", "2026-11-10"), true); // 시작일에 걸침
  assert.equal(overlaps(b, e, "2026-11-11", "2026-11-11"), true); // 안쪽
  assert.equal(overlaps(b, e, "2026-11-12", "2026-11-30"), true); // 종료일에 걸침
  assert.equal(overlaps(b, e, "2026-11-13", "2026-11-30"), false); // 전부 이후
  assert.equal(overlaps(b, e, undefined, "2026-11-10"), true);
  assert.equal(overlaps(b, e, "2026-11-13", undefined), false);
  assert.equal(overlaps(b, e), true);
});

test("addDays", () => {
  assert.equal(addDays("2026-11-06", -60), "2026-09-07");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});
