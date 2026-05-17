# pawpong-pick — 사용법

발행된 spec 이슈를 골라 브랜치를 만들고 작업 시작 지점에 데려다주는 백엔드 측 스킬입니다.

> 이슈 발행 자체는 옵시디언 레포의 `/pawpong-publish` 스킬이 담당합니다. 본 스킬은 **이슈 소비 + 브랜치 생성**만.

---

## 1. 사전 준비 (한 번만)

### 1-1. GitHub CLI

```bash
brew install gh
gh auth login
```

### 1-2. 백엔드 레포 clone

```bash
git clone https://github.com/Pawpong/Pawpong_Backend.git
cd Pawpong_Backend
```

이게 전부입니다. **옵시디언 vault 불필요** — 이슈 본문에 컨텍스트가 모두 임베딩되어 있어 옵시디언 clone 안 해도 됩니다.

---

## 2. 명령어

| 명령 | 용도 |
|---|---|
| `/pawpong-pick` | 인터랙티브 — open 이슈 표시 → 선택 → 브랜치 |
| `/pawpong-pick list` | 이슈 목록만 (읽기 전용) |
| `/pawpong-pick mine` | 내 이름 assign된 open 이슈만 |
| `/pawpong-pick resume` | 내가 작업하던 브랜치로 복귀 |
| `/pawpong-pick 42` | 이슈 번호 직접 |

---

## 3. 일상 워크플로우

### 새 작업 시작

```
/pawpong-pick
```

→ open 이슈 목록에서 번호 선택 → `feat/3.X-<slug>` 브랜치 자동 생성·체크아웃 → 코딩 시작.

### 작업 도중 다른 일

```bash
git stash      # 또는 wip 커밋
/pawpong-pick   # 다른 이슈 선택
```

### 다시 돌아오기

```
/pawpong-pick resume
```

내 진행 중 이슈 리스트에서 번호 선택 → 자동 체크아웃.

---

## 4. 라벨 / 브랜치 / 커밋 / PR 컨벤션

| 항목 | 값 |
|---|---|
| 이슈 라벨 | `from-spec`, `feature`, `page-3.X` (publish가 자동 부착) |
| 브랜치 | `feat/3.X-<slug>` (예: `feat/3.1-home-summary`) |
| Base 브랜치 | `dev` |
| 커밋 type | `feat` / `fix` / `refactor` / `test` / `chore` / `ci` / `docs` |
| 커밋 본문 | 한국어 |
| PR 본문 첫 줄 | **`Closes #<N>` 필수** ← 머지 시 이슈 자동 close |

### 커밋 메시지 예시

```
feat(home): 홈 통합 API GET /home/summary 추가

- HomeModule 신설
- summary DTO 정의

Refs #42
```

### PR 본문 예시

```markdown
Closes #42

## 변경 사항
- HomeModule 신설
- GET /home/summary 핸들러 추가

## 인수 조건 체크
- [x] 응답 스펙 일치
- [x] 단위 테스트 추가

## 테스트 방법
1. `npm run start:dev`
2. `curl http://localhost:3000/api/home/summary`
```

---

## 5. 자주 묻는 질문

**Q. spec에 없는 작업도 이 스킬로?**
A. 아니요. `from-spec` 라벨 없는 이슈는 안 보입니다. spec 외 작업은 `gh issue create` 직접 사용하거나 옵시디언 측 publish로 spec 업데이트 후 발행하세요.

**Q. 이슈 본문에 옵시디언 링크가 있는데 클릭하면 안 보여요.**
A. 옵시디언 레포는 private입니다. 팀원이라면 GitHub 권한이 자동 상속돼있어야 하는데 안 되면 PM/리드에게 문의.

**Q. 누가 이슈를 닫으면 자동으로 알 수 있나요?**
A. `/pawpong-pick`/`mine` 호출 시 라이브 상태 체크합니다. closed 이슈는 안 보임.

**Q. 베이스 브랜치 dev 말고 다른 거?**
A. 발행 직전 confirm 단계에서 한 번 변경 가능. 영구 변경은 `pawpong-pick.md` § 3 수정.

---

## 6. 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `gh: command not found` | `brew install gh` |
| `error: must authenticate` | `gh auth login` |
| open 이슈 0건 | 옵시디언 레포에서 `/pawpong-publish` 실행 후 다시 시도 |
| `gh issue develop` 실패 | 같은 이름 브랜치 존재 가능 → `git branch -a | grep <slug>` 확인 후 수동 처리 |

---

## 7. 더 자세한 동작은

슬래시 명령 본체: [`.claude/commands/pawpong-pick.md`](../../commands/pawpong-pick.md)

수정 제안은 PR로:
1. `Pawpong_Backend/.claude/commands/pawpong-pick.md` 또는 본 README 수정
2. PR 제목: `chore(skill): pawpong-pick — ...`
3. 머지되면 팀원 모두 `git pull` 후 자동 적용
