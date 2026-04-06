import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';

import { UserStatus, VerificationStatus, BreederPlan } from '../../common/enum/user.enum';

import { StorageService } from '../../common/storage/storage.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { AuthMapper } from './mapper/auth.mapper';
import { AuthTokenService } from './services/auth-token.service';

import { AuthAdopterRepository } from './repository/auth-adopter.repository';
import { AuthBreederRepository } from './repository/auth-breeder.repository';
import { CheckSocialUserUseCase } from './application/use-cases/check-social-user.use-case';
import { CheckEmailDuplicateUseCase } from './application/use-cases/check-email-duplicate.use-case';
import { CheckNicknameDuplicateUseCase } from './application/use-cases/check-nickname-duplicate.use-case';
import { CheckBreederNameDuplicateUseCase } from './application/use-cases/check-breeder-name-duplicate.use-case';
import { CompleteSocialRegistrationUseCase } from './application/use-cases/complete-social-registration.use-case';
import { RegisterAdopterUseCase } from './application/use-cases/register-adopter.use-case';
import { RegisterBreederUseCase } from './application/use-cases/register-breeder.use-case';
import { UploadAuthProfileImageUseCase } from './application/use-cases/upload-auth-profile-image.use-case';
import { UploadAuthBreederDocumentsUseCase } from './application/use-cases/upload-auth-breeder-documents.use-case';
import { SubmitAuthBreederDocumentsUseCase } from './application/use-cases/submit-auth-breeder-documents.use-case';
import { UploadAndSubmitAuthBreederDocumentsUseCase } from './application/use-cases/upload-and-submit-auth-breeder-documents.use-case';

import { SocialCompleteRequestDto } from './dto/request/social-complete-request.dto';
import { RegisterBreederRequestDto } from './dto/request/register-breeder-request.dto';
import { RegisterAdopterRequestDto } from './dto/request/register-adopter-request.dto';
import { AuthResponseDto } from './dto/response/auth-response.dto';
import { RegisterAdopterResponseDto } from './dto/response/register-adopter-response.dto';
import { RegisterBreederResponseDto } from './dto/response/register-breeder-response.dto';
import { VerificationDocumentsResponseDto } from './dto/response/verification-documents-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly authAdopterRepository: AuthAdopterRepository,
        private readonly authBreederRepository: AuthBreederRepository,
        private readonly logger: CustomLoggerService,
        private readonly storageService: StorageService,
        private readonly authTokenService: AuthTokenService,
        private readonly completeSocialRegistrationUseCase: CompleteSocialRegistrationUseCase,
        private readonly checkSocialUserUseCase: CheckSocialUserUseCase,
        private readonly checkEmailDuplicateUseCase: CheckEmailDuplicateUseCase,
        private readonly checkNicknameDuplicateUseCase: CheckNicknameDuplicateUseCase,
        private readonly checkBreederNameDuplicateUseCase: CheckBreederNameDuplicateUseCase,
        private readonly registerAdopterUseCase: RegisterAdopterUseCase,
        private readonly registerBreederUseCase: RegisterBreederUseCase,
        private readonly uploadAuthProfileImageUseCase: UploadAuthProfileImageUseCase,
        private readonly uploadAuthBreederDocumentsUseCase: UploadAuthBreederDocumentsUseCase,
        private readonly submitAuthBreederDocumentsUseCase: SubmitAuthBreederDocumentsUseCase,
        private readonly uploadAndSubmitAuthBreederDocumentsUseCase: UploadAndSubmitAuthBreederDocumentsUseCase,
    ) {}

    // 유틸리티 메서드들은 AuthMapper로 이동되었습니다.

    /**
     * 소셜 로그인 회원가입 완료 처리 (검증 포함)
     * 컨트롤러의 completeSocialRegistration 로직을 서비스로 이동
     */
    async completeSocialRegistrationValidated(
        dto: SocialCompleteRequestDto,
    ): Promise<RegisterAdopterResponseDto | RegisterBreederResponseDto> {
        return this.completeSocialRegistrationUseCase.execute(dto);
    }

    /**
     * 이메일 중복 체크 - 입양자와 브리더 모두 확인
     */
    async checkEmailDuplicate(email: string): Promise<boolean> {
        return this.checkEmailDuplicateUseCase.execute(email);
    }

    /**
     * 닉네임 중복 체크 - 입양자만 확인
     */
    async checkNicknameDuplicate(nickname: string): Promise<boolean> {
        return this.checkNicknameDuplicateUseCase.execute(nickname);
    }

    /**
     * 브리더 상호명 중복 체크
     */
    async checkBreederNameDuplicate(breederName: string): Promise<boolean> {
        return this.checkBreederNameDuplicateUseCase.execute(breederName);
    }


    /**
     * 입양자 회원가입 처리 (일반 + 소셜 로그인 모두 지원)
     */
    async registerAdopter(dto: RegisterAdopterRequestDto): Promise<RegisterAdopterResponseDto> {
        return this.registerAdopterUseCase.execute(dto);
    }

    /**
     * 소셜 회원가입 완료 처리
     */
    async completeSocialRegistration(
        profile: {
            provider: string;
            providerId: string;
            email: string;
            name: string;
            profileImage?: string;
        },
        additionalInfo: {
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
        },
    ): Promise<AuthResponseDto> {
        if (additionalInfo.role === 'adopter') {
            // 닉네임 필수 체크

            // 닉네임 중복 체크
            const existingNickname = await this.authAdopterRepository.findByNickname(additionalInfo.nickname!);

            if (existingNickname) {
                throw new ConflictException('Nickname already exists');
            }

            // 입양자 생성
            const savedAdopter = await this.authAdopterRepository.create({
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
                // ✅ 제거: adoptionApplicationList (별도 컬렉션에서 관리)
                // ✅ 제거: writtenReviewList (별도 컬렉션에서 관리)
            });

            // 토큰 생성
            const tokens = this.authTokenService.generateTokens(
                (savedAdopter._id as any).toString(),
                savedAdopter.emailAddress,
                'adopter',
            );

            // Refresh 토큰 저장
            const hashedRefreshToken = await this.authTokenService.hashRefreshToken(tokens.refreshToken);
            await this.authAdopterRepository.update((savedAdopter._id as any).toString(), {
                refreshToken: hashedRefreshToken,
                lastActivityAt: new Date(),
            });

            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                accessTokenExpiresIn: tokens.accessTokenExpiresIn,
                refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
                userInfo: {
                    userId: (savedAdopter._id as any).toString(),
                    emailAddress: savedAdopter.emailAddress,
                    nickname: savedAdopter.nickname,
                    userRole: 'adopter',
                    accountStatus: savedAdopter.accountStatus,
                    profileImageFileName: savedAdopter.profileImageFileName,
                },
                message: '소셜 회원가입이 완료되었습니다.',
            };
        } else {
            // 브리더 생성
            if (!additionalInfo.breederName || !additionalInfo.district) {
                throw new BadRequestException('브리더는 브리더명, 지역이 필요합니다.');
            }

            if (!additionalInfo.breeds || additionalInfo.breeds.length === 0) {
                throw new BadRequestException('최소 1개의 품종이 필요합니다.');
            }

            const savedBreeder = await this.authBreederRepository.create({
                // User 스키마 필드 (상속)
                emailAddress: profile.email,
                nickname: additionalInfo.breederName, // 브리더명을 nickname으로 사용
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

                // Breeder 전용 필드
                name: additionalInfo.breederName, // 업체명
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
                        city: additionalInfo.district, // district를 city 필드에 저장
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

            // 토큰 생성
            const tokens = this.authTokenService.generateTokens(
                (savedBreeder._id as any).toString(),
                savedBreeder.emailAddress,
                'breeder',
            );

            // Refresh 토큰 저장
            const hashedRefreshToken = await this.authTokenService.hashRefreshToken(tokens.refreshToken);
            await this.authBreederRepository.update((savedBreeder._id as any).toString(), {
                refreshToken: hashedRefreshToken,
                lastLoginAt: new Date(),
            });

            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                accessTokenExpiresIn: tokens.accessTokenExpiresIn,
                refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
                userInfo: {
                    userId: (savedBreeder._id as any).toString(),
                    emailAddress: savedBreeder.emailAddress,
                    nickname: savedBreeder.nickname,
                    userRole: 'breeder',
                    accountStatus: savedBreeder.accountStatus,
                    profileImageFileName: savedBreeder.profileImageFileName,
                },
                message: '소셜 회원가입이 완료되었습니다.',
            };
        }
    }

    /**
     * 브리더 서류 업로드 및 제출 (파일 업로드 기반)
     * 파일을 GCP Storage에 업로드하고 URL을 생성한 후 제출합니다.
     */
    async uploadAndSubmitBreederDocuments(
        userId: string,
        breederLevel: 'elite' | 'new',
        files: {
            idCard?: Express.Multer.File[];
            animalProductionLicense?: Express.Multer.File[];
            adoptionContractSample?: Express.Multer.File[];
            breederCertification?: Express.Multer.File[];
            ticaCfaDocument?: Express.Multer.File[];
        },
    ): Promise<{
        breederId: string;
        verificationStatus: string;
        uploadedDocuments: any;
        isDocumentsComplete: boolean;
        submittedAt: Date;
        estimatedProcessingTime: string;
    }> {
        return this.uploadAndSubmitAuthBreederDocumentsUseCase.execute(userId, breederLevel, files);
    }

    /**
     * 브리더 서류 제출 (URL 기반)
     * Elite 레벨과 New 레벨에 따라 필수 서류가 다름
     */
    async submitBreederDocuments(
        userId: string,
        breederLevel: 'elite' | 'new',
        documents: {
            idCardUrl: string;
            animalProductionLicenseUrl: string;
            adoptionContractSampleUrl?: string;
            recentAssociationDocumentUrl?: string;
            breederCertificationUrl?: string;
            ticaCfaDocumentUrl?: string;
        },
    ): Promise<{
        breederId: string;
        verificationStatus: string;
        uploadedDocuments: any;
        isDocumentsComplete: boolean;
        submittedAt: Date;
        estimatedProcessingTime: string;
    }> {
        return this.submitAuthBreederDocumentsUseCase.execute(userId, breederLevel, documents);
    }

    /**
     * 소셜 로그인 사용자 존재 여부 확인
     * 프론트엔드에서 로그인/회원가입 플로우를 결정하기 위해 사용
     */
    async checkSocialUser(
        provider: string,
        providerId: string,
        email?: string,
    ): Promise<{
        exists: boolean;
        userRole?: string;
        userId?: string;
        email?: string;
        nickname?: string;
        profileImageFileName?: string;
    }> {
        return this.checkSocialUserUseCase.execute(provider, providerId, email);
    }

    /**
     * 브리더 회원가입 (일반 가입 + 소셜 로그인 지원)
     * 프론트엔드 회원가입 플로우에 맞춰 구현
     * - 버킷 연결 부분은 제외하고 순수 회원가입만 처리
     * - 서류 제출은 나중에 할 수 있도록 선택적으로 처리
     */
    async registerBreeder(dto: {
        email: string;
        phoneNumber: string;
        breederName: string;
        breederLocation: { city: string; district?: string };
        animal: string;
        breeds: string[];
        plan: string;
        level: string;
        agreements: {
            termsOfService: boolean;
            privacyPolicy: boolean;
            marketingConsent?: boolean;
        };
        tempId?: string;
        provider?: string;
        profileImage?: string;
        documentUrls?: string[];
        documentTypes?: string[];
    }): Promise<{
        breederId: string;
        email: string;
        breederName: string;
        breederLocation: string;
        animal: string;
        breeds: string[];
        plan: string;
        level: string;
        verificationStatus: string;
        createdAt: string;
        accessToken: string;
        refreshToken: string;
    }> {
        return this.registerBreederUseCase.execute(dto as RegisterBreederRequestDto);
    }

    /**
     * 프로필 이미지 업로드 (회원가입 시 사용)
     * 로그인 사용자의 경우 자동으로 DB에 저장
     * 비로그인 사용자의 경우 tempId로 임시 저장
     */
    async uploadProfileImage(
        file: Express.Multer.File,
        user?: { userId: string; role: string },
        tempId?: string,
    ): Promise<{ cdnUrl: string; fileName: string; size: number }> {
        return this.uploadAuthProfileImageUseCase.execute(file, user, tempId);
    }

    /**
     * 브리더 인증 서류 업로드 (회원가입 시 사용)
     * New/Elite 레벨에 따라 필수 서류 검증
     * tempId가 있으면 임시 저장소에 보관
     */
    async uploadBreederDocuments(
        files: Express.Multer.File[],
        types: string[],
        level: 'new' | 'elite',
        tempId?: string,
    ): Promise<{ response: VerificationDocumentsResponseDto; count: number }> {
        return this.uploadAuthBreederDocumentsUseCase.execute(files, types, level, tempId);
    }
}
