# 알림 (Notification) 도메인

## 개요

앱 내 알림 목록과 FCM 푸시를 담당합니다. 슬라이스는 세 갈래입니다.

- `inbox` — 앱 내 알림 목록 조회·읽음 처리
- `push` — FCM 발송과 디바이스 토큰 등록/해제
- `dispatch` — 도메인 이벤트를 받아 알림 생성과 푸시를 함께 처리

## 디바이스 토큰 등록 (RN 연동)

푸시를 받으려면 기기 토큰이 서버에 있어야 합니다. 두 단계로 나뉩니다.

### 1. 익명 기기 등록 `POST /api/v2/notification/device-token` (인증 불필요)

로그인 전에도 호출할 수 있는 공개 엔드포인트입니다.

로그인해야만 토큰을 등록할 수 있으면 계정이 없는 사용자는 푸시를 한 번도 받지 못합니다.
앱 심사자도 여기에 해당해 심사에서 푸시 동작을 보여줄 수 없습니다.
그래서 설치 직후 기기를 먼저 등록하고 안내 푸시를 한 번 보냅니다.

기기는 `push_devices` 컬렉션에 계정과 무관하게 저장됩니다.

### 2. 계정 바인딩 `POST /api/v2/notification/push-token` (인증 필요)

로그인 후 같은 토큰을 계정에 연결합니다. 입양자/브리더 도큐먼트의 `pushDeviceTokens` 에 저장됩니다.

해제는 `DELETE /api/v2/notification/push-token` 이며, 기기 핸드오프 시 이전 계정에서 토큰을 제거합니다.

### RN 웹뷰 흐름

```
소셜 로그인 성공
  → 백엔드가 /login/success?accessToken=... 로 리다이렉트
  → 프론트가 BFF 로 쿠키 저장 후 postMessage({type:'REQUEST_FCM_TOKEN', accessToken})
  → RN HomeScreen 이 messaging().getToken()
  → POST /api/v2/notification/push-token (accessToken 헤더)
```

운영에서만 `/login/success` 를 건너뛰던 시절에는 이 postMessage 가 실행되지 않아
운영 앱 사용자의 푸시 토큰 등록이 일어나지 않았습니다. 소셜 콜백이 모든 환경에서
같은 경로를 타도록 바뀌면서 해소됐습니다 — [Auth 모듈 문서](../auth/README.md) 참고.

## 파일 구조

```text
notification/
├── application/
│   ├── ports/            # 푸시 발송·토큰 저장·기기 레지스트리 경계
│   └── use-cases/        # 등록/해제/익명 기기 등록/발송
├── controller/
├── infrastructure/       # Firebase 발송, mongoose 어댑터
├── push/                 # 푸시 슬라이스 모듈 정의
├── repository/
└── swagger/
```

## 주의

- 토큰은 입양자/브리더 도큐먼트에 저장되므로 두 repository 가 필요합니다.
  AdopterModule/BreederManagementModule 을 import 하면 순환이 생겨 repository 만 푸시 슬라이스에 직접 등록합니다.
- 발송 실패는 예외를 던지지 않고 로그만 남깁니다. 알림 실패가 원래 요청을 500 으로 만들면 안 됩니다.
