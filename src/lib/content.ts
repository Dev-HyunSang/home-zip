import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";

// content/<폴더>/*.md 를 읽어 가이드·정책 카드로 만든다. 빌드할 때 한 번 읽힌다.
export type Article = {
  slug: string;
  category: string; // 같은 category끼리 묶여서 보인다
  title: string;
  summary?: string; // 접힌 상태에서 제목 아래 보이는 한 줄
  effective?: string; // 시행일 (자유 형식, 예: 2026-04-17)
  published?: string; // 발표·공개일. 시행일이 없을 때 대신 보인다
  source?: { label: string; url: string }; // 근거 링크
  updated?: string; // YYYY-MM-DD, 마지막 확인일
  html: string;
};

// ponytail: frontmatter는 `key: value` 한 줄짜리만 지원한다. 중첩·목록이 필요해지면 yaml 패키지
export function parseFrontmatter(src: string): { meta: Record<string, string>; body: string } {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: src };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: src.slice(m[0].length) };
}

export function getArticles(dir: "guide" | "policy"): Article[] {
  const root = path.join(process.cwd(), "content", dir);
  return readdirSync(root)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort() // 파일명 순서 = 화면 순서 (앞에 01-, 02- 를 붙이면 순서를 정할 수 있다)
    .map((f) => {
      const { meta, body } = parseFrontmatter(readFileSync(path.join(root, f), "utf8"));
      const slug = f.replace(/\.md$/, "");
      return {
        slug,
        category: meta.category || "기타",
        title: meta.title || slug,
        summary: meta.summary,
        effective: meta.effective,
        published: meta.published,
        source: meta.sourceUrl ? { label: meta.source || "출처", url: meta.sourceUrl } : undefined,
        updated: meta.updated,
        // 저장소에 커밋된 글만 렌더하므로 HTML 소독은 하지 않는다. 외부 입력을 받게 되면 sanitize 필요
        html: marked.parse(body, { async: false }),
      };
    });
}
