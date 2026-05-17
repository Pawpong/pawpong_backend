---
name: pawpong-pr
description: 현재 브랜치의 작업을 정리해 PR 템플릿을 채우고 GitHub PR을 생성합니다.
---

# pawpong-pr

현재 브랜치에 연결된 이슈를 읽고 커밋 이력을 분석해 **PR 본문을 자동으로 채운 뒤** `gh pr create`를 실행한다.
Base 브랜치는 `dev` (없으면 `main`).

## 0. 트리거

| 입력 | 동작 |
|---|---|
| `/pawpong-pr` | 현재 브랜치 기준으로 PR 초안 → 확인 후 생성 |
| `/pawpong-pr draft` | GitHub Draft PR로 생성 |
| `/pawpong-pr preview` | PR 본문만 출력 (생성 X) |

## 1. 실행 순서

### Step 1 — 사전 확인

```bash
# 현재 브랜치
git branch --show-current

# push 여부 확인
git status -sb

# 커밋 목록 (dev 기준)
git log dev..HEAD --oneline
```

커밋이 0개면: "커밋이 없습니다. 먼저 /pawpong-commit 으로 작업을 저장하세요." 종료.

미push 커밋이 있으면:
```
⚠️ 원격에 push되지 않은 커밋이 있습니다.
PR 생성 전에 push할까요? (y/n):
```
`y` → `git push -u origin <branch>` 실행 후 계속.
`n` → 그냥 진행 (gh가 알아서 push 제안).

### Step 2 — 이슈 조회

브랜치명에서 이슈 번호 추출 시도:
```bash
# gh issue develop 으로 만든 브랜치는 gh가 이슈 연결 메타데이터 보유
gh issue list --state open --label from-spec --json number,title \
  | jq '.[] | select(.title | test("<브랜치 키워드>"))'
```

추출 실패 시: 이슈 번호 직접 입력 요청.

```bash
gh issue view <num> --json title,body
```

이슈 본문에서:
- 이슈 제목 → PR 제목 초안
- **인수 조건** 체크리스트 → PR 인수 조건 섹션
- **작업 내용** 블록 → 변경 사항 초안

### Step 3 — 변경 사항 요약 + 노트 읽기

```bash
git log dev..HEAD --oneline
git diff dev...HEAD --stat

# 작업 노트 읽기 (있으면)
BRANCH=$(git branch --show-current)
cat ".claude/notes/${BRANCH}.md" 2>/dev/null
```

커밋 메시지들을 불릿으로 정리해 "변경 사항" 섹션 초안 작성.
노트 파일 있으면 → "작업 중 발견한 이슈" 섹션 추가, 없으면 섹션 생략.

### Step 4 — PR 본문 초안 출력

```
=== PR 초안 ===

제목: feat(home): 홈 통합 API GET /home/summary 추가

본문:
---
Closes #85

## 변경 사항
- 홈 통합 API `GET /home/summary` 엔드포인트 추가
- `HomeSummaryResponseDto` 응답 DTO 정의
- `HomeService.getSummary()` 서비스 메서드 추가 (비회원/회원 분기)

## 인수 조건 체크
- [x] 응답 스키마 정의 (필드 누락 시 기본값 정책 포함)
- [x] 비회원/입양자/브리더 역할별 분기 동작 검증
- [x] 인증 토큰 없을 때(비회원)의 응답 안정성 보장
- [ ] 단위 테스트 추가
- [x] PR 설명에 변경 요약

## 테스트 방법
1. `GET /api/home/summary` — 토큰 없이 호출 → 비회원 응답 확인
2. JWT adopter 토큰으로 호출 → 사용자 요약 포함 확인
3. JWT breeder 토큰으로 호출 → 브리더 CTA 포함 확인
---

수정할 부분이 있으면 입력하세요 (없으면 Enter):
```

사용자가 수정 입력 시 → 해당 부분 반영 후 재출력.
Enter → 다음 단계.

### Step 5 — PR 생성

```
PR을 생성할까요?
  브랜치: feat/3.1-home-summary → dev
  라벨:   feature, page-3.1  (이슈에서 복사)
  Draft:  아니오

(y/n):
```

`y` 확정 후:
```bash
git push -u origin <branch>   # 아직 push 안 됐으면
gh pr create \
  --title "<제목>" \
  --body "<본문>" \
  --base dev \
  --label "feature,page-3.1"
# draft 모드면 --draft 추가
```

완료 메시지:
```
✅ PR 생성 완료
   https://github.com/Pawpong/Pawpong_Backend/pull/<PR번호>

다음:
  - 리뷰어 지정: gh pr edit <PR번호> --add-reviewer <username>
  - 이슈 #85는 PR 머지 시 자동 close됩니다
```

## 2. PR 본문 템플릿

```markdown
Closes #<이슈번호>

## 변경 사항
- (커밋 메시지에서 자동 추출)

## 인수 조건 체크
- [ ] (이슈 본문 인수 조건 복사)

## 테스트 방법
1. (API 호출 방법 / 재현 절차)
```

## 3. 에러 처리

| 상황 | 처리 |
|---|---|
| 이미 PR 존재 | 기존 PR 링크 보여주고 종료 |
| `dev` 브랜치 없음 | `main`으로 폴백, 사용자에게 알림 |
| push 실패 | 오류 출력 + 원격 브랜치 상태 확인 안내 |
| `gh pr create` 실패 | 오류 출력, 수동 명령어 제안 |

## 4. 원칙

- PR 생성은 반드시 사용자 `y` 확인 후
- 본문 자동 수정 X — 초안 보여주고 사용자 편집 기회 부여
- `Closes #<N>` 첫 줄 필수 — 없으면 경고
- force push X
