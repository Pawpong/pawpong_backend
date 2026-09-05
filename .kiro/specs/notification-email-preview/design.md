# Design — notification-email-preview 도메인 (관리자)

## Overview

이메일 템플릿 미리보기·테스트 발송 도메인. 관리자가 실제 사용자에게 나가는
알림 이메일의 HTML 을 브라우저에서 확인하고, 테스트 발송해 렌더링을 검증한다.

운영 이메일은 템플릿 수정 후 실제로 보내봐야 깨짐을 알 수 있는데
사용자 대상 발송으로 확인할 수는 없어 별도 미리보기 경로를 뒀다.

위치: `src/api/service/notification/` (notification 도메인의 관리자 슬라이스).
라우트 prefix: `notification-email-preview-admin`.
상태: 구현 완료(dev). **실측 기준 2026-08-03** (소스 대조).

## Architecture

```
notification/controller/notification-email-preview.controller.ts
notification/application/use-cases/render-notification-email-preview.use-case.ts
notification/application/services/notification-email-preview-template.service.ts
notification/constants/notification-email-preview.constants.ts   미리보기 타입 목록
common/mail/mail-template.service.ts                             운영 HTML 생성
```

`NotificationEmailPreviewTemplateService` 는 **운영 `MailTemplateService` 를 주입해 위임한다.**
미리보기 전용 서비스가 따로 있지만 HTML 생성 로직을 복제하지 않고 감싸기만 하므로,
미리보기 결과가 실제 발송물과 같은 코드 경로에서 나온다.
미리보기 전용 서비스가 하는 일은 타입별 더미 데이터 주입과 목록 구성이다.

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

`render` 는 `?type=` 쿼리로 템플릿을 고른다. 타입 목록은
`notification-email-preview.constants.ts` 의 `NOTIFICATION_EMAIL_PREVIEW_TYPES` 가 소유한다.

## Data Models

자체 스키마 없음. 타입별 더미 데이터로 템플릿을 렌더링한다.

## Correctness Properties

### Property 1: 미리보기와 실제 발송물이 같은 코드에서 나온다
`MailTemplateService` 에 위임한다. 미리보기용으로 HTML 을 다시 짜지 않는다.
템플릿을 고치면 미리보기에도 그대로 반영된다.

### Property 2: `render` 는 봉투를 쓰지 않는다
`@Header('Content-Type', 'text/html; charset=utf-8')` 를 달고 HTML 문자열을 그대로 반환한다.
브라우저로 직접 열어 확인하는 용도이므로 JSON 봉투로 감싸면 쓸 수 없다.
[`_conventions.md`](../_conventions.md) 의 **의도된 봉투 예외** 목록에 포함돼 있다.

### Property 3: 관리자만 접근한다
템플릿 내용과 더미 데이터가 노출되므로 관리자 권한이 필수다.

## Error Handling

- 없는 `type`: 400.
- 메일 발송 실패는 응답에 사유를 담아 관리자가 원인을 알 수 있게 한다.
- 응답 봉투·상태 코드는 [`_conventions.md`](../_conventions.md) 를 따른다.
  단 `render` 의 HTML 응답은 봉투 대상이 아니다(Property 2).

## Testing Strategy

- e2e: `render` 가 200 과 비어있지 않은 HTML 을 반환하는지, `Content-Type` 이 `text/html` 인지
- `preview-all` 이 상수에 정의된 타입을 모두 포함하는지
- 테스트 환경에서는 메일 발송 키가 비어 있어 실제 발송이 나가지 않는다
