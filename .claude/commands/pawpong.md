---
name: pawpong
description: Pawpong 백엔드 작업 전체 워크플로우 — 이슈 선택부터 PR까지 하나의 진입점.
---

# pawpong

Pawpong 백엔드 개발 워크플로우 마스터 스킬.  
인자 없이 실행하면 **현재 git 상태를 자동 감지**해 다음 단계를 제안한다.

## 0. 명령어 일람

| 입력 | 동작 |
|---|---|
| `/pawpong` | 상태 자동 감지 → 다음 단계 제안 |
| `/pawpong status` | 진행 현황 요약 (읽기 전용) |
| `/pawpong pick` | 이슈 목록 → 선택 → 브랜치 생성 |
| `/pawpong pick <num>` | 이슈 번호 직접 지정 |
| `/pawpong pick list` | 이슈 목록만 조회 |
| `/pawpong pick mine` | 내 이슈만 |
| `/pawpong pick resume` | 진행 중 브랜치 체크아웃 |
| `/pawpong plan` | 이슈 + 코드 분석 → 구현 계획 출력 |
| `/pawpong plan <num>` | 이슈 번호 직접 지정해서 분석 |
| `/pawpong commit` | 변경 파일 선택 → 커밋 |
| `/pawpong commit all` | 변경 전체 한 번에 커밋 |
| `/pawpong pr` | PR 초안 확인 → 생성 |
| `/pawpong pr draft` | Draft PR 생성 |
| `/pawpong pr preview` | PR 본문 미리보기 (생성 X) |
| `/pawpong note <설명>` | 작업 중 발견한 문제/결정 사항 노트 캡처 |
| `/pawpong note list` | 현재 브랜치 노트 목록 조회 |

---

## 1. 자동 상태 감지 (`/pawpong` 인자 없음)

아래 순서로 현재 단계를 판단한다.

```bash
BRANCH=$(git branch --show-current)
AHEAD=$(git rev-list dev..HEAD --count 2>/dev/null || git rev-list main..HEAD --count)
CHANGES=$(git status --short | wc -l | tr -d ' ')
PR=$(gh pr list --head "$BRANCH" --json number,state --jq '.[0]' 2>/dev/null)
```

| 조건 | 단계 | 출력 |
|---|---|---|
| `feat/3.*` 아님 | 시작 전 | `/pawpong pick` 제안 |
| feat 브랜치, ahead=0, 변경=0 | 브랜치 생성됨 | `/pawpong plan` 제안 |
| feat 브랜치, ahead=0, 변경>0 | 작업 중 (첫 커밋 전) | `/pawpong commit` 제안 |
| feat 브랜치, ahead>0, 변경>0 | 작업 중 | `/pawpong commit` 또는 `/pawpong pr` 제안 |
| feat 브랜치, ahead>0, 변경=0 | 커밋 완료 | `/pawpong pr` 제안 |
| PR 존재 | PR 오픈 | PR 링크 + 상태 표시 |

출력 예시:
```
[Pawpong] 현재 단계: 작업 중

  브랜치: feat/3.1-home-summary
  이슈:   #85 홈 통합 API GET /home/summary
  커밋:   dev 기준 2개 앞
  변경:   3개 파일 미커밋

다음 단계:
  /pawpong commit   → 변경 파일 커밋
  /pawpong pr       → 지금 바로 PR 생성 (변경 파일 있어도 가능)
```

---

## 2. `pick` — 이슈 선택 + 브랜치 생성

### 2-A. 이슈 목록 조회

```bash
gh issue list --label from-spec --state open \
  --json number,title,labels,assignees,updatedAt --limit 100
```

`mine`: `--assignee @me` 추가.

각 이슈에 대해:
- 제목 + 출처 (`**§ 3.X ...` 정규식 파싱: `\*\*§ (3\.\d+) ([^*]+)\*\*`)
- 로컬 브랜치 존재 여부: `git branch --list "feat/3.X-*"`
- PR 상태: `gh pr list --head <branch> --json number,state`

출력:
```
[Open Issues — from-spec]

  1. #85  [feat] 홈 통합 API GET /home/summary
         출처:  § 3.1 홈 페이지
         브랜치: 없음
         담당:  @rtaeho
         PR:    없음

총 1건

번호 입력 (또는 q):
```

`list`/`mine` 모드는 여기서 종료. `interactive`는 번호 입력 → 다음 단계.

### 2-B. 이슈 선택 후

- **`v`** 입력 시: `gh issue view <num>` 전체 출력 후 확인
- **`y`** 입력 시: 브랜치 생성으로 진행

### 2-C. 브랜치 생성

페이지 슬러그 매핑:
```
3.1→home, 3.2→adoption, 3.3→adoption-detail, 3.4→application,
3.5→chat, 3.6→listing-create, 3.7→listing-detail,
3.8→mypage, 3.9→mypage-breeder, 3.10→bookmarks,
3.11→breeder-explore, 3.12→community, 3.13→hall-of-fame, 3.14→notification
```

```bash
gh issue develop <num> --checkout --base dev --name "feat/3.X-<slug>"
# 브랜치 이미 있으면 git checkout <branch> 폴백
```

브랜치 생성 직후 현재 gh 인증 사용자를 assignee로 지정:

```bash
gh issue edit <num> --add-assignee @me
```

이슈 발행 시점에는 assignee 없음 — 브랜치를 파는 순간 담당자가 확정된다.

완료 출력:
```
✅ 브랜치 feat/3.1-home-summary 체크아웃 (base: dev)
✅ 이슈 #85 담당자 → @me 로 지정
✅ 이슈 #85 → https://github.com/Pawpong/Pawpong_Backend/issues/85

다음: /pawpong plan  으로 구현 계획 확인
```

### 2-D. `resume` 모드

내 assign 이슈 중 로컬 브랜치 + 커밋 이력 있는 것 목록 표시:
```bash
gh issue list --state open --assignee @me --label from-spec --json number,title
```

각 이슈 → 로컬 브랜치 + 마지막 커밋 시각 + PR 상태 → 선택 → `git checkout`

---

## 3. `plan` — 구현 계획

### Step 1 — 이슈 감지

```bash
git branch --show-current   # feat/3.1-home-summary
```

브랜치명에서 이슈 번호 추출 시도 (`gh issue develop` 메타데이터 활용):
```bash
gh issue list --label from-spec --state open --json number,title,body
```
실패 시 번호 직접 입력 요청.

### Step 2 — 이슈 전문 파싱

```bash
gh issue view <num> --json title,body
```

추출:
- `**§ 3.X` → 도메인 (예: `home`)
- **작업 내용** → 구현할 API 요약
- **기존 백엔드 활용** → 재사용 가능 메서드 목록
- **인수 조건** → 완료 기준 체크리스트

### Step 3 — 코드베이스 스캔

추출한 도메인 기준:
```bash
cat src/api/<domain>/<domain>.controller.ts
cat src/api/<domain>/<domain>.service.ts
cat src/api/<domain>/<domain>.module.ts
cat src/common/guard/optional-jwt-auth.guard.ts
cat src/common/decorator/user.decorator.ts
cat src/common/dto/response/api-response.dto.ts
```

이슈에서 언급한 연관 도메인(예: `notification`, `auth`)도 추가 스캔.

### Step 4 — 구현 계획 출력

```
## 구현 계획 — #85 홈 통합 API GET /home/summary

### 영향 파일
| 파일 | 작업 |
|---|---|
| src/api/home/home.controller.ts       | 추가 |
| src/api/home/home.service.ts          | 추가 |
| src/api/home/dto/response/home-summary-response.dto.ts | 신규 |

### 커밋 단위
커밋 1 — DTO: home-summary-response.dto.ts 생성
커밋 2 — Service: HomeService.getSummary() 추가
커밋 3 — Controller: GET /home/summary 엔드포인트
커밋 4 — Test: 단위 테스트 추가

### 설계 결정
- OptionalJwtAuthGuard 사용 (비회원 접근 허용)
- Promise.all 병렬 호출 (banners, faqs, unread-count)
- ApiResponseDto.success() 래퍼 (기존 패턴 동일)

### 인수 조건
- [ ] 응답 스키마 정의
- [ ] 역할별 분기 검증
- [ ] 비회원 응답 안정성
- [ ] 단위 테스트
```

**계획만 출력. 코드 자동 생성 X, 파일 수정 X.**

---

## 4. `commit` — 기능 단위 커밋

### Step 1 — 변경 파일 확인

```bash
git status --short
```

변경 없으면: "커밋할 변경 사항이 없습니다." 종료.

스테이징 여부 분리 출력:
```
[스테이징됨]
  M  src/api/home/home.service.ts

[변경됨 (미스테이징)]
  M  src/api/home/home.controller.ts
  A  src/api/home/dto/response/home-summary-response.dto.ts
```

### Step 2 — 파일 선택

```
이번 커밋에 포함할 파일 (번호, 쉼표 구분 / a=전체 / q=취소):
  1. src/api/home/home.service.ts                          [수정]
  2. src/api/home/home.controller.ts                       [수정]
  3. src/api/home/dto/response/home-summary-response.dto.ts [신규]

선택:
```

`.env`, 시크릿 파일이 목록에 있으면 ⚠️ 경고 후 제외 권고.

### Step 3 — 커밋 메시지 자동 제안

브랜치명 + 선택 파일 분석:
- scope: `src/api/<scope>/` 추출
- type 추론: `*.spec.ts`/`test/` → `test`, `*.dto.ts` 신규 → `feat`, `*.module.ts` → `chore`

```
제안: feat(home): 홈 통합 API 응답 DTO 정의

수정하거나 Enter로 확정:
```

### Step 4 — 커밋 실행

```bash
git add <선택 파일들>
git commit -m "<메시지>"
```

```
✅ 커밋: feat(home): 홈 통합 API 응답 DTO 정의
   (1 file changed, 42 insertions)

남은 변경: 2개 파일
다음: /pawpong commit  또는  /pawpong pr
```

**`git push` 자동 실행 절대 X. `git add -A` 사용 X.**

### 커밋 타입

| type | 용도 |
|---|---|
| `feat` | 신규 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변경 없는 코드 개선 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드/설정/의존성 |
| `docs` | 문서 |
| `ci` | CI/CD |

포맷:
```
<type>[(scope)]: <한국어 설명>

[선택 본문]
[선택] Refs #<이슈번호>
```

---

## 5. `pr` — PR 생성

### Step 1 — 사전 확인

```bash
git branch --show-current
git rev-list dev..HEAD --count   # 커밋 수
git status --short               # 미커밋 변경
gh pr list --head <branch> --json number,state  # 기존 PR
```

커밋 0개 → "커밋이 없습니다. /pawpong commit 먼저." 종료.
기존 PR 있으면 → 링크 보여주고 종료.

미push 커밋 있으면:
```
⚠️ push되지 않은 커밋 N개
push하고 진행할까요? (y/n):
```

### Step 2 — 이슈 조회 + 노트 읽기 + PR 초안 생성

```bash
gh issue view <num> --json title,body
git log dev..HEAD --oneline
```

노트 파일 존재 시 읽기:
```bash
cat .claude/notes/$(git branch --show-current).md 2>/dev/null
```

이슈 인수 조건 → PR 체크리스트 자동 채우기.
커밋 메시지 → 변경 사항 섹션 자동 작성.
노트 있으면 → "작업 중 발견한 이슈" 섹션 추가.

### Step 3 — 초안 확인

```
=== PR 초안 ===

제목: feat(home): 홈 통합 API GET /home/summary 추가

Closes #85

## 변경 사항
- 홈 통합 API GET /home/summary 엔드포인트 추가
- HomeSummaryResponseDto 응답 DTO 정의
- HomeService.getSummary() 메서드 추가 (비회원/회원 분기)

## 인수 조건 체크
- [x] 응답 스키마 정의
- [x] 역할별 분기 검증
- [x] 비회원 응답 안정성
- [ ] 단위 테스트
- [x] PR 설명에 변경 요약

## 테스트 방법
1. GET /api/home/summary — 토큰 없이 → 비회원 응답 확인
2. adopter JWT로 호출 → 사용자 요약 포함 확인
3. breeder JWT로 호출 → CTA 분기 확인

## 작업 중 발견한 이슈
- [bug] OptionalJwtAuthGuard null 반환 시 타입 에러 → 이번 PR에서 처리
- [question] Promise.all 순서 보장 → 확인 완료, 문서화
- [decision] 비회원 unreadCount 기본값 0으로 정의
===

수정할 부분 입력 (없으면 Enter):
```

### Step 4 — PR 생성 확인

```
PR 생성할까요?
  feat/3.1-home-summary → dev
  Draft: 아니오
(y/n):
```

```bash
git push -u origin <branch>   # 미push 시
gh pr create \
  --title "<제목>" \
  --body "<본문>" \
  --base dev \
  --label "feature,page-3.1"
# draft 모드면 --draft 추가
```

```
✅ PR 생성: https://github.com/Pawpong/Pawpong_Backend/pull/<N>

이슈 #85는 PR 머지 시 자동 close됩니다.
```

**PR 생성은 반드시 `y` 확인 후. `Closes #N` 첫 줄 없으면 경고.**

---

## 6. `note` — 작업 중 메모 캡처

개발하다가 발견한 문제, 결정 사항, 나중에 처리할 것들을 브랜치별 노트 파일에 기록한다.

### Step 1 — 입력 처리

```
/pawpong note OptionalJwtAuthGuard null 반환 시 타입 에러 발생
/pawpong note list   # 노트 목록 조회
```

인자 없이 실행 시 한 줄 입력 요청.

### Step 2 — 분류 자동 추론

입력 텍스트를 읽고 타입 자동 판단:

| 타입 | 키워드 예시 |
|---|---|
| `bug` | 에러, 실패, 안 됨, 이상함, null, 예외 |
| `question` | 확인 필요, 모르겠음, 어떻게, 맞나 |
| `debt` | 나중에, 일단, 임시, 하드코딩, 리팩토링 |
| `decision` | ~로 결정, ~하기로, 정책 |

자동 추론이 애매하면 사용자에게 타입 확인 (1초 안에 답 없으면 `note`로 폴백).

### Step 3 — 노트 파일에 추가

파일 경로: `.claude/notes/<브랜치명>.md`

```bash
BRANCH=$(git branch --show-current)
# .claude/notes/ 디렉토리 없으면 생성
```

파일 형식:
```markdown
# feat/3.1-home-summary 작업 노트

- [10:23] [bug] OptionalJwtAuthGuard null 반환 시 타입 에러 발생
- [11:05] [question] getSummary Promise.all 순서 보장 확인 필요
- [14:30] [decision] 비회원 unreadCount 기본값 0으로 정의
```

```
✅ 노트 추가: [bug] OptionalJwtAuthGuard null 반환 시 타입 에러 발생
   .claude/notes/feat-3.1-home-summary.md (총 1개)
```

### Step 4 — `list` 모드

```
[feat/3.1-home-summary 작업 노트]

  [bug]      OptionalJwtAuthGuard null 반환 시 타입 에러 발생   10:23
  [question] getSummary Promise.all 순서 보장 확인 필요         11:05
  [decision] 비회원 unreadCount 기본값 0으로 정의               14:30

총 3개
```

노트 파일이 없으면: "아직 노트가 없습니다."

---

## 7. `status` — 진행 현황

```bash
git branch --show-current
git rev-list dev..HEAD --oneline
git status --short
gh pr list --head <branch> --json number,state,url
gh issue view <num> --json title,state 2>/dev/null
```

출력:
```
[Pawpong 진행 현황]

  이슈:   #85 홈 통합 API GET /home/summary  (open)
  브랜치: feat/3.1-home-summary
  커밋:   dev 기준 3개
            feat(home): 홈 통합 API 응답 DTO 정의
            feat(home): HomeService.getSummary() 추가
            feat(home): GET /home/summary 엔드포인트
  변경:   없음 (깨끗)
  PR:     없음

다음: /pawpong pr
```

---

## 7. 에러 처리

| 상황 | 처리 |
|---|---|
| `gh` 미설치/미인증 | `brew install gh && gh auth login` 안내 |
| open 이슈 0건 | "발행된 작업 없음. 옵시디언에서 /pawpong-publish 후 재시도." |
| `gh issue develop` 실패 (브랜치 존재) | `git checkout <branch>` 폴백 |
| 이슈 번호 추출 실패 | 목록 보여주고 번호 입력 요청 |
| PR 이미 존재 | 기존 PR 링크 출력 후 종료 |
| push 실패 | 오류 출력 + 수동 명령어 제안 |

---

## 8. 공통 원칙

- 파일 자동 수정 X (plan은 읽기만, commit은 사용자 선택 후)
- `git commit/push` 자동 실행 X — 항상 사용자 확인 후
- `git add -A` / `git add .` 사용 X
- `.env`, 시크릿 파일 커밋 목록 포함 시 ⚠️ 경고
- force push X
- 한국어 응답, ✅/⚠️/❌ 각 1개
- 마지막은 항상 "다음: /pawpong <subcommand>"

---

## 9. 전체 흐름 요약

```
/pawpong pick    →   /pawpong plan   →   (코딩)   →   /pawpong commit  ×n   →   /pawpong pr
이슈 선택           구현 계획 수립       직접 구현      기능 단위 커밋 반복         PR 생성

           언제든 /pawpong 으로 현재 단계 확인 가능
```
