import type { Metadata } from "next";
import { getArticles } from "@/lib/content";
import { GuideView } from "../guide-view";

export const metadata: Metadata = {
  title: "정부 정책",
  description: "주택 관련 정부 정책 안내",
};

export default function PolicyPage() {
  return (
    <GuideView
      title="정부 정책"
      intro="주택 관련 정부 정책을 한눈에 정리했어요."
      entries={getArticles("policy")}
      footer="해당 정보는 AI 서비스를 이용하여 요약했으며, 자세한 내용은 출처 링크를 확인 바랍니다."
    />
  );
}
