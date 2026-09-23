import { createHash } from 'node:crypto';
import type { Server } from 'node:http';
import { ExecutionContext, type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AuthNativeLoginController } from '../../controller/auth-native-login.controller';
import { AuthGoogleLoginController } from '../../controller/auth-google-login.controller';
import { StartNativeGoogleLoginUseCase } from '../../application/use-cases/start-native-google-login.use-case';
import { CompleteNativeGoogleLoginUseCase } from '../../application/use-cases/complete-native-google-login.use-case';
import { ExchangeNativeLoginUseCase } from '../../application/use-cases/exchange-native-login.use-case';
import {
    AUTH_NATIVE_SESSION_PORT,
    type AuthNativeSessionPort,
    type NativeAuthSession,
    type NativeAuthHandoff,
} from '../../application/ports/auth-native-session.port';
import {
    GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
    PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW,
} from '../../application/tokens/auth-social-flow.token';
import { AuthNativeLoginPolicyService } from '../../domain/services/auth-native-login-policy.service';
import { AuthSocialRedirectPathService } from '../../domain/services/auth-social-redirect-path.service';
import {
    AuthGoogleCallbackGuard,
    type GoogleCallbackRequest,
} from '../../presentation/guards/auth-google-callback.guard';
import { AuthNativeStartLimitGuard } from '../../presentation/guards/auth-native-start-limit.guard';
import { AuthGoogleCallbackResponseInterceptor } from '../../presentation/interceptors/auth-google-callback-response.interceptor';
import { AuthRedirectResponseInterceptor } from '../../presentation/interceptors/auth-redirect-response.interceptor';
import { AuthSocialCallbackResultFactoryService } from '../../presentation/services/auth-social-callback-result-factory.service';
import { AuthSocialLoginSuccessRedirectFactoryService } from '../../presentation/services/auth-social-login-success-redirect-factory.service';
import { AuthSocialSignupRedirectFactoryService } from '../../presentation/services/auth-social-signup-redirect-factory.service';
import { AuthSocialErrorRedirectFactoryService } from '../../presentation/services/auth-social-error-redirect-factory.service';
import { AuthSocialReactivationRedirectFactoryService } from '../../presentation/services/auth-social-reactivation-redirect-factory.service';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';

/** HTTP 계약 테스트용 저장소. 실제 원자적 소비와 TTL은 Redis 통합 테스트에서 별도 검증한다. */
class SessionFixture implements AuthNativeSessionPort {
    sessions = new Map<string, NativeAuthSession>();
    handoffs = new Map<string, NativeAuthHandoff>();
    allow = true;
    allowStart() {
        return Promise.resolve(this.allow);
    }
    saveSession(state: string, value: NativeAuthSession) {
        this.sessions.set(state, value);
        return Promise.resolve();
    }
    consumeSession(state: string) {
        const value = this.sessions.get(state);
        this.sessions.delete(state);
        return Promise.resolve(value || null);
    }
    saveHandoff(code: string, value: NativeAuthHandoff) {
        this.handoffs.set(code, value);
        return Promise.resolve();
    }
    consumeHandoff(code: string, state: string, challenge: string) {
        const value = this.handoffs.get(code);
        if (!value || value.state !== state || value.codeChallenge !== challenge) return Promise.resolve(null);
        this.handoffs.delete(code);
        return Promise.resolve(value);
    }
}

function dataFrom(response: request.Response): { state: string; authorizationUrl: string; redirectUrl: string } {
    return (response.body as { data: { state: string; authorizationUrl: string; redirectUrl: string } }).data;
}

describe('native Google authentication HTTP contract', () => {
    let app: INestApplication;
    let store: SessionFixture;
    let passport: jest.SpyInstance;
    const processLogin = jest.fn();
    const verifier = 'valid-verifier-'.repeat(5);
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    const config: Record<string, string> = {
        APP_ENV: 'production',
        GOOGLE_CLIENT_ID: 'test-client',
        GOOGLE_CALLBACK_URL: 'https://api.pawpong.kr/api/auth/google/callback',
    };
    const profile = { provider: 'google', providerId: 'test-id', email: 'test@example.com', name: 'Test' };
    const loginResult = {
        kind: 'login_success',
        frontendUrl: 'https://pawpong.kr',
        originUrl: 'https://pawpong.kr|/chat',
        tokens: { accessToken: 'test-access', refreshToken: 'test-refresh' },
    };

    beforeAll(async () => {
        store = new SessionFixture();
        passport = jest
            .spyOn(Object.getPrototypeOf(AuthGoogleCallbackGuard.prototype), 'canActivate')
            .mockImplementation((context: unknown) => {
                const req = (context as ExecutionContext).switchToHttp().getRequest<GoogleCallbackRequest>();
                req.user = { ...profile, originUrl: typeof req.query.state === 'string' ? req.query.state : '' };
                return Promise.resolve(true);
            });
        const module = await Test.createTestingModule({
            controllers: [AuthNativeLoginController, AuthGoogleLoginController],
            providers: [
                { provide: ConfigService, useValue: { get: (key: string) => config[key] } },
                { provide: AUTH_NATIVE_SESSION_PORT, useValue: store },
                { provide: PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW, useValue: { execute: processLogin } },
                {
                    provide: GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
                    useValue: { execute: () => 'https://accounts.google.com/web-flow' },
                },
                { provide: CustomLoggerService, useValue: { log: jest.fn() } },
                StartNativeGoogleLoginUseCase,
                CompleteNativeGoogleLoginUseCase,
                ExchangeNativeLoginUseCase,
                AuthNativeLoginPolicyService,
                AuthSocialRedirectPathService,
                AuthGoogleCallbackGuard,
                AuthNativeStartLimitGuard,
                AuthGoogleCallbackResponseInterceptor,
                AuthRedirectResponseInterceptor,
                AuthSocialCallbackResultFactoryService,
                AuthSocialLoginSuccessRedirectFactoryService,
                AuthSocialSignupRedirectFactoryService,
                AuthSocialErrorRedirectFactoryService,
                AuthSocialReactivationRedirectFactoryService,
            ],
        }).compile();
        app = module.createNestApplication();
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        await app.init();
    });

    beforeEach(() => {
        store.sessions.clear();
        store.handoffs.clear();
        store.allow = true;
        config.APP_ENV = 'production';
        processLogin.mockReset().mockResolvedValue(loginResult);
        passport.mockClear();
    });

    afterAll(async () => {
        passport.mockRestore();
        await app.close();
    });

    const start = (extra: Record<string, unknown> = {}) =>
        request(app.getHttpServer() as Server)
            .post('/api/v2/auth/native/google/start')
            .send({ codeChallenge: challenge, frontendOrigin: 'https://pawpong.kr', returnUrl: '/chat', ...extra });
    const callback = (state: string, extra: Record<string, string> = {}) =>
        request(app.getHttpServer() as Server)
            .get('/api/auth/google/callback')
            .query({ state, code: 'provider-code', ...extra });
    const exchange = (code: string, state: string, codeVerifier = verifier) =>
        request(app.getHttpServer() as Server)
            .post('/api/v2/auth/native/exchange')
            .send({ code, state, codeVerifier });

    it('returns the enveloped contract and exchanges once without exposing tokens in the app URL', async () => {
        const response = await start().expect(200);
        expect(response.headers['cache-control']).toBe('no-store');
        expect(response.body).toMatchObject({ success: true, code: 200 });
        const { state, authorizationUrl } = dataFrom(response);
        const google = new URL(authorizationUrl);
        expect(google.origin + google.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
        expect(google.searchParams.get('state')).toBe(state);
        expect(google.searchParams.get('redirect_uri')).toBe(config.GOOGLE_CALLBACK_URL);
        const completed = await callback(state).expect(302);
        expect(completed.headers['referrer-policy']).toBe('no-referrer');
        const appUrl = new URL(completed.headers.location);
        expect(appUrl.origin).toBe('null');
        expect(appUrl.protocol + '//' + appUrl.host + appUrl.pathname).toBe('pawpong://auth/callback');
        expect(completed.headers.location).not.toMatch(/test-access|test-refresh/);
        expect(appUrl.searchParams.get('state')).toBe(state);
        const code = appUrl.searchParams.get('code')!;
        const result = await exchange(code, state).expect(200);
        expect(result.headers['cache-control']).toBe('no-store');
        const web = new URL(dataFrom(result).redirectUrl);
        expect(web.origin + web.pathname).toBe('https://pawpong.kr/login/success');
        expect(web.searchParams.get('accessToken')).toBe('test-access');
        expect(web.searchParams.get('returnUrl')).toBe('/chat');
        await exchange(code, state).expect(401);
    });

    it.each([
        'https://evil.example',
        'https://pawpong.kr.evil.example',
        'https://www.pawpong.kr',
        'https://pawpong.kr/',
        'http://10.0.2.2:3000',
        'https://dev.pawpong.kr',
    ])('rejects production origin %s', async (frontendOrigin) => {
        await start({ frontendOrigin }).expect(400);
        expect(store.sessions.size).toBe(0);
    });

    it.each(['//evil.example', '/\\evil.example', 'https://evil.example', '/chat\n', '/chat\u0000'])(
        'rejects unsafe returnUrl %s',
        async (returnUrl) => {
            await start({ returnUrl }).expect(400);
        },
    );

    it.each(['bad', 'a'.repeat(44), 'a'.repeat(43), '='.repeat(43)])(
        'rejects malformed/noncanonical challenge',
        async (codeChallenge) => {
            await start({ codeChallenge }).expect(400);
        },
    );

    it('allows the Android emulator origin only in local and preserves it through callback', async () => {
        config.APP_ENV = 'local';
        const response = await start({ frontendOrigin: 'http://10.0.2.2:3000' }).expect(200);
        const { state } = dataFrom(response);
        const completed = await callback(state).expect(302);
        const code = new URL(completed.headers.location).searchParams.get('code')!;
        const result = await exchange(code, state).expect(200);
        expect(new URL(dataFrom(result).redirectUrl).origin).toBe('http://10.0.2.2:3000');
    });

    it('wrong state or verifier cannot consume a valid exchange code', async () => {
        const response = await start().expect(200);
        const state = dataFrom(response).state;
        const completed = await callback(state).expect(302);
        const code = new URL(completed.headers.location).searchParams.get('code')!;
        await exchange(code, 'native_google_' + 'B'.repeat(43)).expect(401);
        await exchange(code, state, 'wrong-verifier-'.repeat(5)).expect(401);
        await exchange(code, state).expect(200);
    });

    it('provider denial consumes state and bypasses Passport, repeated callbacks cannot generate tokens', async () => {
        const response = await start().expect(200);
        const state = dataFrom(response).state;
        const denied = await callback(state, { error: 'access_denied' }).expect(302);
        expect(new URL(denied.headers.location).searchParams.get('error')).toBe('cancelled');
        const replay = await callback(state).expect(302);
        expect(new URL(replay.headers.location).searchParams.get('error')).toBe('authentication_failed');
        expect(passport).not.toHaveBeenCalled();
        expect(processLogin).not.toHaveBeenCalled();
    });

    it('unknown/expired native state never reaches Passport or web fallback', async () => {
        const completed = await callback('native_google_' + 'A'.repeat(43)).expect(302);
        expect(new URL(completed.headers.location).searchParams.get('error')).toBe('authentication_failed');
        expect(passport).not.toHaveBeenCalled();
    });

    it('token-exchange/provider failure closes the native auth session', async () => {
        const response = await start().expect(200);
        passport.mockRejectedValueOnce(new Error('provider failure containing private details'));
        const completed = await callback(dataFrom(response).state).expect(302);
        expect(new URL(completed.headers.location).searchParams.get('error')).toBe('authentication_failed');
        expect(completed.headers.location).not.toContain('private');
        expect(processLogin).not.toHaveBeenCalled();
    });

    it.each([
        {
            kind: 'signup',
            frontendUrl: 'https://pawpong.kr',
            tempUserId: 'temp_test',
            userProfile: profile,
            expectedPath: '/signup',
        },
        {
            kind: 'reactivation',
            frontendUrl: 'https://pawpong.kr',
            role: 'adopter',
            reactivationToken: 'test-reactivation',
            expiresIn: 600,
            email: 'test@example.com',
            name: 'Test',
            expectedPath: '/login',
        },
    ])('preserves $kind result', async (result) => {
        processLogin.mockResolvedValueOnce(result);
        const response = await start().expect(200);
        const state = dataFrom(response).state;
        const completed = await callback(state).expect(302);
        expect(completed.headers.location).not.toContain('test-reactivation');
        const code = new URL(completed.headers.location).searchParams.get('code')!;
        const exchanged = await exchange(code, state).expect(200);
        expect(new URL(dataFrom(exchanged).redirectUrl).pathname).toBe(result.expectedPath);
    });

    it('preserves the existing web Google start and callback contracts', async () => {
        await request(app.getHttpServer() as Server)
            .get('/api/auth/google')
            .expect(302)
            .expect('Location', 'https://accounts.google.com/web-flow');
        const response = await callback('https://pawpong.kr|/chat').expect(302);
        expect(new URL(response.headers.location).pathname).toBe('/login/success');
        expect(passport).toHaveBeenCalledTimes(1);
    });

    it('rate-limit denial returns 429 without issuing state', async () => {
        store.allow = false;
        await start().expect(429);
        expect(store.sessions.size).toBe(0);
    });
});
