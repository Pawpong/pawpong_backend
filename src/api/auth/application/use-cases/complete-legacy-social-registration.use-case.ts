import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';

import { BreederPlan, UserStatus, VerificationStatus } from '../../../../common/enum/user.enum';
import { AuthMapper } from '../../mapper/auth.mapper';
import { AuthRegistrationPort } from '../ports/auth-registration.port';
import { AuthTokenPort } from '../ports/auth-token.port';
import { type AuthResult } from '../types/auth-response.type';
import { AuthRegistrationResponseMessageService } from '../../domain/services/auth-registration-response-message.service';

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
        @Inject(AuthRegistrationPort)
        private readonly authRegistrationPort: AuthRegistrationPort,
        @Inject(AuthTokenPort)
        private readonly authTokenPort: AuthTokenPort,
        private readonly authRegistrationResponseMessageService: AuthRegistrationResponseMessageService,
    ) {}

    async execute(profile: LegacySocialProfile, additionalInfo: LegacySocialAdditionalInfo): Promise<AuthResult> {
        if (additionalInfo.role === 'adopter') {
            const existingNickname = await this.authRegistrationPort.findAdopterByNickname(additionalInfo.nickname!);
            if (existingNickname) {
                throw new ConflictException('Nickname already exists');
            }

            const savedAdopter = await this.authRegistrationPort.createAdopter({
                emailAddress: profile.email,
                nickname: additionalInfo.nickname,
                phoneNumber: AuthMapper.normalizePhoneNumber(additionalInfo.phone),
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

            return AuthMapper.toSocialRegistrationResponse(
                savedAdopter,
                tokens,
                'adopter',
                this.authRegistrationResponseMessageService.getSocialRegistrationCompleted(),
            );
        }

        if (!additionalInfo.breederName || !additionalInfo.district) {
            throw new BadRequestException('브리더는 브리더명, 지역이 필요합니다.');
        }

        if (!additionalInfo.breeds || additionalInfo.breeds.length === 0) {
            throw new BadRequestException('최소 1개의 품종이 필요합니다.');
        }

        const savedBreeder = await this.authRegistrationPort.createBreeder({
            emailAddress: profile.email,
            nickname: additionalInfo.breederName,
            phoneNumber: AuthMapper.normalizePhoneNumber(additionalInfo.phone),
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

        return AuthMapper.toSocialRegistrationResponse(
            savedBreeder,
            tokens,
            'breeder',
            this.authRegistrationResponseMessageService.getSocialRegistrationCompleted(),
        );
    }
}
