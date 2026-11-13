import type { Metadata } from "next";
import { getArticles } from "@/lib/content";
import { GuideView } from "../guide-view";

export const metadata: Metadata = {
  title: "청약 가이드",
  description: "주택 청약 당첨 기준과 자격 조건 안내",
};

export default function GuidePage() {
  return <GuideView title="청약 가이드" intro="당첨 기준과 자격 조건을 한눈에 정리했어요." entries={getArticles("guide")} />;
}
