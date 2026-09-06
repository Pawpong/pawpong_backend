import type { AuthSocialCookieOptions } from '../application/ports/auth-social-callback.port';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * 인증 쿠키별 속성 정의 — **굽는 쪽과 만료시키는 쪽이 반드시 이 하나를 본다.**
 *
 * 쿠키 삭제는 name + domain + path 로 대상을 찾지만, 만료 응답의 httpOnly 가 원래 값과 다르면
 * 브라우저에는 속성이 뒤바뀐 쿠키가 남는다. accessToken 을 httpOnly 로 만료시키면
 * 프론트가 document.cookie 로 읽지도 지우지도 못하게 되어 로그아웃이 되지 않는다.
 *
 * - accessToken: 웹이 JS 로 읽어 Authorization 헤더를 만들기 때문에 httpOnly 가 아니다.
 * - refreshToken: 재발급 전용이라 JS 노출이 필요 없다.
 * - userRole: 화면 분기용이라 JS 가 읽는다.
 */
export const AUTH_COOKIE_POLICIES = {
    accessToken: { httpOnly: false, maxAge: DAY_IN_MS },
    refreshToken: { httpOnly: true, maxAge: 7 * DAY_IN_MS },
    userRole: { httpOnly: false, maxAge: DAY_IN_MS },
} as const;

export type AuthCookieName = keyof typeof AUTH_COOKIE_POLICIES;

/** 응답에 나가는 순서 — 굽기·만료가 같은 순서를 쓴다. */
export const AUTH_COOKIE_NAMES = Object.keys(AUTH_COOKIE_POLICIES) as AuthCookieName[];

/** 로그인 시 쿠키 옵션 (공통 옵션 + 쿠키별 httpOnly/maxAge). */
export const buildAuthCookieOptions = (
    name: AuthCookieName,
    baseOptions: AuthSocialCookieOptions,
): AuthSocialCookieOptions & { maxAge: number } => ({
    ...baseOptions,
    ...AUTH_COOKIE_POLICIES[name],
});

/**
 * 로그아웃 시 만료 옵션. httpOnly 는 로그인 때와 같은 값을 쓰고 maxAge 만 0 으로 둔다.
 * 여기서 httpOnly 를 공통 옵션에 맡기면(과거 동작) accessToken 이 httpOnly 로 덮여 삭제가 무력해진다.
 */
export const buildExpiredAuthCookieOptions = (
    name: AuthCookieName,
    baseOptions: AuthSocialCookieOptions,
): AuthSocialCookieOptions & { maxAge: number } => ({
    ...baseOptions,
    httpOnly: AUTH_COOKIE_POLICIES[name].httpOnly,
    maxAge: 0,
});
