---
name: pawpong-pick
description: 발행된 spec 이슈를 선택해 브랜치를 생성합니다.
---

# pawpong-pick

이미 발행된 GitHub 이슈(`from-spec` 라벨)를 골라 브랜치를 만들고 작업 시작 지점에 데려다주는 스킬. **옵시디언 레포 의존성 없음** — 이슈 본문에 컨텍스트가 모두 임베딩되어 있다.

이슈 발행 자체는 옵시디언 레포 측 `/pawpong-publish` 스킬이 담당.

## 0. 트리거 & 모드

| 입력 | 모드 |
|---|---|
| `/pawpong-pick` (인자 없음) | **interactive** — open 이슈 표시 → 선택 → 브랜치 |
| `/pawpong-pick list` | **list** — 이슈 목록만 (읽기 전용) |
| `/pawpong-pick mine` | **mine** — 내 이름 assign된 open 이슈만 |
| `/pawpong-pick resume` | **resume** — 내 진행 중 이슈 → 브랜치 체크아웃 |
| `/pawpong-pick 42` | **direct** — 이슈 번호 직접 |

기본은 interactive.

## 1. 데이터 소스 / 경로

| 항목 | 경로 |
|---|---|
| GitHub repo | cwd가 백엔드 레포라 gh 자동 감지 (`Pawpong/Pawpong_Backend`) |
| 이슈 라벨 필터 | `from-spec` |
| 베이스 브랜치 | `dev` (없으면 `main`) |

## 2. 모드 상세

### 2-A. `interactive` / `list` / `mine`

1. `gh issue list --label from-spec --state open --json number,title,labels,assignees,updatedAt --limit 100`
   - `mine` 모드: `--assignee @me` 추가
2. 각 이슈에 대해:
   - 제목 + 출처(이슈 본문에서 `§ 3.X` 추출)
   - 로컬 브랜치 존재 여부 (`git branch --list "feat/3.X-*"`)
   - PR 상태 (`gh pr list --head <branch> --json number,state`)
3. 출력:

```
[Open Issues — from-spec]

  1. #42 [feat] 홈 통합 API GET /home/summary
        출처:  § 3.1 홈 페이지
        브랜치: feat/3.1-home-summary  (로컬 존재)
        담당:  @rtaeho · 2시간 전 활동
        PR:    없음

  2. #43 [feat] 인기 검색어 API
        출처:  § 3.1 홈 페이지
        브랜치: 없음
        담당:  미할당

  3. #44 [feat] 분양 게시물 관심 저장
        출처:  § 3.10 저장 목록
        브랜치: 없음
        담당:  미할당

총 3건

번호 입력 (또는 q):
```

`list`/`mine`은 여기서 종료. `interactive`는 사용자 입력 → 다음 단계.

### 2-B. 이슈 선택 후 — 브랜치 생성

선택한 이슈에 대해:

**Step 1 — 이슈 상세 보기 (선택)**

사용자가 본문 미리 보고 싶으면 `gh issue view <num>` 한 번. 시작 확정이면 다음.

**Step 2 — 브랜치 생성·체크아웃**

```bash
gh issue develop <num> --checkout --base dev --name "feat/3.X-<slug>"
```

- `<slug>`는 이슈 본문에서 추출 (이슈 제목/본문에 `§ 3.X` 있으니 페이지 슬러그 매핑 적용)
- 페이지 슬러그 매핑 (publish와 동일):
  ```
  3.1→home, 3.2→adoption, 3.3→adoption-detail, 3.4→application,
  3.5→chat, 3.6→listing-create, 3.7→listing-detail,
  3.8→mypage, 3.9→mypage-breeder, 3.10→bookmarks,
  3.11→breeder-explore, 3.12→community, 3.13→hall-of-fame, 3.14→notification
  ```
- 항목 키워드 1~2개 추가 (예: `feat/3.1-home-summary`)
- 이미 같은 이름 브랜치 있으면 `git checkout`으로 폴백

**Step 3 — Assignee 자동 지정**

브랜치 생성 직후 브랜치를 만든 사람(현재 gh 인증 사용자)을 assignee로 지정:

```bash
gh issue edit <num> --add-assignee @me
```

이슈 발행 시점에는 assignee 없음(미할당) — 브랜치를 파는 순간 담당자가 확정된다.

**Step 4 — 완료 요약**

```
✅ 브랜치 feat/3.1-home-summary 체크아웃 (base: dev)
✅ 이슈 #42 담당자 → @me 로 지정
✅ 이슈 #42 → https://github.com/Pawpong/Pawpong_Backend/issues/42

다음:
  - 코딩 시작
  - PR 본문 첫 줄에 "Closes #42" 포함 → 머지 시 이슈 자동 close
```

### 2-C. `resume` 모드

1. `gh issue list --state open --assignee @me --label from-spec --json number,title`
2. 각 이슈 → 로컬 브랜치 존재 여부 + 마지막 커밋 시각 + PR 상태
3. 사용자 선택 → `git checkout <branch>` (없으면 `gh issue develop --checkout`)

```
[내 진행 중 이슈]

  1. #42 [feat] 홈 통합 API
        브랜치: feat/3.1-home-summary
        마지막 커밋: 4시간 전
        PR: 없음

  2. #51 [feat] 입양 카드 보강
        브랜치: feat/3.2-adoption-card
        마지막 커밋: 어제
        PR: #88 (리뷰 대기)

번호 입력:
```

---

## 3. 라벨 / 브랜치 / 커밋 컨벤션

| 항목 | 값 |
|---|---|
| 이슈 라벨 | `from-spec`, `feature`, `page-3.X` (publish가 부착) |
| 브랜치 prefix | `feat/3.X-<slug>` |
| Base 브랜치 | `dev` (없으면 `main`) |
| 커밋 type | `feat` / `fix` / `refactor` / `test` / `chore` / `ci` / `docs` |
| 커밋 본문 | 한국어 |
| PR 본문 첫 줄 | `Closes #<N>` 필수 |

### 커밋 메시지 포맷
```
<type>[(scope)]: <한국어 설명>

[선택 본문 — 왜 변경하는지]

[선택] Refs #<이슈번호>
```

예시:
- `feat(home): 홈 통합 API GET /home/summary 추가`
- `fix(adoption): 신청서 일부 필드 optional 처리`

### PR 본문 템플릿
```markdown
Closes #<이슈번호>

## 변경 사항
- (불릿)

## 인수 조건 체크
- [x] (이슈 본문 인수 조건 복사 + 체크)

## 테스트 방법
1. (재현/검증 절차)
```

## 4. 에러 처리

| 상황 | 처리 |
|---|---|
| `gh` 미설치/미인증 | 안내: `brew install gh && gh auth login` |
| open 이슈 0건 | "발행된 작업이 없습니다. 옵시디언 레포에서 /pawpong-publish 후 다시 시도하세요." |
| `gh issue develop` 실패 (브랜치 이미 존재) | `git checkout <branch>` 폴백 |
| 같은 이름 브랜치 다른 base | 사용자에게 알리고 진행 여부 확인 |

## 5. 보안 / 사이드이펙트 원칙

- 어떤 파일도 자동 수정 금지 (옵시디언 의존성 0이라 spec도 안 건드림)
- git commit/push 절대 자동 X
- gh 호출은 사용자 confirm 후
- 브랜치 생성/체크아웃이 유일한 git 변경 (이것도 사용자 선택 후)

## 6. 사용자 응답 톤

- 한국어
- 이슈/브랜치/PR 링크는 markdown 클릭 가능
- ✅/⚠️/❌ 1개씩만
- 마지막에 "다음에 할 것" 한 줄

## 7. 구현 시 주의사항

### 7-1. cwd가 백엔드 레포

gh 자동 감지 동작 OK. 단, gh 명령 실패 시 cwd 확인 안내.

### 7-2. 이슈 본문에서 출처 § 추출

이슈 본문 첫 부분에 `**§ 3.X {페이지제목}**` 형식이 있으니 정규식 `\*\*§ (3\.\d+) ([^*]+)\*\*` 매칭.

### 7-3. 브랜치 존재 여부 검사

```bash
git branch --list "feat/3.X-*"
```

여러 브랜치 매칭되면 가장 최근 커밋된 것 우선 표시.

### 7-4. spec 파일은 안 건드림

이 스킬은 spec 파일을 읽지도 않고 쓰지도 않음. 이슈 메타데이터만 사용.
