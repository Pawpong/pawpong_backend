/** 네이티브 인증의 state와 PKCE 교환 결과를 공유 저장소에서 한 번만 소비한다. */
export const AUTH_NATIVE_SESSION_PORT = Symbol('AUTH_NATIVE_SESSION_PORT');

export type NativeAuthSession = {
    codeChallenge: string;
    frontendOrigin: string;
    returnUrl: string;
};

export type NativeAuthHandoff = {
    state: string;
    codeChallenge: string;
    redirectUrl: string;
};

export type NativeAuthCallback = {
    state: string;
    session?: NativeAuthSession;
    error?: 'cancelled' | 'authentication_failed';
};

export interface AuthNativeSessionPort {
    allowStart(clientIp: string): Promise<boolean>;
    saveSession(state: string, session: NativeAuthSession): Promise<void>;
    consumeSession(state: string): Promise<NativeAuthSession | null>;
    saveHandoff(code: string, handoff: NativeAuthHandoff): Promise<void>;
    consumeHandoff(code: string, state: string, codeChallenge: string): Promise<NativeAuthHandoff | null>;
}
