/**
 * 채팅 Socket.IO 네임스페이스의 CORS 화이트리스트.
 *
 * `origin: '*'` 와 `credentials: true` 는 브라우저가 거부하는 조합이라,
 * websocket 이 아닌 polling 으로 폴백되는 순간 연결이 끊긴다.
 * 그래서 HTTP CORS(main.ts)와 같은 기준의 화이트리스트를 사용한다.
 */

/** 배포/개발 프론트엔드 고정 오리진. main.ts 의 HTTP CORS 목록과 같은 기준을 유지한다. */
const STATIC_CHAT_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://local.pawpong.kr:3000',
    'https://dev.pawpong.kr',
    'https://pawpong.kr',
    'https://www.pawpong.kr',
    'https://admin.pawpong.kr',
    'https://dev.admin.pawpong.kr',
];

/** Vercel 프리뷰 배포는 URL 이 매번 달라 패턴으로 허용한다. */
const VERCEL_PREVIEW_ORIGIN = /^https:\/\/pawpong.*\.vercel\.app$/;

/** 환경별 프론트엔드 URL 을 화이트리스트 앞에 붙인다. 쉼표로 여러 개를 넣을 수 있다. */
export function buildChatCorsOrigins(env: NodeJS.ProcessEnv = process.env): (string | RegExp)[] {
    const configured = [env.FRONTEND_URL, env.FRONTEND_URL_LOCAL, env.FRONTEND_URL_PROD]
        .flatMap((value) => (value ? value.split(',') : []))
        .map((value) => value.trim().replace(/\/+$/, ''))
        .filter((value) => value.length > 0);

    return [...new Set([...configured, ...STATIC_CHAT_ORIGINS]), VERCEL_PREVIEW_ORIGIN];
}

/**
 * Origin 헤더가 없는 요청(모바일 앱, 서버 스크립트, 운영 점검 도구)은 브라우저의
 * 동일 출처 정책 대상이 아니므로 그대로 허용하고, 브라우저 요청만 화이트리스트로 거른다.
 */
export function isAllowedChatOrigin(origin: string | undefined, allowed: (string | RegExp)[]): boolean {
    if (!origin) return true;

    return allowed.some((entry) => (entry instanceof RegExp ? entry.test(origin) : entry === origin));
}

/** `@WebSocketGateway({ cors })` 에 넣을 origin 검사 함수를 만든다. */
export function buildChatCorsOrigin(env: NodeJS.ProcessEnv = process.env) {
    const allowed = buildChatCorsOrigins(env);

    return (origin: string | undefined, callback: (error: Error | null, allow: boolean) => void): void => {
        callback(null, isAllowedChatOrigin(origin, allowed));
    };
}
