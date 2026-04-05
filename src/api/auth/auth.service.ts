import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';

import { UserStatus, VerificationStatus, BreederPlan } from '../../common/enum/user.enum';

import { StorageService } from '../../common/storage/storage.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { DiscordWebhookService } from '../../common/discord/discord-webhook.service';

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
import { AuthTempUploadStore } from './infrastructure/auth-temp-upload.store';

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
        private readonly discordWebhookService: DiscordWebhookService,
        private readonly authTokenService: AuthTokenService,
        private readonly completeSocialRegistrationUseCase: CompleteSocialRegistrationUseCase,
        private readonly checkSocialUserUseCase: CheckSocialUserUseCase,
        private readonly checkEmailDuplicateUseCase: CheckEmailDuplicateUseCase,
        private readonly checkNicknameDuplicateUseCase: CheckNicknameDuplicateUseCase,
        private readonly checkBreederNameDuplicateUseCase: CheckBreederNameDuplicateUseCase,
        private readonly registerAdopterUseCase: RegisterAdopterUseCase,
        private readonly registerBreederUseCase: RegisterBreederUseCase,
        private readonly authTempUploadStore: AuthTempUploadStore,
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
        this.logger.logStart('uploadAndSubmitBreederDocuments', '브리더 서류 파일 업로드 시작', {
            userId,
            breederLevel,
        });

        // 필수 파일 검증
        if (!files.idCard || files.idCard.length === 0) {
            throw new BadRequestException('신분증 사본 파일이 필요합니다.');
        }
        if (!files.animalProductionLicense || files.animalProductionLicense.length === 0) {
            throw new BadRequestException('동물생산업 등록증 파일이 필요합니다.');
        }

        // Elite 레벨은 서류를 나중에 제출할 수 있으므로 필수 검증 제거
        // 업로드된 서류만 처리합니다.

        // 파일 업로드 (GCP Storage)
        const uploadedUrls: {
            idCardUrl: string;
            animalProductionLicenseUrl: string;
            adoptionContractSampleUrl?: string;
            breederCertificationUrl?: string;
            ticaCfaDocumentUrl?: string;
        } = {
            idCardUrl: '',
            animalProductionLicenseUrl: '',
        };

        try {
            // 신분증 업로드
            const idCardResult = await this.storageService.uploadFile(files.idCard[0], 'breeder-documents');
            uploadedUrls.idCardUrl = idCardResult.cdnUrl;

            // 동물생산업 등록증 업로드
            const licenseResult = await this.storageService.uploadFile(
                files.animalProductionLicense[0],
                'breeder-documents',
            );
            uploadedUrls.animalProductionLicenseUrl = licenseResult.cdnUrl;

            // Elite 레벨 서류 업로드 (선택적)
            if (breederLevel === 'elite') {
                // 표준 입양계약서 (선택)
                if (files.adoptionContractSample && files.adoptionContractSample.length > 0) {
                    const contractResult = await this.storageService.uploadFile(
                        files.adoptionContractSample[0],
                        'breeder-documents',
                    );
                    uploadedUrls.adoptionContractSampleUrl = contractResult.cdnUrl;
                }

                // 브리더 인증 서류 (선택)
                if (files.breederCertification && files.breederCertification.length > 0) {
                    const certificationResult = await this.storageService.uploadFile(
                        files.breederCertification[0],
                        'breeder-documents',
                    );
                    uploadedUrls.breederCertificationUrl = certificationResult.cdnUrl;
                }

                // TICA/CFA 서류 (선택사항)
                if (files.ticaCfaDocument && files.ticaCfaDocument.length > 0) {
                    const ticaCfaResult = await this.storageService.uploadFile(
                        files.ticaCfaDocument[0],
                        'breeder-documents',
                    );
                    uploadedUrls.ticaCfaDocumentUrl = ticaCfaResult.cdnUrl;
                }
            }

            this.logger.logSuccess('uploadAndSubmitBreederDocuments', '파일 업로드 완료', {
                uploadedCount: Object.keys(uploadedUrls).filter((k) => uploadedUrls[k as keyof typeof uploadedUrls])
                    .length,
            });
        } catch (error) {
            this.logger.logError('uploadAndSubmitBreederDocuments', '파일 업로드 실패', error);
            throw new BadRequestException('파일 업로드에 실패했습니다. 다시 시도해주세요.');
        }

        // 기존 submitBreederDocuments 메서드 호출
        return this.submitBreederDocuments(userId, breederLevel, uploadedUrls);
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
        this.logger.logStart('submitBreederDocuments', '브리더 서류 제출 시작', {
            userId,
            breederLevel,
        });

        const breeder = await this.authBreederRepository.findById(userId);

        if (!breeder) {
            this.logger.logError('submitBreederDocuments', '브리더를 찾을 수 없음', new Error('Breeder not found'));
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        // 브리더 레벨에 따른 필수 서류 검증
        const documentArray: { type: string; url: string; uploadedAt: Date }[] = [];

        // 공통 필수 서류 (모든 레벨)
        documentArray.push({
            type: 'id_card',
            url: documents.idCardUrl,
            uploadedAt: new Date(),
        });
        documentArray.push({
            type: 'animal_production_license',
            url: documents.animalProductionLicenseUrl,
            uploadedAt: new Date(),
        });

        // Elite 레벨 서류는 선택적으로 처리 (필수 검증 제거)
        if (breederLevel === 'elite') {
            // 표준 입양계약서 (선택)
            if (documents.adoptionContractSampleUrl) {
                documentArray.push({
                    type: 'adoption_contract_sample',
                    url: documents.adoptionContractSampleUrl,
                    uploadedAt: new Date(),
                });
            }

            // 브리더 인증 서류 (선택)
            if (documents.breederCertificationUrl) {
                documentArray.push({
                    type: 'breeder_certification',
                    url: documents.breederCertificationUrl,
                    uploadedAt: new Date(),
                });
            }

            // TICA/CFA 서류 (선택)
            if (documents.ticaCfaDocumentUrl) {
                documentArray.push({
                    type: 'tica_cfa_document',
                    url: documents.ticaCfaDocumentUrl,
                    uploadedAt: new Date(),
                });
            }
        }

        // 서류 정보를 verification.documents에 저장
        const submittedAt = new Date();
        await this.authBreederRepository.updateVerificationDocuments(
            userId,
            documentArray,
            breederLevel,
            VerificationStatus.REVIEWING,
            submittedAt,
        );

        this.logger.logSuccess('submitBreederDocuments', '브리더 서류 제출 완료', {
            breederId: breeder._id,
            level: breederLevel,
            documentsCount: documentArray.length,
        });

        const uploadedDocuments: any = {
            idCard: documents.idCardUrl,
            animalProductionLicense: documents.animalProductionLicenseUrl,
        };

        if (breederLevel === 'elite') {
            uploadedDocuments.adoptionContractSample = documents.adoptionContractSampleUrl;
            uploadedDocuments.recentAssociationDocument = documents.recentAssociationDocumentUrl;
            uploadedDocuments.breederCertification = documents.breederCertificationUrl;
            if (documents.ticaCfaDocumentUrl) {
                uploadedDocuments.ticaCfaDocument = documents.ticaCfaDocumentUrl;
            }
        }

        return {
            breederId: (breeder._id as any).toString(),
            verificationStatus: VerificationStatus.REVIEWING,
            uploadedDocuments,
            isDocumentsComplete: true,
            submittedAt: submittedAt,
            estimatedProcessingTime: '3-5일',
        };
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
        this.logger.logStart('uploadProfileImage', '프로필 이미지 업로드 시작', {
            fileSize: file.size,
            mimeType: file.mimetype,
            hasUser: !!user,
            tempId: tempId || 'N/A',
        });

        this.validateProfileImageFile(file);

        // GCP Storage에 업로드
        const result = await this.storageService.uploadFile(file, 'profiles');

        // 로그인 사용자인 경우 DB 업데이트 (파일명만 저장)
        if (user) {
            if (user.role === 'breeder') {
                await this.authBreederRepository.updateProfileImage(user.userId, result.fileName);
                this.logger.logSuccess('uploadProfileImage', '브리더 프로필 이미지 파일명 DB 저장 완료', {
                    userId: user.userId,
                    fileName: result.fileName,
                });
            } else if (user.role === 'adopter') {
                await this.authAdopterRepository.updateProfileImage(user.userId, result.fileName);
                this.logger.logSuccess('uploadProfileImage', '입양자 프로필 이미지 파일명 DB 저장 완료', {
                    userId: user.userId,
                    fileName: result.fileName,
                });
            }
        }
        // tempId가 있으면 임시 저장 (로그인 여부와 무관하게 저장)
        // 사용자가 로그인 상태에서 다시 회원가입을 시도할 수 있으므로 둘 다 저장
        if (tempId) {
            this.authTempUploadStore.saveProfileImage(tempId, result.fileName);
            this.logger.logSuccess('uploadProfileImage', 'tempId로 프로필 이미지 임시 저장 완료', {
                tempId,
                fileName: result.fileName,
                hasUser: !!user,
            });
        }

        this.logger.logSuccess('uploadProfileImage', '프로필 이미지 업로드 완료', {
            cdnUrl: result.cdnUrl,
            fileName: result.fileName,
        });

        return {
            cdnUrl: result.cdnUrl,
            fileName: result.fileName,
            size: file.size,
        };
    }

    private validateProfileImageFile(file: Express.Multer.File): void {
        // 파일 크기 검증 (100MB)
        if (file.size > 100 * 1024 * 1024) {
            throw new BadRequestException('파일 크기는 100MB를 초과할 수 없습니다.');
        }

        // 파일 타입 검증 제거 - 모든 파일 타입 허용
        // 브리더 프로필 이미지는 다양한 형식(.png, .jpg, .ico, .webp 등)을 지원
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
        this.logger.logStart('uploadBreederDocuments', '브리더 인증 서류 업로드 시작', {
            fileCount: files.length,
            types,
            level,
            tempId: tempId || 'N/A',
        });

        this.validateBreederDocumentFiles(files, types, level);

        // 파일 업로드
        const uploadedDocuments: Array<{
            type: string;
            url: string;
            filename: string;
            originalFileName: string;
            size: number;
            uploadedAt: Date;
        }> = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const type = types[i];

            // 원본 파일명 처리 (한글 파일명 인코딩 수정)
            let originalFileName = file.originalname;

            // 한글 파일명이 깨진 경우 UTF-8로 재인코딩
            try {
                // 파일명이 ISO-8859-1로 인코딩되어 있는지 확인
                if (originalFileName && /[^\x00-\x7F]/.test(originalFileName)) {
                    // 이미 올바른 UTF-8 문자가 포함된 경우 그대로 사용
                    this.logger.log(`[uploadBreederDocuments] UTF-8 filename detected: ${originalFileName}`);
                } else if (originalFileName) {
                    // ASCII 범위 밖의 문자가 없으면 ISO-8859-1로 인코딩되어 있을 가능성
                    try {
                        const decoded = Buffer.from(originalFileName, 'latin1').toString('utf8');
                        if (decoded !== originalFileName) {
                            this.logger.log(
                                `[uploadBreederDocuments] Filename re-encoded from latin1 to utf8: ${originalFileName} -> ${decoded}`,
                            );
                            originalFileName = decoded;
                        }
                    } catch (error) {
                        // 재인코딩 실패 시 원본 사용
                        this.logger.logWarning(
                            'uploadBreederDocuments',
                            'Failed to re-encode filename, using original',
                            error,
                        );
                    }
                }
            } catch (error) {
                this.logger.logWarning('uploadBreederDocuments', 'Filename encoding check failed', error);
            }

            // 파일 업로드 (임시 폴더에 저장, 회원가입 완료 시 브리더 ID 폴더로 이동 가능)
            const result = await this.storageService.uploadFile(file, `documents/verification/temp/${level}`);

            uploadedDocuments.push({
                type,
                url: result.cdnUrl, // 응답용 Signed URL
                filename: result.fileName, // DB 저장용 파일명
                originalFileName, // 원본 파일명 저장
                size: file.size,
                uploadedAt: new Date(),
            });

            this.logger.logSuccess('uploadBreederDocuments', `서류 업로드 완료 (${i + 1}/${files.length})`, {
                level,
                type,
                fileName: result.fileName,
                originalFileName,
            });
        }

        this.logger.logSuccess('uploadBreederDocuments', `${level} 레벨 인증 서류 업로드 완료`, {
            totalCount: uploadedDocuments.length,
            level,
        });

        // tempId가 있으면 임시 저장소에 보관
        if (tempId) {
            this.authTempUploadStore.saveDocuments(
                tempId,
                uploadedDocuments.map((doc) => ({
                    fileName: doc.filename,
                    originalFileName: doc.originalFileName,
                    type: doc.type,
                })),
            );
            this.logger.logSuccess('uploadBreederDocuments', 'tempId로 서류 정보 임시 저장 완료', {
                tempId,
                documentCount: uploadedDocuments.length,
            });
        }

        const response = new VerificationDocumentsResponseDto(uploadedDocuments, uploadedDocuments);

        return {
            response,
            count: uploadedDocuments.length,
        };
    }

    private validateBreederDocumentFiles(files: Express.Multer.File[], types: string[], level: 'new' | 'elite'): void {
        if (!files || files.length === 0) {
            throw new BadRequestException('파일이 업로드되지 않았습니다.');
        }

        // New/Elite 레벨별 허용 서류 타입 정의
        const allowedTypes = {
            new: ['idCard', 'animalProductionLicense'],
            elite: [
                'idCard',
                'animalProductionLicense',
                'adoptionContractSample',
                'recentAssociationDocument',
                'breederCertification',
                'ticaCfaDocument', // 선택
            ],
        };

        // 레벨 검증
        if (!['new', 'elite'].includes(level)) {
            throw new BadRequestException('레벨은 "new" 또는 "elite"만 가능합니다.');
        }

        // 서류 타입 검증 (허용된 타입인지만 검증, 필수 검증 제거)
        const validTypes = allowedTypes[level];
        for (const type of types) {
            if (!validTypes.includes(type)) {
                throw new BadRequestException(
                    `${level} 레벨에서 유효하지 않은 서류 타입입니다: ${type}. 허용된 타입: ${validTypes.join(', ')}`,
                );
            }
        }

        // 중복 서류 타입 검증
        const uniqueTypes = new Set(types);
        if (uniqueTypes.size !== types.length) {
            throw new BadRequestException('중복된 서류 타입이 있습니다. 각 서류는 한 번만 업로드해야 합니다.');
        }

        // 필수 서류 검증 제거 - 부분 업로드 허용
        // 사용자가 원하는 만큼만 업로드할 수 있도록 변경

        // files와 types 배열 길이 일치 검증
        if (files.length !== types.length) {
            throw new BadRequestException(
                `파일 개수(${files.length})와 서류 타입 개수(${types.length})가 일치하지 않습니다.`,
            );
        }

        // 파일 타입 및 크기 검증 (PDF, 문서, 엑셀, 모든 이미지 허용, 최대 10MB)
        const allowedMimeTypes = [
            // PDF
            'application/pdf',
            // 이미지
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif',
            'image/gif',
            'image/bmp',
            'image/tiff',
            // 문서 (HWP, DOC, DOCX)
            'application/haansofthwp', // HWP
            'application/x-hwp', // HWP (alternative)
            'application/vnd.hancom.hwp', // HWP (alternative)
            'application/msword', // DOC
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
            // 엑셀 (XLS, XLSX)
            'application/vnd.ms-excel', // XLS
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
        ];

        for (const file of files) {
            if (file.size > 100 * 1024 * 1024) {
                throw new BadRequestException(`파일 "${file.originalname}"의 크기는 100MB를 초과할 수 없습니다.`);
            }

            // 파일 확장자로도 체크 (MIME 타입이 정확하지 않을 수 있음)
            const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
            const allowedExtensions = [
                'pdf',
                'jpg',
                'jpeg',
                'png',
                'webp',
                'heic',
                'heif',
                'gif',
                'bmp',
                'tiff',
                'hwp',
                'doc',
                'docx',
                'xls',
                'xlsx',
            ];

            if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension || '')) {
                throw new BadRequestException(
                    `파일 "${file.originalname}"은(는) 지원되지 않는 형식입니다. (지원: pdf, jpg, jpeg, png, webp, heic, gif, hwp, doc, docx, xls, xlsx)`,
                );
            }
        }
    }
}
