import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';

import { UserStatus } from '../../../../common/enum/user.enum';
import { AuthMapper } from '../../mapper/auth.mapper';
import { AuthRegistrationPort } from '../ports/auth-registration.port';
import { AuthRegistrationNotificationPort } from '../ports/auth-registration-notification.port';
import { AuthTokenPort } from '../ports/auth-token.port';
import { type RegisterAdopterAuthSignupCommand, type RegisterAdopterAuthSignupResult } from '../types/auth-signup.type';
import { AuthSocialIdentityService } from '../../domain/services/auth-social-identity.service';
import { AuthStoredFileNameService } from '../../domain/services/auth-stored-file-name.service';

@Injectable()
export class RegisterAdopterUseCase {
    constructor(
        @Inject(AuthRegistrationPort)
        private readonly authRegistrationPort: AuthRegistrationPort,
        @Inject(AuthRegistrationNotificationPort)
        private readonly authRegistrationNotificationPort: AuthRegistrationNotificationPort,
        @Inject(AuthTokenPort)
        private readonly authTokenPort: AuthTokenPort,
        private readonly authSocialIdentityService: AuthSocialIdentityService,
        private readonly authStoredFileNameService: AuthStoredFileNameService,
    ) {}

    async execute(dto: RegisterAdopterAuthSignupCommand): Promise<RegisterAdopterAuthSignupResult> {
        const { provider, providerId } = this.authSocialIdentityService.parseRequiredTempId(dto.tempId);

        const existingAdopter = await this.authRegistrationPort.findAdopterBySocialAuth(provider, providerId);
        if (existingAdopter) {
            throw new ConflictException('이미 입양자로 가입된 소셜 계정입니다.');
        }

        if (!dto.email) {
            throw new BadRequestException('이메일 정보가 필요합니다.');
        }

        if (!dto.nickname) {
            throw new BadRequestException('닉네임이 필요합니다.');
        }

        const existingNickname = await this.authRegistrationPort.findAdopterByNickname(dto.nickname);
        if (existingNickname) {
            throw new ConflictException('이미 사용 중인 닉네임입니다.');
        }

        const savedAdopter = await this.authRegistrationPort.createAdopter({
            emailAddress: dto.email,
            nickname: dto.nickname,
            phoneNumber: AuthMapper.normalizePhoneNumber(dto.phone),
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

        return AuthMapper.toAdopterRegisterResponse(savedAdopter, tokens);
    }
}
