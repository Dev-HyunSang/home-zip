import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "./content.ts";

test("frontmatter: key: value, URL의 콜론, 따옴표, CRLF", () => {
  const { meta, body } = parseFrontmatter('---\r\ntitle: "가점제"\r\nsourceUrl: https://a.b/c\r\n---\r\n본문');
  assert.deepEqual(meta, { title: "가점제", sourceUrl: "https://a.b/c" });
  assert.equal(body, "본문");
});

test("frontmatter 없으면 전체가 본문", () => {
  assert.deepEqual(parseFrontmatter("# 제목"), { meta: {}, body: "# 제목" });
});
