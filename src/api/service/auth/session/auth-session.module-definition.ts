import { AuthSharedModule } from '../shared/auth-shared.module';
import { AuthRefreshTokenController } from '../controller/auth-refresh-token.controller';
import { AuthLogoutController } from '../controller/auth-logout.controller';
import { RefreshAuthTokenUseCase } from '../application/use-cases/refresh-auth-token.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { AuthSessionAuthenticationService } from '../domain/services/auth-session-authentication.service';
import { AuthSessionAdapter } from '../infrastructure/auth-session.adapter';
import { AUTH_SESSION_PORT } from '../application/ports/auth-session.port';
import { AuthLogoutCookieInterceptor } from '../presentation/interceptors/auth-logout-cookie.interceptor';

// 인증 > 세션 슬라이스 (토큰 재발급, 로그아웃)
export const AUTH_SESSION_MODULE_IMPORTS = [AuthSharedModule];

export const AUTH_SESSION_MODULE_CONTROLLERS = [AuthRefreshTokenController, AuthLogoutController];

export const AUTH_SESSION_MODULE_PROVIDERS = [
    RefreshAuthTokenUseCase,
    LogoutUseCase,
    AuthSessionAuthenticationService,
    AuthSessionAdapter,
    {
        provide: AUTH_SESSION_PORT,
        useExisting: AuthSessionAdapter,
    },
    AuthLogoutCookieInterceptor,
];
