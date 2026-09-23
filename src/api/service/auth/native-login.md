# 앱 Google 로그인

Google 인증 화면은 RN WebView 대신 시스템 인증 브라우저에서 연다. 기존 웹 OAuth 클라이언트와 `/api/auth/google/callback`은 유지한다. 웹과 앱의 쿠키 저장소가 다르므로 앱이 일회용 결과를 교환한 뒤 **WebView 안에서** 기존 `/login/success` → 프론트 BFF 쿠키 저장을 실행한다.

## 계약

- `POST /api/v2/auth/native/google/start`: `{ codeChallenge, frontendOrigin, returnUrl? }`
- 응답 `200`: `{ success: true, code: 200, data: { authorizationUrl, state }, timestamp }`
- 고정 앱 복귀: `pawpong://auth/callback?code=…&state=…`
- 제공자 취소: `pawpong://auth/callback?error=cancelled&state=…`
- 기타 인증 실패: `error=authentication_failed`. 오류 원문은 앱 URL에 포함하지 않는다.
- `POST /api/v2/auth/native/exchange`: `{ code, state, codeVerifier }`
- 응답 `200`: `{ success: true, code: 200, data: { redirectUrl }, timestamp }`

앱은 `state` 일치와 결과 `redirectUrl`의 현재 WebView 출처 및 `/login/success`, `/signup`, `/login` 경로를 검사한다. 브라우저 쿠키를 복사하거나 앱 스킴에 access/refresh token을 넣지 않는다. 기존 웹 결과 계약상 로그인 토큰은 교환된 HTTPS 결과 URL에 포함된다.

PKCE verifier는 RFC 7636의 43~128자 unreserved 문자열, challenge는 SHA-256의 canonical base64url 43자이다. OAuth state는 256비트 난수로 10분, 결과 코드는 별도의 256비트 난수로 90초 유효하다. Redis Lua가 검증과 소비를 원자적으로 수행한다. 만료·잘못된 verifier·state 불일치·중복 교환은 성공하지 않는다. Redis가 없으면 인증을 실패 처리하며 프로세스 메모리로 대체하지 않는다.

## 출처와 요청 제한

운영은 `https://pawpong.kr`만 허용한다. `APP_ENV=dev/development/local`은 `https://dev.pawpong.kr`을 추가로 허용하며 `APP_ENV=local`만 localhost, 127.0.0.1, 10.0.2.2의 3000번 HTTP 출처를 허용한다. 이 값은 OAuth 클라이언트나 Google callback 설정을 선택하지 않는다. 기존 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`을 서버 설정에서 사용한다.

인증 시작은 공유 Redis에서 IP당 10분 30회로 제한한다. 이 엔드포인트는 앱 전역 `trust proxy=true` 대신 `proxy-addr`의 loopback/linklocal/uniquelocal 경계로 요청 주소를 계산한다. nginx가 덧붙인 공개 발신자에서 탐색을 멈춰 앞에 삽입한 X-Forwarded-For를 신뢰하지 않는다. 알 수 없는 공개 reverse proxy는 한 IP로 묶이는 보수적 제한이 적용되므로 배포 토폴로지가 바뀌면 신뢰할 proxy 대역을 별도로 검토해야 한다.

## 배포·검증

백엔드를 먼저 배포하고 새 RN 바이너리를 배포한다. 필요한 서버 설정은 기존 Google OAuth·Redis 설정이며 추가 비밀 키는 없다. 기존 Google 웹 로그인, 신규 가입, 계정 복구 결과는 같은 유스케이스를 사용한다.

```sh
RUN_NATIVE_AUTH_REDIS_TESTS=true pnpm exec jest --runInBand --testPathPattern='auth/test/native'
pnpm exec jest --runInBand --runTestsByPath src/common/interceptor/test/logging.interceptor.spec.ts
pnpm build
```

Redis 통합 테스트는 **이미 실행 중인 127.0.0.1:6379**에 고유 테스트 키만 만들고 정리한다. Redis를 시작하거나 flush하지 않는다. 환경 변수가 없으면 이 통합 테스트는 건너뛴다.

HTTP/Redis 테스트는 실제 Google 계정 로그인 완료를 대신하지 않는다. 배포된 앱에서 기존 회원·신규 가입·복구·Google 취소 후 재시도를 검증해야 한다.

근거: [Google OAuth 정책](https://developers.google.com/identity/protocols/oauth2/policies), [Expo SDK 54 WebBrowser](https://docs.expo.dev/versions/v54.0.0/sdk/webbrowser/).
