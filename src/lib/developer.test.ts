import { test } from "node:test";
import assert from "node:assert/strict";
import { developerGroup } from "./developer.ts";

// 실제 청약홈 사업주체 이름들
test("developerGroup", () => {
  const cases: [string, string][] = [
    ["한국토지주택공사 경기남부지역본부", "LH"],
    ["한국토지주택공사인천지역본부", "LH"],
    ["한국토지주택공사, 우미건설(주),신동아건설(주)", "LH"],
    ["서울주택도시개발공사", "SH"],
    ["서울주택도시공사", "SH"],
    ["경기주택도시공사", "GH"],
    ["부산도시공사,(주)대우건설,(주)에이치제이중공업", "지방공사·공공기관"],
    ["제주특별자치도개발공사", "지방공사·공공기관"],
    ["공무원연금공단", "지방공사·공공기관"],
    ["강변사정동지역주택조합", "조합"],
    ["느티마을4단지 리모델링주택조합", "조합"],
    ["케이비부동산신탁(주)", "신탁사"],
    ["주식회사 하나자산신탁", "신탁사"],
    ["대방건설 주식회사", "민간"],
    // 조합이 첫 주체가 아니면 첫 주체 기준
    ["(주)한국토지신탁,산곡6주택재개발정비사업조합", "신탁사"],
  ];
  for (const [name, group] of cases) assert.equal(developerGroup(name), group, name);
});
