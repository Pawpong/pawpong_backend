import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';

import { BreederPlan, UserStatus, VerificationStatus } from '../../../../common/enum/user.enum';
import { AuthMapper } from '../../mapper/auth.mapper';
import { AuthRegistrationPort } from '../ports/auth-registration.port';
import { AuthRegistrationNotificationPort } from '../ports/auth-registration-notification.port';
import { AuthTempUploadPort } from '../ports/auth-temp-upload.port';
import { AuthTokenPort } from '../ports/auth-token.port';
import { type RegisterBreederAuthSignupCommand, type RegisterBreederAuthSignupResult } from '../types/auth-signup.type';
import { AuthSocialIdentityService } from '../../domain/services/auth-social-identity.service';
import { AuthStoredFileNameService } from '../../domain/services/auth-stored-file-name.service';

@Injectable()
export class RegisterBreederUseCase {
    constructor(
        @Inject(AuthRegistrationPort)
        private readonly authRegistrationPort: AuthRegistrationPort,
        @Inject(AuthRegistrationNotificationPort)
        private readonly authRegistrationNotificationPort: AuthRegistrationNotificationPort,
        private readonly authTempUploadPort: AuthTempUploadPort,
        @Inject(AuthTokenPort)
        private readonly authTokenPort: AuthTokenPort,
        private readonly authSocialIdentityService: AuthSocialIdentityService,
        private readonly authStoredFileNameService: AuthStoredFileNameService,
    ) {}

    async execute(dto: RegisterBreederAuthSignupCommand): Promise<RegisterBreederAuthSignupResult> {
        if (!dto.agreements?.termsOfService || !dto.agreements?.privacyPolicy) {
            throw new BadRequestException('필수 약관에 동의해야 합니다.');
        }

        const existingBreeder = await this.authRegistrationPort.findBreederByEmail(dto.email);
        if (existingBreeder) {
            throw new ConflictException('이미 가입된 이메일입니다.');
        }

        const existingAdopter = await this.authRegistrationPort.findAdopterByEmail(dto.email);
        if (existingAdopter) {
            throw new ConflictException('해당 이메일로 입양자 계정이 이미 존재합니다.');
        }

        const socialAuthInfo = this.authSocialIdentityService.parseOptionalSocialAuthInfo(
            dto.tempId,
            dto.provider,
            dto.email,
        );

        const tempUploadInfo = dto.tempId ? this.authTempUploadPort.get(dto.tempId) : undefined;
        const finalProfileImage = dto.profileImage || tempUploadInfo?.profileImage;
        const finalDocumentUrls = dto.documentUrls || tempUploadInfo?.documents?.map((document) => document.fileName);
        const finalOriginalFileNames = tempUploadInfo?.documents?.map((document) => document.originalFileName);
        const finalDocumentTypes =
            dto.documentTypes ||
            tempUploadInfo?.documents?.map((document) => {
                const typeMapping: Record<string, string> = {
                    id_card: 'idCard',
                    animal_production_license: 'animalProductionLicense',
                    adoption_contract_sample: 'adoptionContractSample',
                    recent_association_document: 'recentAssociationDocument',
                    breeder_certification: 'breederCertification',
                    tica_cfa_document: 'ticaCfaDocument',
                };
                return typeMapping[document.type] || document.type;
            });

        const verificationDocuments =
            finalDocumentUrls?.map((urlOrFilename, index) => {
                const fileName = this.authStoredFileNameService.extract(urlOrFilename) || urlOrFilename;
                const originalFileName = finalOriginalFileNames?.[index];
                const camelCaseType = finalDocumentTypes?.[index] || AuthMapper.extractDocumentType(fileName);
                const snakeCaseType = AuthMapper.convertDocumentTypeToSnakeCase(camelCaseType);

                return {
                    fileName,
                    originalFileName,
                    type: snakeCaseType,
                    uploadedAt: new Date(),
                };
            }) || [];

        if (dto.tempId && tempUploadInfo) {
            this.authTempUploadPort.delete(dto.tempId);
        }

        const city = dto.breederLocation.city;
        const district = dto.breederLocation.district || '';

        const savedBreeder = await this.authRegistrationPort.createBreeder({
            emailAddress: dto.email,
            nickname: dto.breederName,
            phoneNumber: AuthMapper.normalizePhoneNumber(dto.phoneNumber),
            profileImageFileName: this.authStoredFileNameService.extract(finalProfileImage),
            socialAuthInfo,
            userRole: 'breeder',
            accountStatus: UserStatus.ACTIVE,
            termsAgreed: dto.agreements.termsOfService,
            privacyAgreed: dto.agreements.privacyPolicy,
            marketingAgreed: dto.agreements.marketingConsent || false,
            lastLoginAt: new Date(),
            lastActivityAt: new Date(),
            name: dto.breederName,
            petType: dto.animal,
            breeds: dto.breeds,
            verification: {
                status: VerificationStatus.PENDING,
                plan: dto.plan === 'pro' ? BreederPlan.PRO : BreederPlan.BASIC,
                level: dto.level,
                documents: verificationDocuments,
            },
            profile: {
                description: '',
                specialization: [dto.animal],
                location: {
                    city,
                    district,
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

        void this.authRegistrationNotificationPort.notifyBreederRegistered({
            userId,
            email: savedBreeder.emailAddress,
            name: savedBreeder.name || dto.breederName,
            phone: savedBreeder.phoneNumber,
            registrationType: socialAuthInfo ? 'social' : 'email',
            provider: socialAuthInfo?.authProvider,
        });

        if (verificationDocuments.length > 0) {
            void this.authRegistrationNotificationPort.notifyBreederDocumentsSubmitted({
                userId,
                email: savedBreeder.emailAddress,
                name: savedBreeder.name || dto.breederName,
                documents: verificationDocuments.map((document) => ({
                    type: document.type,
                    fileName: document.fileName,
                    originalFileName: document.originalFileName,
                })),
            });
        }

        return AuthMapper.toBreederRegisterResponse(savedBreeder, tokens);
    }
}
