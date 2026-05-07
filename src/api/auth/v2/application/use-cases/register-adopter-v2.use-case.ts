import { Inject, Injectable } from '@nestjs/common';

import { UserStatus } from '../../../../../common/enum/user.enum';
import { AUTH_REGISTRATION_PORT, type AuthRegistrationPort } from '../../../application/ports/auth-registration.port';
import {
    AUTH_REGISTRATION_NOTIFICATION_PORT,
    type AuthRegistrationNotificationPort,
} from '../../../application/ports/auth-registration-notification.port';
import { AUTH_TOKEN_PORT, type AuthTokenPort } from '../../../application/ports/auth-token.port';
import { AuthSocialIdentityService } from '../../../domain/services/auth-social-identity.service';
import { AuthStoredFileNameService } from '../../../domain/services/auth-stored-file-name.service';
import { AuthPhoneNumberNormalizerService } from '../../../domain/services/auth-phone-number-normalizer.service';
import { AuthSignupResultMapperService } from '../../../domain/services/auth-signup-result-mapper.service';
import { AuthSignupValidationService } from '../../../domain/services/auth-signup-validation.service';
import type {
    RegisterAdopterV2Command,
    RegisterAdopterV2Result,
    TermsAgreementInput,
} from '../types/auth-signup-v2.type';

@Injectable()
export class RegisterAdopterV2UseCase {
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

    async execute(command: RegisterAdopterV2Command): Promise<RegisterAdopterV2Result> {
        const { provider, providerId } = this.authSocialIdentityService.parseRequiredTempId(command.tempId);

        const existingAdopter = await this.authRegistrationPort.findAdopterBySocialAuth(provider, providerId);
        this.authSignupValidationService.assertAdopterSocialAccountAvailable(existingAdopter);
        this.authSignupValidationService.ensureAdopterRegistrationInput(command.email, command.nickname);

        const existingNickname = await this.authRegistrationPort.findAdopterByNickname(command.nickname);
        this.authSignupValidationService.assertAdopterNicknameAvailable(existingNickname);

        const counselProfile = command.counselDefaultProfile
            ? {
                  selfIntroduction: command.counselDefaultProfile.selfIntroduction,
                  dailyAbsenceHours: command.counselDefaultProfile.dailyAbsenceHours,
                  livingSpaceDescription: command.counselDefaultProfile.livingSpaceDescription,
                  counselPrivacyAgreedAt: command.counselDefaultProfile.counselPrivacyAgreed ? new Date() : undefined,
              }
            : undefined;

        const savedAdopter = await this.authRegistrationPort.createAdopter({
            emailAddress: command.email,
            nickname: command.nickname,
            phoneNumber: this.authPhoneNumberNormalizerService.normalize(command.phone),
            profileImageFileName: this.authStoredFileNameService.extract(command.profileImage) || '',
            socialAuthInfo: {
                authProvider: provider,
                providerUserId: providerId,
                providerEmail: command.email,
            },
            accountStatus: UserStatus.ACTIVE,
            userRole: 'adopter',
            marketingAgreed: command.marketingAgreed || false,
            notificationSettings: {
                emailNotifications: true,
                pushNotifications: true,
                applicationStatusNotifications: true,
                favoriteBreederNotifications: true,
            },
            favoriteBreederList: [],
            submittedReportList: [],
            realName: command.realName,
            interestedBreeds: command.interestedBreedIds ?? [],
            counselDefaultProfile: counselProfile,
            termsAgreementHistory: this.toTermsAgreementHistory(command.termsAgreements),
        });

        const userId = savedAdopter._id.toString();
        const tokens = this.authTokenPort.generateTokens(userId, savedAdopter.emailAddress, 'adopter');
        const hashedRefreshToken = await this.authTokenPort.hashRefreshToken(tokens.refreshToken);
        await this.authRegistrationPort.saveAdopterRefreshToken(userId, hashedRefreshToken);

        void this.authRegistrationNotificationPort.notifyAdopterRegistered({
            userId,
            email: savedAdopter.emailAddress,
            nickname: savedAdopter.nickname || command.nickname,
            phone: savedAdopter.phoneNumber,
            registrationType: 'social',
            provider,
        });

        return this.authSignupResultMapperService.toAdopterResult(savedAdopter, tokens);
    }

    private toTermsAgreementHistory(items: TermsAgreementInput[]): Array<{
        code: string;
        version: string;
        agreedAt: Date;
    }> {
        if (!items || items.length === 0) {
            return [];
        }
        return items.map((item) => ({
            code: item.code,
            version: item.version,
            agreedAt: item.agreedAt ? new Date(item.agreedAt) : new Date(),
        }));
    }
}
