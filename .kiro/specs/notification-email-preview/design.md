# Design — notification-email-preview 도메인 (관리자)

## Overview

이메일 템플릿 미리보기·테스트 발송 도메인. 관리자가 실제 사용자에게 나가는
알림 이메일의 HTML 을 브라우저에서 확인하고, 자신에게 테스트 발송해 렌더링을 검증한다.

운영 이메일은 템플릿 수정 후 실제로 나가봐야 깨짐을 알 수 있는데,
그걸 사용자 대상 발송으로 확인할 수는 없어 별도 미리보기 경로를 뒀다.

위치: `src/api/service/notification/` (notification 도메인의 관리자 슬라이스).
라우트 prefix: `notification-email-preview-admin`.
상태: 구현 완료(dev).

## Architecture

```
notification/controller/notification-email-preview.controller.ts
notification/decorator/notification-email-preview-admin-controller.decorator.ts
common/mail/MailTemplateService     실제 HTML 생성 (운영과 동일 코드 경로)
```

**미리보기 전용 템플릿을 따로 두지 않는다.** 운영과 같은 `MailTemplateService` 를 호출해야
미리보기가 실제 발송물과 일치한다.

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/notification-email-preview-admin/preview-all` | 모든 이메일 템플릿 미리보기 |
| GET | `/api/notification-email-preview-admin/render` | 이메일 HTML 렌더링 미리보기 |
| POST | `/api/notification-email-preview-admin/application-confirmation` | 상담 신청 확인 이메일 테스트 |
| POST | `/api/notification-email-preview-admin/new-application` | 새 상담 신청 알림 이메일 테스트 |
| POST | `/api/notification-email-preview-admin/breeder-approval` | 브리더 승인 이메일 테스트 |
| POST | `/api/notification-email-preview-admin/breeder-rejection` | 브리더 반려 이메일 테스트 |
| POST | `/api/notification-email-preview-admin/document-reminder` | 서류 미제출 리마인드 이메일 테스트 |
| POST | `/api/notification-email-preview-admin/new-review` | 신규 후기 이메일 테스트 |

## Data Models

자체 스키마 없음. 미리보기용 더미 데이터로 템플릿을 렌더링한다.

`render` 는 HTML 문자열을 반환하므로 응답 형태가 다른 엔드포인트와 다르다.

## Correctness Properties

### Property 1: 미리보기와 실제 발송물이 같아야 한다
운영 템플릿 서비스를 그대로 호출한다. 미리보기 전용 분기를 만들지 않는다.

### Property 2: 테스트 발송 수신자는 요청 본문의 단일 이메일이다
각 요청 DTO 가 `@IsEmail() email: string` 하나를 받는다(배열 아님).
사용자 목록으로 대량 발송하는 경로가 없다.

### Property 3: `render` 만 봉투를 쓰지 않는다
`@Header('Content-Type', 'text/html; charset=utf-8')` 로 HTML 문자열을 그대로 반환한다.
브라우저로 직접 열어 확인하는 용도라 봉투로 감싸면 안 된다.
같은 컨트롤러의 나머지 8개는 전부 `ApiResponseDto` 봉투를 쓴다.

### Property 4: 관리자만 접근한다
템플릿 내용과 더미 데이터가 노출되므로 관리자 권한이 필수다.
인증 없이 `render` 를 호출하면 401 이 나간다(실측 확인).

## Error Handling

- 응답 봉투·상태 코드는 [`_conventions.md`](../_conventions.md) 를 따른다.
  단 `render` 는 위 Property 3 대로 예외다.

## Testing Strategy

- e2e: 템플릿 렌더링이 200 과 비어있지 않은 HTML 을 반환하는지
- 테스트 환경에서는 메일 발송 키를 비활성화해 실제 발송을 차단한다
