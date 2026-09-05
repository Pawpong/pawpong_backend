import { MongooseModule } from '@nestjs/mongoose';

import { PhoneWhitelist, PhoneWhitelistSchema } from '../../../../schema/phone-whitelist.schema';

import { AuthSharedModule } from '../shared/auth-shared.module';
import { AuthPhoneController } from '../controller/auth-phone.controller';
import { SendPhoneVerificationCodeUseCase } from '../application/use-cases/send-phone-verification-code.use-case';
import { VerifyPhoneVerificationCodeUseCase } from '../application/use-cases/verify-phone-verification-code.use-case';
import { AuthPhoneVerificationPolicyService } from '../domain/services/auth-phone-verification-policy.service';
import { AuthPhoneVerificationRepository } from '../repository/auth-phone-verification.repository';
import { AuthPhoneVerificationMemoryStore } from '../infrastructure/auth-phone-verification-memory.store';
import { AuthPhoneVerificationMongooseRegistryAdapter } from '../infrastructure/auth-phone-verification-mongoose-registry.adapter';
import { AuthPhoneVerificationAlimtalkAdapter } from '../infrastructure/auth-phone-verification-alimtalk.adapter';
import { AUTH_PHONE_VERIFICATION_REGISTRY_PORT } from '../application/ports/auth-phone-verification-registry.port';
import { AUTH_PHONE_VERIFICATION_STORE_PORT } from '../application/ports/auth-phone-verification-store.port';
import { AUTH_PHONE_VERIFICATION_SENDER_PORT } from '../application/ports/auth-phone-verification-sender.port';

// 인증 > 휴대폰 인증 슬라이스 (인증번호 발송/검증)
// 화이트리스트(테스트 번호 우회)는 이 슬라이스 전용 스키마다.
const AUTH_PHONE_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: PhoneWhitelist.name, schema: PhoneWhitelistSchema },
]);

export const AUTH_PHONE_MODULE_IMPORTS = [AUTH_PHONE_SCHEMA_IMPORTS, AuthSharedModule];

export const AUTH_PHONE_MODULE_CONTROLLERS = [AuthPhoneController];

export const AUTH_PHONE_MODULE_PROVIDERS = [
    SendPhoneVerificationCodeUseCase,
    VerifyPhoneVerificationCodeUseCase,
    AuthPhoneVerificationPolicyService,
    AuthPhoneVerificationRepository,
    AuthPhoneVerificationMemoryStore,
    AuthPhoneVerificationMongooseRegistryAdapter,
    AuthPhoneVerificationAlimtalkAdapter,
    {
        provide: AUTH_PHONE_VERIFICATION_REGISTRY_PORT,
        useExisting: AuthPhoneVerificationMongooseRegistryAdapter,
    },
    {
        provide: AUTH_PHONE_VERIFICATION_STORE_PORT,
        useExisting: AuthPhoneVerificationMemoryStore,
    },
    {
        provide: AUTH_PHONE_VERIFICATION_SENDER_PORT,
        useExisting: AuthPhoneVerificationAlimtalkAdapter,
    },
];
