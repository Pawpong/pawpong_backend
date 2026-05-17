---
name: pawpong-commit
description: 기능 단위로 파일을 선택해 컨벤션에 맞는 커밋 메시지로 커밋합니다.
---

# pawpong-commit

기능 단위 커밋을 위한 스킬. 변경된 파일을 보여주고 사용자가 이번 커밋에 포함할 파일을 선택하면, 브랜치/이슈 컨텍스트를 읽어 커밋 메시지를 자동 제안하고 커밋한다.

## 0. 트리거

| 입력 | 동작 |
|---|---|
| `/pawpong-commit` | 변경 파일 목록 → 선택 → 커밋 |
| `/pawpong-commit all` | 변경된 모든 파일을 한 번에 커밋 (스테이징 포함) |

## 1. 실행 순서

### Step 1 — 변경 파일 확인

```bash
git status --short
git diff --stat HEAD
```

변경 파일이 없으면: "커밋할 변경 사항이 없습니다." 종료.

이미 스테이징된 파일이 있으면 따로 표시:
```
[스테이징됨]
  M  src/api/home/home.service.ts

[변경됨 (미스테이징)]
  M  src/api/home/home.controller.ts
  A  src/api/home/dto/response/home-summary-response.dto.ts
```

### Step 2 — 이번 커밋에 포함할 파일 선택

```
이번 커밋에 포함할 파일을 선택하세요.
(쉼표로 구분, 번호 입력, 'a' = 전체, 'q' = 취소)

  1. src/api/home/home.service.ts              [수정]
  2. src/api/home/home.controller.ts           [수정]
  3. src/api/home/dto/response/home-summary-response.dto.ts  [신규]

선택: 
```

- `a` 입력 시 전체 선택
- 번호 복수 입력: `1,3`
- `q` 입력 시 취소

### Step 3 — 커밋 메시지 자동 제안

현재 브랜치명 + 선택 파일 분석:

```bash
git branch --show-current
# feat/3.1-home-summary
```

파일 종류별 type 추론:
- `*.spec.ts`, `test/` → `test`
- `*.dto.ts` → `feat` (새 파일) / `refactor` (수정)
- `*.controller.ts`, `*.service.ts` → `feat` / `fix` / `refactor`
- `*.module.ts` → `chore`
- `*.md` → `docs`

scope 추론: 파일 경로에서 `src/api/<scope>/` 추출.

제안 메시지 예시:
```
제안 커밋 메시지:
  feat(home): 홈 통합 API 응답 DTO 정의

수정하거나 Enter로 확정:
```

사용자가 Enter → 제안 그대로 사용.
직접 입력 → 입력한 메시지 사용.

### Step 4 — 커밋 실행

```bash
git add <선택한 파일들>
git commit -m "<메시지>"
```

커밋 성공 시:
```
✅ 커밋 완료: feat(home): 홈 통합 API 응답 DTO 정의
   (3 files changed, 87 insertions)

남은 변경 파일: 2개
다음: /pawpong-commit 으로 다음 단위 커밋 또는 /pawpong-pr 로 PR 생성
```

커밋 실패 시 오류 그대로 출력 + 원인 분석.

## 2. 커밋 메시지 컨벤션

```
<type>[(scope)]: <한국어 설명>

[선택 본문]

[선택] Refs #<이슈번호>
```

| type | 용도 |
|---|---|
| `feat` | 신규 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변경 없는 코드 개선 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드/설정/의존성 |
| `docs` | 문서 |
| `ci` | CI/CD |

scope 예시: `home`, `auth`, `notification`, `breeder`, `chat`

## 3. 원칙

- `git push` 자동 실행 절대 X
- 파일 선택은 반드시 사용자가 직접
- `git add .` / `git add -A` 사용 X — 선택한 파일만 스테이징
- `.env`, 시크릿 파일이 선택 목록에 있으면 ⚠️ 경고 후 제외 권고
- 커밋 메시지 자동 수정 X — 사용자 확정 후 실행
