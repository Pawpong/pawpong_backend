---
name: pawpong-note
description: 작업 중 발견한 문제/결정 사항을 브랜치별 노트 파일에 빠르게 캡처합니다.
---

# pawpong-note

개발 중 발견한 버그, 결정 사항, 나중에 처리할 것들을 흐름을 끊지 않고 기록한다.  
노트는 `.claude/notes/<브랜치명>.md`에 저장되고, `/pawpong pr` 시 PR 본문에 자동 포함된다.

## 0. 트리거

| 입력 | 동작 |
|---|---|
| `/pawpong-note <설명>` | 한 줄 설명으로 즉시 캡처 |
| `/pawpong-note` | 입력 프롬프트 표시 |
| `/pawpong-note list` | 현재 브랜치 노트 목록 조회 |

## 1. 실행 순서

### Step 1 — 브랜치 확인

```bash
git branch --show-current
```

`feat/3.*` 브랜치가 아니면: "작업 브랜치에서 실행해주세요." 경고 후 계속 진행 여부 확인.

### Step 2 — 타입 자동 추론

입력 텍스트에서 타입 판단:

| 타입 | 의미 | 키워드 예시 |
|---|---|---|
| `bug` | 버그/에러 발견 | 에러, 실패, 안 됨, null, 예외, crash |
| `question` | 확인 필요 사항 | 확인 필요, 모르겠음, 어떻게, 맞나, 왜 |
| `debt` | 기술 부채 | 나중에, 일단, 임시, 하드코딩, 리팩토링, TODO |
| `decision` | 설계/정책 결정 | 결정, ~하기로, 정책, ~로 통일 |
| `note` | 기타 | (위 어디에도 해당 없을 때) |

### Step 3 — 노트 파일에 추가

```bash
BRANCH=$(git branch --show-current)
NOTE_FILE=".claude/notes/${BRANCH}.md"
mkdir -p .claude/notes
```

파일 없으면 헤더 생성 후 추가. 있으면 그냥 추가.

파일 형식:
```markdown
# <브랜치명> 작업 노트

- [HH:MM] [bug] OptionalJwtAuthGuard null 반환 시 타입 에러 발생
- [HH:MM] [question] getSummary Promise.all 순서 보장 확인 필요
- [HH:MM] [decision] 비회원 unreadCount 기본값 0으로 정의
- [HH:MM] [debt] 배너 캐싱 로직 나중에 Redis로 교체 필요
```

완료 출력:
```
✅ 노트 추가: [bug] OptionalJwtAuthGuard null 반환 시 타입 에러 발생
   .claude/notes/feat-3.1-home-summary.md (총 3개)
```

### Step 4 — `list` 모드

```
[feat/3.1-home-summary 작업 노트]

  [bug]      OptionalJwtAuthGuard null 반환 시 타입 에러 발생   10:23
  [question] getSummary Promise.all 순서 보장 확인 필요         11:05
  [decision] 비회원 unreadCount 기본값 0으로 정의               14:30
  [debt]     배너 캐싱 Redis 교체 필요                          15:12

총 4개 · .claude/notes/feat-3.1-home-summary.md
```

노트 없으면: "아직 노트가 없습니다. /pawpong-note <설명> 으로 추가하세요."

## 2. PR 연동

`/pawpong pr` 또는 `/pawpong-pr` 실행 시 노트 파일을 자동으로 읽어 PR 본문에 포함:

```markdown
## 작업 중 발견한 이슈
- [bug] OptionalJwtAuthGuard null 반환 시 타입 에러 → 이번 PR에서 처리
- [question] Promise.all 순서 보장 → 확인 완료
- [decision] 비회원 unreadCount 기본값 0으로 정의
- [debt] 배너 캐싱 Redis 교체 → 별도 이슈로 관리 예정
```

노트 파일 없으면 해당 섹션 생략.

## 3. 원칙

- 노트 파일은 `.gitignore`에 추가 권장 (개인 작업 메모라 커밋 불필요)
- 파일 수정은 노트 파일만 — 소스코드 자동 수정 X
- 타입 추론이 애매하면 `note`로 폴백, 사용자 수정 기회 제공
- 흐름을 최소한으로 끊는 것이 목표 — 확인 없이 즉시 저장
