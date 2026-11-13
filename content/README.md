# 콘텐츠 작성법

- `guide/` → /guide (청약 가이드), `policy/` → /policy (정부 정책)
- 글 하나 = `.md` 파일 하나. 파일명 순서대로 보인다 (`01-`, `02-` 로 순서 지정).
- `_`로 시작하는 파일은 화면에 안 나온다 (초안·템플릿용). `_template.md`를 복사해서 시작하세요.
- frontmatter는 `key: value` 한 줄씩만 쓴다.

| key | 필수 | 설명 |
|---|---|---|
| title | O | 카드 제목 |
| category | O | 같은 값끼리 묶인다 |
| effective | | 시행일. 제목 옆에 "시행 ○○" 배지로 보인다 |
| published | | 발표·공개일. 시행일이 없으면 "공개 ○○" 배지로 보인다 |
| summary | | 접힌 상태에서 보이는 한 줄 |
| source / sourceUrl | | 출처 이름과 링크 |
| updated | | 마지막 확인일 (YYYY-MM-DD) |
