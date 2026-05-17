# Pawpong 백엔드 스킬 가이드

Claude Code에서 `/` 로 호출하는 커스텀 스킬 모음.  
이슈 선택부터 PR까지 백엔드 개발 전 워크플로우를 커버한다.

---

## 전체 흐름

```
/pawpong pick  →  /pawpong plan  →  (코딩)  →  /pawpong commit  ×n  →  /pawpong pr
  이슈 선택       구현 계획 수립     직접 구현    기능 단위 커밋 반복       PR 생성

언제든 /pawpong 으로 현재 단계 확인 가능
언제든 /pawpong status 로 진행 현황 확인 가능
```

---

## 통합 스킬 — `/pawpong`

모든 단계를 하나의 진입점에서. 인자 없이 실행하면 현재 git 상태를 자동 감지해 다음 단계를 제안한다.

| 명령어 | 설명 |
|---|---|
| `/pawpong` | 현재 단계 자동 감지 → 다음 단계 제안 |
| `/pawpong status` | 이슈·브랜치·커밋·PR 진행 현황 요약 |
| `/pawpong pick` | 이슈 목록 조회 → 선택 → 브랜치 생성 |
| `/pawpong pick <번호>` | 이슈 번호 직접 지정 |
| `/pawpong pick list` | 이슈 목록만 조회 (읽기 전용) |
| `/pawpong pick mine` | 내 이슈만 조회 |
| `/pawpong pick resume` | 진행 중이던 브랜치 체크아웃 |
| `/pawpong plan` | 현재 브랜치 이슈 + 코드 분석 → 구현 계획 출력 |
| `/pawpong plan <번호>` | 이슈 번호 직접 지정해서 분석 |
| `/pawpong commit` | 변경 파일 선택 → 커밋 메시지 제안 → 커밋 |
| `/pawpong commit all` | 변경 전체 한 번에 커밋 |
| `/pawpong pr` | PR 초안 확인 → 생성 |
| `/pawpong pr draft` | Draft PR로 생성 |
| `/pawpong pr preview` | PR 본문 미리보기 (생성 X) |

---

## 개별 스킬

개별 단계만 호출하고 싶을 때 사용. 통합 스킬과 동일하게 동작한다.

### `/pawpong-pick` — 이슈 선택 + 브랜치 생성

GitHub에서 `from-spec` 라벨이 붙은 이슈를 골라 작업 브랜치를 만든다.

```
/pawpong-pick              # 이슈 목록 → 선택 → 브랜치
/pawpong-pick <번호>        # 번호 직접 지정
/pawpong-pick list         # 이슈 목록만 (읽기 전용)
/pawpong-pick mine         # 내 이슈만
/pawpong-pick resume       # 진행 중 브랜치 체크아웃
```

**결과**: `feat/3.X-<slug>` 브랜치 생성 + 체크아웃 (base: `dev`)

브랜치 슬러그 매핑:
```
3.1 → home          3.2 → adoption        3.3 → adoption-detail
3.4 → application   3.5 → chat            3.6 → listing-create
3.7 → listing-detail 3.8 → mypage         3.9 → mypage-breeder
3.10 → bookmarks    3.11 → breeder-explore 3.12 → community
3.13 → hall-of-fame 3.14 → notification
```

---

### `/pawpong-plan` — 구현 계획

현재 브랜치의 이슈 본문과 기존 코드를 함께 읽어 **이 프로젝트 패턴에 맞는 구현 계획**을 출력한다.  
코딩은 하지 않고 계획만 제시한다.

```
/pawpong-plan              # 현재 브랜치 이슈 자동 감지
/pawpong-plan <번호>        # 이슈 번호 직접 지정
```

**출력 내용**:
- 영향 파일 목록 (신규/수정/삭제)
- 커밋 단위 분리 제안 (DTO → Service → Controller → Test 순)
- 설계 결정 사항 (어떤 Guard, 어떤 패턴 사용할지)
- 인수 조건 체크리스트

**읽기 전용 — 파일 수정 없음.**

---

### `/pawpong-commit` — 기능 단위 커밋

변경된 파일 중 이번 커밋에 포함할 것만 골라 컨벤션에 맞는 메시지로 커밋한다.

```
/pawpong-commit            # 파일 선택 → 메시지 제안 → 커밋
/pawpong-commit all        # 변경 전체 한 번에 커밋
```

**커밋 메시지 포맷**:
```
<type>[(scope)]: <한국어 설명>

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

**`git push` 자동 실행 없음. 선택한 파일만 스테이징.**

---

### `/pawpong-note` — 작업 중 메모 캡처

개발하다 발견한 문제, 결정 사항, 나중에 처리할 것들을 흐름 끊지 않고 기록한다.

```
/pawpong-note OptionalJwtAuthGuard null 반환 시 타입 에러   # 즉시 캡처
/pawpong-note list                                          # 목록 조회
```

**하는 일**:
- 입력 텍스트 보고 타입 자동 분류 (`bug` / `question` / `debt` / `decision`)
- `.claude/notes/<브랜치명>.md`에 타임스탬프와 함께 추가
- `/pawpong pr` 실행 시 노트를 읽어 PR 본문 "작업 중 발견한 이슈" 섹션에 자동 포함

> `.claude/notes/`는 `.gitignore`에 추가 권장 — 개인 작업 메모라 커밋 불필요

---

### `/pawpong-pr` — PR 생성

이슈 인수 조건과 커밋 이력을 읽어 PR 본문을 자동으로 채우고 `gh pr create`를 실행한다.

```
/pawpong-pr                # PR 초안 확인 → 생성
/pawpong-pr draft          # Draft PR로 생성
/pawpong-pr preview        # 본문 미리보기 (생성 X)
```

**PR 본문 템플릿**:
```markdown
Closes #<이슈번호>

## 변경 사항
- (커밋 이력에서 자동 추출)

## 인수 조건 체크
- [ ] (이슈 본문 인수 조건에서 자동 복사)

## 테스트 방법
1. (API 호출 방법)
```

**PR 생성은 반드시 사용자 확인 후. `Closes #N` 첫 줄 없으면 경고.**

---

## 공통 원칙

- **파일 자동 수정 없음** — plan은 읽기만, commit은 사용자가 파일 직접 선택
- **git push/commit 자동 실행 없음** — 항상 확인 후
- **`git add -A` 사용 안 함** — 선택한 파일만 스테이징
- **`.env` 등 시크릿 파일** 포함 시 경고 후 제외 권고
- **base 브랜치**: `dev` (없으면 `main`)
- **커밋 본문**: 한국어

---

## 이슈 발행은 어디서?

`from-spec` 라벨 이슈는 옵시디언 레포의 `/pawpong-publish` 스킬이 발행한다.  
이 스킬들은 **이슈 소비 측**만 담당한다 — 옵시디언 레포 없이 이슈 본문만으로 작업 가능.

```
옵시디언 레포          백엔드 레포
/pawpong-publish  →  GitHub Issue  →  /pawpong pick/plan/commit/pr
  이슈 발행            from-spec          이슈 소비 + 개발
```

---

## 사전 준비

```bash
# GitHub CLI 설치 + 인증 (최초 1회)
brew install gh
gh auth login

# 백엔드 레포 clone
git clone https://github.com/Pawpong/Pawpong_Backend.git
```

---

## 스킬 파일 위치

```
.claude/commands/
├── pawpong.md          # 통합 마스터 스킬
├── pawpong-pick.md     # 이슈 선택 + 브랜치
├── pawpong-plan.md     # 구현 계획
├── pawpong-commit.md   # 기능 단위 커밋
└── pawpong-pr.md       # PR 생성
```
