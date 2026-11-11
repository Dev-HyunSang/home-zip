// 사업주체(BSNS_MBY_NM) 이름 430여 개를 필터용 분류로 묶는다.
// 공동사업은 "한국토지주택공사,지에스건설(주),…" 처럼 쉼표로 이어지므로 첫 번째 주체로 분류한다.

export const DEVELOPER_GROUPS = ["LH", "SH", "GH", "지방공사·공공기관", "조합", "신탁사", "민간"] as const;
export type DeveloperGroup = (typeof DEVELOPER_GROUPS)[number];

export function developerGroup(name: string): DeveloperGroup {
  const first = name.split(/[,，]/)[0].trim();
  if (/^한국토지주택공사/.test(first)) return "LH";
  // 청약홈에는 SH가 옛 이름 "서울주택도시개발공사"로 들어온다.
  if (/^서울주택도시(개발)?공사/.test(first)) return "SH";
  if (/^경기주택도시공사/.test(first)) return "GH";
  if (/(공사|공단)$/.test(first)) return "지방공사·공공기관";
  if (/조합$/.test(first)) return "조합";
  if (/신탁/.test(first)) return "신탁사";
  return "민간";
}
