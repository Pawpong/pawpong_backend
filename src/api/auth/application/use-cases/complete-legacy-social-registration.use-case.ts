import { Inject, Injectable } from '@nestjs/common';

import { BreederPlan, UserStatus, VerificationStatus } from '../../../../common/enum/user.enum';
import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { AUTH_REGISTRATION_PORT, type AuthRegistrationPort } from '../ports/auth-registration.port';
import { AUTH_TOKEN_PORT, type AuthTokenPort } from '../ports/auth-token.port';
import { type AuthResult } from '../types/auth-response.type';
import { AuthPhoneNumberNormalizerService } from '../../domain/services/auth-phone-number-normalizer.service';
import { AuthSocialRegistrationResultMapperService } from '../../domain/services/auth-social-registration-result-mapper.service';
import { AuthSignupValidationService } from '../../domain/services/auth-signup-validation.service';

type LegacySocialProfile = {
    provider: string;
    providerId: string;
    email: string;
    name: string;
    profileImage?: string;
};

type LegacySocialAdditionalInfo = {
    role: 'adopter' | 'breeder';
    nickname?: string;
    phone?: string;
    petType?: string;
    plan?: string;
    breederName?: string;
    introduction?: string;
    district?: string;
    breeds?: string[];
    level?: string;
    marketingAgreed?: boolean;
};

@Injectable()
export class CompleteLegacySocialRegistrationUseCase {
    constructor(
        @Inject(AUTH_REGISTRATION_PORT)
        private readonly authRegistrationPort: AuthRegistrationPort,
        @Inject(AUTH_TOKEN_PORT)
        private readonly authTokenPort: AuthTokenPort,
        private readonly authPhoneNumberNormalizerService: AuthPhoneNumberNormalizerService,
        private readonly authSocialRegistrationResultMapperService: AuthSocialRegistrationResultMapperService,
        private readonly authSignupValidationService: AuthSignupValidationService,
    ) {}

    async execute(profile: LegacySocialProfile, additionalInfo: LegacySocialAdditionalInfo): Promise<AuthResult> {
        if (additionalInfo.role === 'adopter') {
            const existingNickname = await this.authRegistrationPort.findAdopterByNickname(additionalInfo.nickname!);
            this.authSignupValidationService.assertLegacyAdopterNicknameAvailable(existingNickname);

            const savedAdopter = await this.authRegistrationPort.createAdopter({
                emailAddress: profile.email,
                nickname: additionalInfo.nickname,
                phoneNumber: this.authPhoneNumberNormalizerService.normalize(additionalInfo.phone),
                profileImageFileName: profile.profileImage,
                socialAuthInfo: {
                    authProvider: profile.provider,
                    providerUserId: profile.providerId,
                    providerEmail: profile.email,
                },
                accountStatus: UserStatus.ACTIVE,
                userRole: 'adopter',
                marketingAgreed: additionalInfo.marketingAgreed || false,
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

            return this.authSocialRegistrationResultMapperService.toResult(
                savedAdopter,
                tokens,
                'adopter',
                AUTH_RESPONSE_MESSAGE_EXAMPLES.socialRegistrationCompleted,
            );
        }

        this.authSignupValidationService.ensureLegacyBreederInput(
            additionalInfo.breederName,
            additionalInfo.district,
            additionalInfo.breeds,
        );

        const savedBreeder = await this.authRegistrationPort.createBreeder({
            emailAddress: profile.email,
            nickname: additionalInfo.breederName,
            phoneNumber: this.authPhoneNumberNormalizerService.normalize(additionalInfo.phone),
            profileImageFileName: profile.profileImage,
            socialAuthInfo: {
                authProvider: profile.provider,
                providerUserId: profile.providerId,
                providerEmail: profile.email,
            },
            userRole: 'breeder',
            accountStatus: UserStatus.ACTIVE,
            termsAgreed: true,
            privacyAgreed: true,
            marketingAgreed: additionalInfo.marketingAgreed || false,
            lastLoginAt: new Date(),
            lastActivityAt: new Date(),
            name: additionalInfo.breederName,
            petType: additionalInfo.petType || 'dog',
            breeds: additionalInfo.breeds || [],
            verification: {
                status: VerificationStatus.PENDING,
                plan: additionalInfo.plan === 'pro' ? BreederPlan.PRO : BreederPlan.BASIC,
                level: additionalInfo.level || 'new',
                documents: [],
            },
            profile: {
                description: additionalInfo.introduction || '',
                specialization: [additionalInfo.petType || 'dog'],
                location: {
                    city: additionalInfo.district,
                    district: '',
                },
                representativePhotos: [],
            },
            applicationForm: [],
            stats: {
                totalApplications: 0,
                totalFavorites: 0,
                completedAdoptions: 0,
                averageRating: 0,
                totalReviews: 0,
                profileViews: 0,
                lastUpdated: new Date(),
            },
        });

        const userId = savedBreeder._id.toString();
        const tokens = this.authTokenPort.generateTokens(userId, savedBreeder.emailAddress, 'breeder');
        const hashedRefreshToken = await this.authTokenPort.hashRefreshToken(tokens.refreshToken);
        await this.authRegistrationPort.saveBreederRefreshToken(userId, hashedRefreshToken);

        return this.authSocialRegistrationResultMapperService.toResult(
            savedBreeder,
            tokens,
            'breeder',
            AUTH_RESPONSE_MESSAGE_EXAMPLES.socialRegistrationCompleted,
        );
    }
}
