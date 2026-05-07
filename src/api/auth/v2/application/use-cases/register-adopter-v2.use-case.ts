import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { UserStatus } from '../../../../../common/enum/user.enum';
import {
    TERMS_READER_PORT,
    type TermsReaderPort,
} from '../../../../terms/application/ports/terms-reader.port';
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
import { AuthV2TermsAgreementValidatorService } from '../../domain/services/auth-v2-terms-agreement-validator.service';
import type { RegisterAdopterV2Command, RegisterAdopterV2Result } from '../types/auth-signup-v2.type';

@Injectable()
export class RegisterAdopterV2UseCase {
    constructor(
        @Inject(AUTH_REGISTRATION_PORT)
        private readonly authRegistrationPort: AuthRegistrationPort,
        @Inject(AUTH_REGISTRATION_NOTIFICATION_PORT)
        private readonly authRegistrationNotificationPort: AuthRegistrationNotificationPort,
        @Inject(AUTH_TOKEN_PORT)
        private readonly authTokenPort: AuthTokenPort,
        @Inject(TERMS_READER_PORT)
        private readonly termsReaderPort: TermsReaderPort,
        private readonly authSocialIdentityService: AuthSocialIdentityService,
        private readonly authStoredFileNameService: AuthStoredFileNameService,
        private readonly authPhoneNumberNormalizerService: AuthPhoneNumberNormalizerService,
        private readonly authSignupResultMapperService: AuthSignupResultMapperService,
        private readonly authSignupValidationService: AuthSignupValidationService,
        private readonly termsAgreementValidatorService: AuthV2TermsAgreementValidatorService,
    ) {}

    async execute(command: RegisterAdopterV2Command): Promise<RegisterAdopterV2Result> {
        const { provider, providerId } = this.authSocialIdentityService.parseRequiredTempId(command.tempId);

        const existingAdopter = await this.authRegistrationPort.findAdopterBySocialAuth(provider, providerId);
        this.authSignupValidationService.assertAdopterSocialAccountAvailable(existingAdopter);
        this.authSignupValidationService.ensureAdopterRegistrationInput(command.email, command.nickname);

        const existingNickname = await this.authRegistrationPort.findAdopterByNickname(command.nickname);
        this.authSignupValidationService.assertAdopterNicknameAvailable(existingNickname);

        // 약관 동의 강제: 필수 약관 누락 또는 버전 불일치 시 가입 실패
        const activeTerms = await this.termsReaderPort.readActiveAll();
        const validatedAgreements = this.termsAgreementValidatorService.validate(activeTerms, command.termsAgreements);

        // 상담 사전 정보 동의 여부는 약관 검증 결과 기반으로 판단 (클라이언트 boolean 신뢰 안 함)
        const counselPrivacyAgreed = validatedAgreements.some((a) => a.code === 'counsel_privacy');
        if (command.counselDefaultProfile && !counselPrivacyAgreed) {
            throw new BadRequestException('상담 개인정보 수집 동의(counsel_privacy)가 필요합니다.');
        }

        const counselProfile = command.counselDefaultProfile
            ? {
                  selfIntroduction: command.counselDefaultProfile.selfIntroduction,
                  dailyAbsenceHours: command.counselDefaultProfile.dailyAbsenceHours,
                  livingSpaceDescription: command.counselDefaultProfile.livingSpaceDescription,
                  counselPrivacyAgreedAt: counselPrivacyAgreed ? new Date() : undefined,
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
            marketingAgreed: this.isMarketingAgreed(validatedAgreements, command.marketingAgreed),
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
            termsAgreementHistory: validatedAgreements,
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

    /**
     * 마케팅 동의는 검증된 약관 이력에 'marketing' 코드가 있으면 true.
     * 활성 marketing 약관이 없을 경우 client 의 marketingAgreed boolean 으로 fallback.
     */
    private isMarketingAgreed(
        validatedAgreements: ReadonlyArray<{ code: string }>,
        clientFallback?: boolean,
    ): boolean {
        if (validatedAgreements.some((a) => a.code === 'marketing')) {
            return true;
        }
        return clientFallback ?? false;
    }
}
