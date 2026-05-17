---
name: pawpong-plan
description: 현재 브랜치의 이슈를 읽고 코드베이스를 분석해 구체적인 구현 방안을 제시합니다.
---

# pawpong-plan

현재 브랜치에 연결된 GitHub 이슈와 기존 코드베이스를 함께 읽어 **이 프로젝트 스타일에 맞는 구현 계획**을 작성한다.
옵시디언 의존성 없음 — 이슈 본문에 컨텍스트가 이미 임베딩되어 있다.

## 0. 트리거

| 입력 | 동작 |
|---|---|
| `/pawpong-plan` | 현재 브랜치에서 이슈 자동 감지 → 분석 |
| `/pawpong-plan 85` | 이슈 번호 직접 지정 |

## 1. 실행 순서

### Step 1 — 이슈 감지

현재 브랜치명에서 이슈 번호 추출:
```bash
git branch --show-current
# feat/3.1-home-summary → gh issue develop 으로 만든 브랜치면
# gh issue list --state open 으로 브랜치명 매칭
```

브랜치명에서 숫자 추출 실패 시 `gh issue list --label from-spec --state open --json number,title` 보여주고 번호 입력 요청.

### Step 2 — 이슈 전문 조회

```bash
gh issue view <num> --json title,body,labels
```

이슈 본문에서 아래를 파싱:
- `**§ 3.X ...` → 섹션 번호와 도메인
- **작업 내용** 블록 → 구현할 API / 기능 요약
- **관련 컨텍스트** 블록 → 스키마, 인증 흐름, 도메인 설계 힌트
- **기존 백엔드 활용** 블록 → 재사용 가능한 기존 API 목록
- **인수 조건** 체크리스트 → 완료 기준

### Step 3 — 코드베이스 스캔

이슈에서 추출한 도메인명(예: `home`, `notification`, `auth`)을 기준으로:

```bash
# 해당 도메인 모듈 전체
ls src/api/<domain>/

# 컨트롤러, 서비스, DTO 파일 읽기
cat src/api/<domain>/<domain>.controller.ts
cat src/api/<domain>/<domain>.service.ts
cat src/api/<domain>/<domain>.module.ts

# 이슈에서 재사용 언급된 기존 API의 메서드 확인
# (예: getActiveBanners, getFaqs, unread-count)

# 이슈에서 언급된 Guard, Decorator 찾기
cat src/common/guard/optional-jwt-auth.guard.ts 2>/dev/null
cat src/common/decorator/user.decorator.ts 2>/dev/null

# 공통 응답 DTO
cat src/common/dto/response/api-response.dto.ts
```

관련 스키마도 확인:
```bash
ls src/schema/ | grep -i <domain>
```

### Step 4 — 구현 계획 출력

아래 형식으로 출력한다.

---

## 구현 계획 — #<N> <이슈제목>

### 개요
<이슈 작업 내용 한 줄 요약>

### 영향 파일 목록

| 파일 | 작업 | 비고 |
|---|---|---|
| `src/api/home/home.controller.ts` | 추가 | `GET /home/summary` 엔드포인트 |
| `src/api/home/home.service.ts` | 추가 | `getSummary()` 메서드 |
| `src/api/home/dto/response/home-summary-response.dto.ts` | 신규 | 응답 DTO |
| `src/api/home/home.module.ts` | 수정 | 의존 모듈 import |

### 구현 순서 (기능 단위 커밋 기준)

**커밋 1 — DTO 정의**
- `home-summary-response.dto.ts` 생성
- 필드: 이슈 본문 "백엔드 필요 데이터" 섹션 그대로 매핑
- 비회원용 / 회원용 분기 필드 optional 처리

**커밋 2 — 서비스 메서드**
- `HomeService.getSummary(userId?: string)` 추가
- 기존 메서드(`getActiveBanners`, `getAdopterFaqs` 등) 병렬 호출 (`Promise.all`)
- 비회원 폴백: userId 없으면 사용자 요약 필드 null

**커밋 3 — 컨트롤러 엔드포인트**
- `@Get('summary')` 추가
- `@UseGuards(OptionalJwtAuthGuard)` — 인증 옵셔널
- Swagger `@ApiOperation`, `@ApiResponse` 작성

**커밋 4 — 테스트**
- `src/api/home/test/home.controller.spec.ts` 또는 `home.service.spec.ts` 업데이트

### 주의사항 / 설계 결정

- **인증 옵셔널**: 기존 `OptionalJwtAuthGuard` 그대로 사용 (이슈 본문 인증 흐름 참고)
- **병렬 호출**: `Promise.all` 로 각 서브 데이터 병렬 fetch — 순서 의존성 없음
- **외부 계약 유지**: 기존 `/home/banners`, `/home/faqs` 엔드포인트 시그니처 변경 X
- **응답 형식**: `ApiResponseDto.success(data, message)` 래퍼 사용 (기존 컨트롤러 패턴 동일)

### 인수 조건 체크리스트
<이슈 본문 인수 조건 그대로 복사 — 미완료 상태로>

---

## 2. 에러 처리

| 상황 | 처리 |
|---|---|
| 브랜치에서 이슈 번호 추출 실패 | 이슈 목록 보여주고 번호 입력 요청 |
| `gh issue view` 실패 | 네트워크 확인 안내 |
| 도메인 디렉토리 없음 | `src/api/` 전체 나열하고 유사 도메인 제안 |

## 3. 원칙

- 코드 자동 생성 X — 계획만 출력
- 기존 파일은 읽기만, 수정 X
- git 변경 없음
- 한국어로 출력
