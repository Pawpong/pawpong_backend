import { StorageModule } from '../../../../common/storage/storage.module';
import { DiscordWebhookModule } from '../../../../common/discord/discord-webhook.module';

import { TermsModule } from '../../terms/terms.module';
import { AuthSharedModule } from '../shared/auth-shared.module';
import { AuthSignupController } from '../controller/auth-signup.controller';
import { AuthDuplicateCheckController } from '../controller/auth-duplicate-check.controller';
import { AuthV2RegisterAdopterController } from '../v2/controller/auth-v2-register-adopter.controller';
import { RegisterAdopterUseCase } from '../application/use-cases/register-adopter.use-case';
import { RegisterBreederUseCase } from '../application/use-cases/register-breeder.use-case';
import { RegisterAdopterV2UseCase } from '../v2/application/use-cases/register-adopter-v2.use-case';
import { CheckEmailDuplicateUseCase } from '../application/use-cases/check-email-duplicate.use-case';
import { CheckNicknameDuplicateUseCase } from '../application/use-cases/check-nickname-duplicate.use-case';
import { CheckBreederNameDuplicateUseCase } from '../application/use-cases/check-breeder-name-duplicate.use-case';
import { AuthSignupResultMapperService } from '../domain/services/auth-signup-result-mapper.service';
import { AuthBreederDocumentTypeService } from '../domain/services/auth-breeder-document-type.service';
import { AuthV2TermsAgreementValidatorService } from '../v2/domain/services/auth-v2-terms-agreement-validator.service';
import { AuthRegistrationNotificationAdapter } from '../infrastructure/auth-registration-notification.adapter';
import { AUTH_REGISTRATION_NOTIFICATION_PORT } from '../application/ports/auth-registration-notification.port';
import {
    REGISTER_ADOPTER_AUTH_SIGNUP,
    REGISTER_BREEDER_AUTH_SIGNUP,
} from '../application/tokens/auth-signup-completion.token';

// 인증 > 회원가입 슬라이스 (입양자/브리더 가입, 중복 검사, v2 약관 동의 가입)
// 소셜 가입 완료 흐름(social-login 슬라이스)이 가입 유스케이스를 Port 토큰으로 소비한다.
export const AUTH_SIGNUP_MODULE_IMPORTS = [AuthSharedModule, TermsModule, StorageModule, DiscordWebhookModule];

export const AUTH_SIGNUP_MODULE_CONTROLLERS = [
    AuthSignupController,
    AuthDuplicateCheckController,
    AuthV2RegisterAdopterController,
];

export const AUTH_SIGNUP_MODULE_PROVIDERS = [
    RegisterAdopterUseCase,
    RegisterBreederUseCase,
    RegisterAdopterV2UseCase,
    CheckEmailDuplicateUseCase,
    CheckNicknameDuplicateUseCase,
    CheckBreederNameDuplicateUseCase,
    AuthSignupResultMapperService,
    AuthBreederDocumentTypeService,
    AuthV2TermsAgreementValidatorService,
    AuthRegistrationNotificationAdapter,
    {
        provide: AUTH_REGISTRATION_NOTIFICATION_PORT,
        useExisting: AuthRegistrationNotificationAdapter,
    },
    {
        provide: REGISTER_ADOPTER_AUTH_SIGNUP,
        useExisting: RegisterAdopterUseCase,
    },
    {
        provide: REGISTER_BREEDER_AUTH_SIGNUP,
        useExisting: RegisterBreederUseCase,
    },
];

// 소셜 가입 완료(CompleteSocialRegistrationUseCase)가 소비
export const AUTH_SIGNUP_MODULE_EXPORTS = [REGISTER_ADOPTER_AUTH_SIGNUP, REGISTER_BREEDER_AUTH_SIGNUP];
