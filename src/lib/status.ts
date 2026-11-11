export type ReceiptStatus = "접수예정" | "접수중" | "마감";

// 날짜는 모두 "YYYY-MM-DD" 문자열이라 문자열 비교로 충분하다.
export function receiptStatus(begin: string, end: string, today: string): ReceiptStatus {
  if (today < begin) return "접수예정";
  if (today <= end) return "접수중";
  return "마감";
}

// 서버 시간대와 무관하게 한국 날짜를 쓴다.
export function todayKST(now = new Date()): string {
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

// 청약홈 API마다 날짜 형식이 다르다 (YYYY-MM-DD / YYYYMMDD). 비교 전에 하나로 맞춘다.
export function toISODate(s: string): string {
  return /^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}` : s;
}

export function addDays(iso: string, n: number): string {
  return new Date(Date.parse(iso) + n * 86400_000).toISOString().slice(0, 10);
}

// URL 쿼리로 들어온 값 검증. "2026-02-30"은 Date가 3월 2일로 넘겨버리니 왕복 비교로 거른다.
export function isISODate(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = Date.parse(s);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === s;
}

// 접수기간 [begin, end]이 선택 기간 [from, to]과 하루라도 겹치면 true. 한쪽이 비면 그쪽은 제한 없음.
export function overlaps(begin: string, end: string, from?: string, to?: string): boolean {
  return (!from || end >= from) && (!to || begin <= to);
}
