# Refactoring Roadmap

## Goal

`main` 브랜치의 응답 형식과 동작은 유지한 채, `refactoring` 브랜치에서 점진적으로 헥사고날 + DDD 스타일로 구조를 정리한다.

## Guardrails

- 외부 API 응답 스키마는 유지한다.
- URL, HTTP method, 인증 정책은 유지한다.
- 리팩토링은 도메인 단위로 나눈다.
- 각 도메인 리팩토링 후 타입체크와 관련 테스트를 통과시킨다.
- 인프라 세부사항은 application/domain 레이어 밖으로 밀어낸다.

## Target Structure

각 도메인은 아래 구조를 기본 템플릿으로 사용한다.

```text
domain/
  entities/
  value-objects/
  events/
  services/
application/
  ports/
  use-cases/
infrastructure/
  adapters/
  repositories/
  event-handlers/
presentation/
  controllers/
  dto/
```

Nest 특성상 controller/module은 당분간 기존 위치를 유지할 수 있지만, 내부 의존 방향은 아래를 따른다.

```text
controller -> use-case -> port -> adapter
controller -> use-case -> domain
```

## Cross-Cutting Rules

- DTO 이름은 `행위 + RequestDto`, `행위 + ResponseDto` 패턴으로 통일한다.
- 외부 API 입출력 계약은 `class DTO`로 표현하고, controller 경계에서만 사용한다.
- 내부 단순 데이터 계약은 `interface` 대신 `type`을 우선 사용한다.
- Nest DI 경계에 필요한 port는 `interface + symbol` 남발 대신 `abstract class`를 우선 사용한다.
- `interface`는 외부 라이브러리 타입 보강, 다중 구현이 분명한 순수 TypeScript 계약 등 꼭 필요한 곳에만 제한적으로 사용한다.
- 비즈니스 규칙은 service가 아니라 use-case 또는 domain service로 이동한다.
- repository는 mongoose model 직접 접근을 숨기는 thin abstraction으로 유지한다.
- builder는 복잡한 응답 조립이나 notification payload 조립처럼 조합 책임이 큰 곳에만 쓴다.
- guard/interceptor/filter/logger는 AOP 성격으로 분리하고, use-case 안에 섞지 않는다.
- 공통화는 "폴더가 비슷하다"가 아니라 "의미와 규칙이 진짜 같다"는 기준으로만 한다.
- 공통 모듈로 뺄 대상은 최소 2개 이상 도메인에서 같은 규칙으로 반복되는 경우로 제한하고, 그 전에는 도메인 내부에 둔다.

## Recommended Order

1. `health`
2. `auth`
3. `upload`
4. `notification`
5. `adopter`
6. `breeder`
7. `breeder-management`
8. admin 계열

## Current Progress

- `health` 도메인:
  - `controller -> use-case -> port -> adapter -> domain entity` 구조로 정리
  - 기존 응답 유지
  - e2e 테스트 통과
  - 타입체크 통과
- `auth` 도메인:
  - 토큰/세션 경계를 `use-case + port + adapter + token service`로 분리
  - `refresh/logout` 컨트롤러가 `AuthService` 대신 use-case를 직접 호출하도록 정리
  - 회원가입/소셜 사용자 체크 흐름을 `controller -> use-case -> port -> adapter`로 분리
  - 이메일/닉네임/브리더명 중복 확인 흐름을 `controller -> use-case -> registration port -> adapter`로 분리
  - 회원가입 전 임시 업로드 저장소를 별도 store로 분리하고, 프로필/서류 업로드와 가입 플로우가 같은 저장소를 공유하도록 정리
  - 프로필 이미지 업로드와 브리더 인증 서류 업로드를 `controller -> use-case -> file-store port -> adapter` 구조로 분리
  - 프로필 이미지 저장 대상 갱신과 임시 업로드 저장을 각각 `target port`와 `temp upload port` 뒤로 이동
  - 업로드 파일 크기/서류 타입 검증, 원본 파일명 정규화 규칙을 domain service로 이동
  - OAuth callback / redirect 쿠키 플로우를 `ProcessSocialLoginCallbackUseCase + social callback adapter + response factory`로 분리
  - `auth-registration`, `auth-registration-notification`, `auth-session`, `auth-temp-upload`, `auth-upload-file-store`, `auth-profile-image-target` 포트를 `abstract class + type` 기준으로 정리
  - 기존 응답/메시지 유지
  - 기존 auth e2e 테스트 통과
  - 업로드 응답 계약 e2e 테스트 추가
  - 타입체크 통과
- `district` 도메인:
  - 조회 경계를 `use-case + reader port + mongoose adapter + ordering domain service`로 분리
  - 기존 응답 유지
  - e2e 테스트 통과
  - 타입체크 통과
- `upload` 도메인:
  - 컨트롤러가 `UploadService` 대신 `use-case`를 직접 호출하도록 정리
  - 스토리지 경계를 `file store port + storage adapter`로 분리
  - 브리더 소유 리소스 조회/갱신을 `owner port + mongoose adapter`로 분리
  - 파일 검증/경로 정규화/사진 병합 규칙을 domain service로 이동
  - 기존 응답/메시지 유지
  - upload e2e 테스트 통과
  - 타입체크 통과
- `notification` 도메인:
  - 사용자 알림 inbox 조회/읽음 처리/삭제 흐름을 `controller -> use-case -> inbox port -> mongoose adapter` 구조로 분리
  - 응답 조립 책임을 mapper/domain service로 분리
  - 기존 `NotificationService`는 다른 도메인의 알림 생성/빌더 사용을 위해 유지하고, 사용자 inbox 메서드만 use-case 위임 형태로 얇게 정리
  - 기존 응답/메시지 유지
  - notification e2e 테스트 통과
  - 타입체크 통과
- `adopter` 도메인:
  - 프로필/즐겨찾기 흐름을 `controller -> use-case -> port -> adapter` 구조로 분리
  - 입양 신청 생성 명령 흐름을 `controller -> use-case -> port -> adapter` 구조로 분리
  - 후기 작성/후기 신고 명령 흐름을 `controller -> use-case -> port -> adapter` 구조로 분리
  - 후기 목록/상세 조회 흐름을 `controller -> use-case -> port -> adapter` 구조로 분리
  - 입양 신청 목록/상세 조회 흐름을 `controller -> use-case -> port -> adapter` 구조로 분리
  - 회원 탈퇴 명령 흐름을 `controller -> use-case -> port -> adapter` 구조로 분리
  - 신청 생성의 표준 응답/커스텀 응답 조립, 생성 응답 조립 책임을 domain service로 분리
  - 신청 생성의 개체 조회/중복 신청 검사/알림 발송을 command port와 notifier port 뒤로 이동
  - 후기 생성 응답과 후기 신고 응답 조립 책임을 response factory/domain service로 이동
  - 후기 생성의 신청 조회/후기 저장/브리더 통계 갱신을 review command port 뒤로 이동
  - 후기 목록/상세 조회 응답 조립 책임을 response factory/domain service로 이동
  - 회원 탈퇴 응답 조립 책임을 response factory/domain service로 이동
  - 새로 추가한 adopter 내부 계약은 `DTO class + type + abstract class` 기준으로 정리
  - 신청 목록/상세 응답 조립 책임을 assembler/domain service로 이동
  - 즐겨찾기 추가/삭제 규칙을 domain service로 이동
  - 프로필 이미지/브리더 이미지 signed URL 조립을 포트 뒤로 이동
  - 기존 응답/메시지 유지
  - adopter e2e 테스트 통과
  - 타입체크 통과
- `breeder-management` 도메인:
  - `dashboard + profile` 슬라이스를 먼저 `controller -> use-case -> port -> adapter` 구조로 분리
  - `verification status + verification submit + verification document upload/submit + application-form` 슬라이스를 `controller -> use-case -> port -> adapter` 구조로 추가 분리
  - `received applications + my-pets + my-reviews` 조회 슬라이스를 `controller -> use-case -> port -> adapter` 구조로 분리
  - `parent-pets + available-pets` 명령 슬라이스를 `controller -> use-case -> port -> adapter` 구조로 분리
  - `review reply` 슬라이스를 `controller -> use-case -> port -> adapter` 구조로 분리
  - `application detail + application status` 슬라이스를 `controller -> use-case -> port -> adapter` 구조로 분리
  - 대시보드/프로필 응답 조립 책임을 assembler/domain service로 이동
  - 프로필 수정의 중첩 update payload 구성 책임을 mapper/domain service로 이동
  - 부모견/분양개체 DTO -> 저장 모델 변환 책임을 command mapper/domain service로 이동
  - 답글 응답 조립 책임을 response factory/domain service로 이동
  - 신청 상세 응답 조립과 상태 변경 응답 생성을 assembler/factory domain service로 이동
  - verification 문서 signed URL 조립, 임시 draft 저장, 디스코드 payload 생성 책임을 domain service + port로 이동
  - 표준 질문 카탈로그, 신청 폼 검증, 간소화 질문 빌드 책임을 domain service로 이동
  - 기존 `BreederManagementService`는 남은 미분리 슬라이스 호환을 위해 유지하고, 분리된 메서드는 use-case 위임 형태로 얇게 정리
  - 기존 응답/메시지 유지
  - breeder-management e2e 테스트 통과
  - verification 문서 upload/submit 응답 계약 e2e 테스트 추가
  - 타입체크 통과
- `breeder` 도메인:
  - 공개 조회 `search + profile` 슬라이스를 `controller -> use-case -> port -> adapter` 구조로 분리
  - 공개 조회 `explore + popular` 슬라이스를 `controller -> use-case -> port -> adapter` 구조로 분리
  - 공개 조회 `reviews + pets + pet detail + parent-pets + application-form` 슬라이스를 `controller -> use-case -> port -> adapter` 구조로 분리
  - 검색 필터/정렬 조립 책임을 domain service로 분리
  - 탐색 필터/정렬 조립, 찜 목록 조회, 카드 응답 조립 책임을 domain service로 분리
  - 공개 프로필 응답 조립과 부모견 생년월일 포맷팅 책임을 assembler/domain service로 분리
  - 기존 `BreederService`는 후기/개체/신청폼 조회 흐름 호환을 위해 유지하고, 분리된 공개 조회 메서드를 use-case 위임 형태로 얇게 정리
  - 기존 `BreederExploreService`는 explore/popular 호환을 위해 유지하고, use-case 위임 형태로 얇게 정리
  - 기존 응답/메시지 유지
  - breeder e2e 테스트 통과
  - 타입체크 통과
