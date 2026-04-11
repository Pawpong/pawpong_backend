import type { Request } from 'express';

export type SocialOAuthProvider = 'google' | 'kakao' | 'naver';

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

