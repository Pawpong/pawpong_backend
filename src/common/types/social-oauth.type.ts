import type { Request } from 'express';

export type SocialOAuthProvider = 'google' | 'kakao' | 'naver' | 'apple';

export type SocialOAuthUser = {
    provider: SocialOAuthProvider;
    providerId: string;
    email: string;
    name: string;
    profileImage?: string;
    originUrl?: string;
    needsEmail?: boolean;
};

export type OAuthStateRequest = Request & {
    query: Request['query'] & {
        state?: string;
    };
};

export type SocialAuthDoneCallback = (error: Error | null, user?: SocialOAuthUser | false) => void;

export type GoogleOAuthProfile = {
    id: string;
    name?: {
        givenName?: string;
        familyName?: string;
    };
    emails?: Array<{
        value?: string;
    }>;
    photos?: Array<{
        value?: string;
    }>;
};

export type KakaoOAuthProfile = {
    id: string | number;
    username?: string;
    _json?: {
        kakao_account?: {
            email?: string;
            profile?: {
                nickname?: string;
                profile_image_url?: string;
            };
        };
    };
};

export type NaverOAuthProfile = {
    _json: {
        id: string;
        email: string;
        nickname?: string;
        profile_image?: string;
    };
};

/**
 * Apple 이 form_post 로 돌려주는 콜백 본문.
 *
 * `user` 는 **최초 인증 한 번만** 오고, 두 번째 로그인부터는 아예 없다.
 * 따라서 이름은 첫 응답에서 반드시 저장해야 하며, 이후에는 id_token 의 sub/email 만 신뢰한다.
 */
export type AppleCallbackBody = {
    code?: string;
    id_token?: string;
    state?: string;
    /** JSON 문자열. 최초 인증 시에만 존재한다. */
    user?: string;
    error?: string;
};

/** Apple 콜백의 `user` 필드를 파싱한 결과 */
export type AppleCallbackUser = {
    name?: {
        firstName?: string;
        lastName?: string;
    };
    email?: string;
};

/** Apple id_token(JWT) 에서 꺼내 쓰는 클레임 */
export type AppleIdTokenClaims = {
    /** Apple 이 앱마다 부여하는 영구 사용자 식별자 */
    sub: string;
    email?: string;
    /** 'true' | true — Apple 이 문자열로 줄 때가 있어 둘 다 받는다 */
    email_verified?: boolean | string;
    /** 이메일 가리기를 선택하면 true. 주소가 @privaterelay.appleid.com 이 된다 */
    is_private_email?: boolean | string;
};
