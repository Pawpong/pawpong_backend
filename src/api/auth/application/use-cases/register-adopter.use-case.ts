import { Inject, Injectable } from '@nestjs/common';

import { UserStatus } from '../../../../common/enum/user.enum';
import { AUTH_REGISTRATION_PORT, type AuthRegistrationPort } from '../ports/auth-registration.port';
import {
    AUTH_REGISTRATION_NOTIFICATION_PORT,
    type AuthRegistrationNotificationPort,
} from '../ports/auth-registration-notification.port';
import { AUTH_TOKEN_PORT, type AuthTokenPort } from '../ports/auth-token.port';
import { type RegisterAdopterAuthSignupCommand, type RegisterAdopterAuthSignupResult } from '../types/auth-signup.type';
import { AuthSocialIdentityService } from '../../domain/services/auth-social-identity.service';
import { AuthStoredFileNameService } from '../../domain/services/auth-stored-file-name.service';
import { AuthPhoneNumberNormalizerService } from '../../domain/services/auth-phone-number-normalizer.service';
import { AuthSignupResultMapperService } from '../../domain/services/auth-signup-result-mapper.service';
import { AuthSignupValidationService } from '../../domain/services/auth-signup-validation.service';

@Injectable()
export class RegisterAdopterUseCase {
    constructor(
        @Inject(AUTH_REGISTRATION_PORT)
        private readonly authRegistrationPort: AuthRegistrationPort,
        @Inject(AUTH_REGISTRATION_NOTIFICATION_PORT)
        private readonly authRegistrationNotificationPort: AuthRegistrationNotificationPort,
        @Inject(AUTH_TOKEN_PORT)
        private readonly authTokenPort: AuthTokenPort,
        private readonly authSocialIdentityService: AuthSocialIdentityService,
        private readonly authStoredFileNameService: AuthStoredFileNameService,
        private readonly authPhoneNumberNormalizerService: AuthPhoneNumberNormalizerService,
        private readonly authSignupResultMapperService: AuthSignupResultMapperService,
        private readonly authSignupValidationService: AuthSignupValidationService,
    ) {}

    async execute(dto: RegisterAdopterAuthSignupCommand): Promise<RegisterAdopterAuthSignupResult> {
        const { provider, providerId } = this.authSocialIdentityService.parseRequiredTempId(dto.tempId);

        const existingAdopter = await this.authRegistrationPort.findAdopterBySocialAuth(provider, providerId);
        this.authSignupValidationService.assertAdopterSocialAccountAvailable(existingAdopter);
        this.authSignupValidationService.ensureAdopterRegistrationInput(dto.email, dto.nickname);

        const existingNickname = await this.authRegistrationPort.findAdopterByNickname(dto.nickname);
        this.authSignupValidationService.assertAdopterNicknameAvailable(existingNickname);

        const savedAdopter = await this.authRegistrationPort.createAdopter({
            emailAddress: dto.email,
            nickname: dto.nickname,
            phoneNumber: this.authPhoneNumberNormalizerService.normalize(dto.phone),
            profileImageFileName: this.authStoredFileNameService.extract(dto.profileImage) || '',
            socialAuthInfo: {
                authProvider: provider,
                providerUserId: providerId,
                providerEmail: dto.email,
            },
            accountStatus: UserStatus.ACTIVE,
            userRole: 'adopter',
            marketingAgreed: dto.marketingAgreed || false,
            notificationSettings: {
                emailNotifications: true,
                pushNotifications: true,
                applicationStatusNotifications: true,
                favoriteBreederNotifications: true,
            },
            favoriteBreederList: [],
            submittedReportList: [],
        });

        const userId = savedAdopter._id.toString();
        const tokens = this.authTokenPort.generateTokens(userId, savedAdopter.emailAddress, 'adopter');
        const hashedRefreshToken = await this.authTokenPort.hashRefreshToken(tokens.refreshToken);
        await this.authRegistrationPort.saveAdopterRefreshToken(userId, hashedRefreshToken);

        void this.authRegistrationNotificationPort.notifyAdopterRegistered({
            userId,
            email: savedAdopter.emailAddress,
            nickname: savedAdopter.nickname || dto.nickname,
            phone: savedAdopter.phoneNumber,
            registrationType: 'social',
            provider,
        });

        return this.authSignupResultMapperService.toAdopterResult(savedAdopter, tokens);
    }
}
