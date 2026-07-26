import { MongooseModule } from '@nestjs/mongoose';

import { Admin, AdminSchema } from '../../../schema/admin.schema';

import { AuthSharedModule } from '../../service/auth/shared/auth-shared.module';
import { AuthAdminLoginController } from './controller/auth-admin-login.controller';
import { AuthAdminTokenController } from './controller/auth-admin-token.controller';
import { LoginAdminUseCase } from './application/use-cases/login-admin.use-case';
import { RefreshAdminTokenUseCase } from './application/use-cases/refresh-admin-token.use-case';
import { AuthAdminAuthenticationService } from './domain/services/auth-admin-authentication.service';
import { AuthAdminLoginResultMapperService } from './domain/services/auth-admin-login-result-mapper.service';
import { AuthAdminRefreshTokenResultMapperService } from './domain/services/auth-admin-refresh-token-result-mapper.service';
import { AuthAdminRepository } from '../../service/auth/repository/auth-admin.repository';
import { AuthAdminRepositoryAdapter } from './infrastructure/auth-admin-repository.adapter';
import { AuthAdminBcryptAdapter } from './infrastructure/auth-admin-bcrypt.adapter';
import { AuthAdminJwtAdapter } from './infrastructure/auth-admin-jwt.adapter';
import { AUTH_ADMIN_READER_PORT } from './application/ports/auth-admin-reader.port';
import { AUTH_ADMIN_PASSWORD_PORT } from './application/ports/auth-admin-password.port';
import { AUTH_ADMIN_TOKEN_PORT } from './application/ports/auth-admin-token.port';

// 인증 > 관리자 인증 슬라이스 (관리자 로그인, 토큰 재발급)
// Admin 스키마·비밀번호 검증은 이 슬라이스 전용이며, JwtService 는 shared 에서 재노출받는다.
const AUTH_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]);

export const AUTH_ADMIN_MODULE_IMPORTS = [AUTH_ADMIN_SCHEMA_IMPORTS, AuthSharedModule];

export const AUTH_ADMIN_MODULE_CONTROLLERS = [AuthAdminLoginController, AuthAdminTokenController];

export const AUTH_ADMIN_MODULE_PROVIDERS = [
    LoginAdminUseCase,
    RefreshAdminTokenUseCase,
    AuthAdminAuthenticationService,
    AuthAdminLoginResultMapperService,
    AuthAdminRefreshTokenResultMapperService,
    AuthAdminRepository,
    AuthAdminRepositoryAdapter,
    AuthAdminBcryptAdapter,
    AuthAdminJwtAdapter,
    {
        provide: AUTH_ADMIN_READER_PORT,
        useExisting: AuthAdminRepositoryAdapter,
    },
    {
        provide: AUTH_ADMIN_PASSWORD_PORT,
        useExisting: AuthAdminBcryptAdapter,
    },
    {
        provide: AUTH_ADMIN_TOKEN_PORT,
        useExisting: AuthAdminJwtAdapter,
    },
];
