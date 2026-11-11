// 청약 당첨·자격 조건 안내. 여기만 고치면 /guide 화면에 반영된다.
// ponytail: DB/관리자 화면 없이 파일로 관리. 비개발자가 수정해야 하면 그때 CMS를 붙인다.

export type GuideEntry = {
  category: string; // 같은 category끼리 묶여서 보인다 (예: "자격 조건", "당첨 기준", "특별공급")
  title: string;
  summary?: string; // 접힌 상태에서 제목 아래 보이는 한 줄
  conditions?: [label: string, value: string][]; // 항목 - 내용 표
  notes?: string[]; // 참고 사항 (글머리표)
  source?: { label: string; url: string }; // 근거 링크
  updated?: string; // YYYY-MM-DD, 마지막 확인일
};

export const GUIDE: GuideEntry[] = [
  // 아래는 형식 예시. 실제 내용으로 바꾸거나 지우세요.
  {
    category: "자격 조건",
    title: "(예시) 항목 제목",
    summary: "접힌 상태에서 보이는 한 줄 요약",
    conditions: [
      ["항목 1", "내용 1"],
      ["항목 2", "내용 2"],
    ],
    notes: ["참고 사항을 적어요."],
    source: { label: "청약홈", url: "https://www.applyhome.co.kr" },
    updated: "2026-11-11",
  },
];
