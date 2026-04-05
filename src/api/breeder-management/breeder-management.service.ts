import { Injectable, BadRequestException } from '@nestjs/common';

import { VerificationStatus, PetStatus } from '../../common/enum/user.enum';

import { StorageService } from '../../common/storage/storage.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { DiscordWebhookService } from '../../common/discord/discord-webhook.service';

import { ParentPetAddDto } from './dto/request/parent-pet-add-request.dto';
import { ParentPetUpdateDto } from './dto/request/parent-pet-update-request.dto';
import { AvailablePetAddDto } from './dto/request/available-pet-add-request.dto';
import { ProfileUpdateRequestDto } from './dto/request/profile-update-request.dto';
import { VerificationSubmitRequestDto } from './dto/request/verification-submit-request.dto';
import { ApplicationStatusUpdateRequestDto } from './dto/request/application-status-update-request.dto';
import { SubmitDocumentsRequestDto } from './dto/request/submit-documents-request.dto';
import { BreederDashboardResponseDto } from '../breeder/dto/response/breeder-dashboard-response.dto';
import { UploadDocumentsResponseDto, UploadedDocumentDto } from './dto/response/upload-documents-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { PaginationBuilder } from '../../common/dto/pagination/pagination-builder.dto';
import { GetBreederManagementDashboardUseCase } from './application/use-cases/get-breeder-management-dashboard.use-case';
import { GetBreederManagementProfileUseCase } from './application/use-cases/get-breeder-management-profile.use-case';
import { UpdateBreederManagementProfileUseCase } from './application/use-cases/update-breeder-management-profile.use-case';
import { GetBreederManagementReceivedApplicationsUseCase } from './application/use-cases/get-breeder-management-received-applications.use-case';
import { GetBreederManagementMyPetsUseCase } from './application/use-cases/get-breeder-management-my-pets.use-case';
import { GetBreederManagementMyReviewsUseCase } from './application/use-cases/get-breeder-management-my-reviews.use-case';
import { GetBreederManagementVerificationStatusUseCase } from './application/use-cases/get-breeder-management-verification-status.use-case';
import { SubmitBreederManagementVerificationUseCase } from './application/use-cases/submit-breeder-management-verification.use-case';
import { GetBreederManagementApplicationFormUseCase } from './application/use-cases/get-breeder-management-application-form.use-case';
import { UpdateBreederManagementApplicationFormUseCase } from './application/use-cases/update-breeder-management-application-form.use-case';
import { UpdateBreederManagementSimpleApplicationFormUseCase } from './application/use-cases/update-breeder-management-simple-application-form.use-case';
import { AddBreederManagementParentPetUseCase } from './application/use-cases/add-breeder-management-parent-pet.use-case';
import { UpdateBreederManagementParentPetUseCase } from './application/use-cases/update-breeder-management-parent-pet.use-case';
import { RemoveBreederManagementParentPetUseCase } from './application/use-cases/remove-breeder-management-parent-pet.use-case';
import { AddBreederManagementAvailablePetUseCase } from './application/use-cases/add-breeder-management-available-pet.use-case';
import { UpdateBreederManagementAvailablePetUseCase } from './application/use-cases/update-breeder-management-available-pet.use-case';
import { UpdateBreederManagementAvailablePetStatusUseCase } from './application/use-cases/update-breeder-management-available-pet-status.use-case';
import { RemoveBreederManagementAvailablePetUseCase } from './application/use-cases/remove-breeder-management-available-pet.use-case';
import { AddBreederManagementReviewReplyUseCase } from './application/use-cases/add-breeder-management-review-reply.use-case';
import { UpdateBreederManagementReviewReplyUseCase } from './application/use-cases/update-breeder-management-review-reply.use-case';
import { RemoveBreederManagementReviewReplyUseCase } from './application/use-cases/remove-breeder-management-review-reply.use-case';
import { GetBreederManagementApplicationDetailUseCase } from './application/use-cases/get-breeder-management-application-detail.use-case';
import { UpdateBreederManagementApplicationStatusUseCase } from './application/use-cases/update-breeder-management-application-status.use-case';
import { DeleteBreederManagementAccountUseCase } from './application/use-cases/delete-breeder-management-account.use-case';

import { BreederRepository } from './repository/breeder.repository';

/**
 * 브리더 관리 비즈니스 로직 처리 Service
 *
 * 역할:
 * - 인증된 브리더 전용 기능 처리 (대시보드, 프로필 관리, 반려동물 등록/관리)
 * - 입양 신청 관리 및 상태 업데이트 (승인, 거절, 상담 처리)
 * - 브리더 인증 신청 및 검증 프로세스 관리
 * - 부모견/부모묘 및 분양 가능 개체 등록/수정/삭제
 * - 통계 데이터 수집 및 대시보드 제공
 *
 * 설계 원칙:
 * - 권한 기반 접근: 인증된 브리더만 접근 가능한 기능들
 * - 비즈니스 로직 검증: 데이터 일관성 및 비즈니스 규칙 준수
 * - 도메인 간 동기화: 입양자와 브리더 데이터 일관성 유지
 * - 실시간 통계: 신청, 승인, 완료 등 실시간 데이터 반영
 */
// 임시 업로드 정보 타입
interface TempUploadDocument {
    type: string;
    fileName: string;
    originalFileName: string;
}

@Injectable()
export class BreederManagementService {
    // 임시 업로드 저장소 (userId를 키로 사용)
    private tempUploads: Map<string, TempUploadDocument[]> = new Map();

    constructor(
        private storageService: StorageService,
        private breederRepository: BreederRepository,
        private logger: CustomLoggerService,
        private discordWebhookService: DiscordWebhookService,
        private getBreederManagementDashboardUseCase: GetBreederManagementDashboardUseCase,
        private getBreederManagementProfileUseCase: GetBreederManagementProfileUseCase,
        private updateBreederManagementProfileUseCase: UpdateBreederManagementProfileUseCase,
        private getBreederManagementReceivedApplicationsUseCase: GetBreederManagementReceivedApplicationsUseCase,
        private getBreederManagementMyPetsUseCase: GetBreederManagementMyPetsUseCase,
        private getBreederManagementMyReviewsUseCase: GetBreederManagementMyReviewsUseCase,
        private getBreederManagementVerificationStatusUseCase: GetBreederManagementVerificationStatusUseCase,
        private submitBreederManagementVerificationUseCase: SubmitBreederManagementVerificationUseCase,
        private getBreederManagementApplicationFormUseCase: GetBreederManagementApplicationFormUseCase,
        private updateBreederManagementApplicationFormUseCase: UpdateBreederManagementApplicationFormUseCase,
        private updateBreederManagementSimpleApplicationFormUseCase: UpdateBreederManagementSimpleApplicationFormUseCase,
        private addBreederManagementParentPetUseCase: AddBreederManagementParentPetUseCase,
        private updateBreederManagementParentPetUseCase: UpdateBreederManagementParentPetUseCase,
        private removeBreederManagementParentPetUseCase: RemoveBreederManagementParentPetUseCase,
        private addBreederManagementAvailablePetUseCase: AddBreederManagementAvailablePetUseCase,
        private updateBreederManagementAvailablePetUseCase: UpdateBreederManagementAvailablePetUseCase,
        private updateBreederManagementAvailablePetStatusUseCase: UpdateBreederManagementAvailablePetStatusUseCase,
        private removeBreederManagementAvailablePetUseCase: RemoveBreederManagementAvailablePetUseCase,
        private addBreederManagementReviewReplyUseCase: AddBreederManagementReviewReplyUseCase,
        private updateBreederManagementReviewReplyUseCase: UpdateBreederManagementReviewReplyUseCase,
        private removeBreederManagementReviewReplyUseCase: RemoveBreederManagementReviewReplyUseCase,
        private getBreederManagementApplicationDetailUseCase: GetBreederManagementApplicationDetailUseCase,
        private updateBreederManagementApplicationStatusUseCase: UpdateBreederManagementApplicationStatusUseCase,
        private deleteBreederManagementAccountUseCase: DeleteBreederManagementAccountUseCase,
    ) {}

    /**
     * 브리더 대시보드 데이터 조회
     * 인증 상태, 통계 정보, 최근 신청 내역 등 종합적인 대시보드 정보 제공
     *
     * @param userId 브리더 고유 ID
     * @returns 대시보드에 필요한 모든 데이터
     * @throws BadRequestException 존재하지 않는 브리더
     */
    async getDashboard(userId: string): Promise<BreederDashboardResponseDto> {
        return this.getBreederManagementDashboardUseCase.execute(userId);
    }

    /**
     * 브리더 프로필 정보 업데이트
     * 브리더 소개, 위치, 전문 분야, 경력 등 프로필 정보 수정
     *
     * 비즈니스 규칙:
     * - 프로필 사진 최대 3장 제한
     * - 필수 정보와 선택 정보 구분 처리
     * - MongoDB 중첩 객체 업데이트 최적화
     *
     * @param userId 브리더 고유 ID
     * @param updateData 수정할 프로필 데이터
     * @returns 성공 메시지
     * @throws BadRequestException 유효성 검사 실패 또는 존재하지 않는 브리더
     */
    async updateProfile(userId: string, updateData: ProfileUpdateRequestDto): Promise<any> {
        return this.updateBreederManagementProfileUseCase.execute(userId, updateData);
    }

    /**
     * 부모견/부모묘 등록
     * 브리더의 종견/종묘 정보를 등록하여 분양 개체의 혈통 정보 제공
     *
     * 비즈니스 규칙:
     * - 부모견당 사진 1장 제한
     * - 건강 정보 필수 입력
     * - 나이는 월 단위를 년 단위로 변환
     * - 고유 ID 자동 생성
     *
     * @param userId 브리더 고유 ID
     * @param parentPetDto 부모견 등록 데이터
     * @returns 생성된 부모견 ID 및 성공 메시지
     * @throws BadRequestException 유효성 검사 실패 또는 존재하지 않는 브리더
     */
    async addParentPet(userId: string, parentPetDto: ParentPetAddDto): Promise<any> {
        return this.addBreederManagementParentPetUseCase.execute(userId, parentPetDto);
    }

    /**
     * 부모견/부모묘 정보 수정
     *
     * @param userId 브리더 고유 ID
     * @param petId 수정할 부모견 ID
     * @param updateData 수정할 데이터
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 부모견
     */
    async updateParentPet(userId: string, petId: string, updateData: ParentPetUpdateDto): Promise<any> {
        return this.updateBreederManagementParentPetUseCase.execute(userId, petId, updateData);
    }

    /**
     * 부모견/부모묘 삭제
     *
     * @param userId 브리더 고유 ID
     * @param petId 삭제할 부모견 ID
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 부모견
     */
    async removeParentPet(userId: string, petId: string): Promise<any> {
        return this.removeBreederManagementParentPetUseCase.execute(userId, petId);
    }

    /**
     * 분양 가능한 반려동물 등록
     * 입양자들이 신청할 수 있는 분양 개체 등록
     *
     * 비즈니스 규칙:
     * - 분양 개체당 사진 1장 제한
     * - 출생일, 가격, 건강 정보 필수
     * - 등록 즉시 분양 가능 상태로 설정
     * - 고유 ID 자동 생성
     *
     * @param userId 브리더 고유 ID
     * @param availablePetDto 분양 개체 등록 데이터
     * @returns 생성된 반려동물 ID 및 성공 메시지
     * @throws BadRequestException 유효성 검사 실패 또는 존재하지 않는 브리더
     */
    async addAvailablePet(userId: string, availablePetDto: AvailablePetAddDto): Promise<any> {
        return this.addBreederManagementAvailablePetUseCase.execute(userId, availablePetDto);
    }

    /**
     * 분양 가능한 반려동물 정보 수정
     *
     * @param userId 브리더 고유 ID
     * @param petId 수정할 반려동물 ID
     * @param updateData 수정할 데이터
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 반려동물
     */
    async updateAvailablePet(userId: string, petId: string, updateData: Partial<AvailablePetAddDto>): Promise<any> {
        return this.updateBreederManagementAvailablePetUseCase.execute(userId, petId, updateData);
    }

    /**
     * 분양 개체 상태 업데이트
     * 분양 가능, 예약됨, 분양 완료 등의 상태 변경 처리
     *
     * 비즈니스 규칙:
     * - 분양 완료 시 완료 시각 기록
     * - 예약 시 예약 시각 기록
     * - 상태별 추가 데이터 자동 설정
     *
     * @param userId 브리더 고유 ID
     * @param petId 상태를 변경할 반려동물 ID
     * @param status 변경할 상태
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 반려동물
     */
    async updatePetStatus(userId: string, petId: string, status: PetStatus): Promise<any> {
        return this.updateBreederManagementAvailablePetStatusUseCase.execute(userId, petId, status);
    }

    /**
     * 분양 가능한 반려동물 삭제
     *
     * @param userId 브리더 고유 ID
     * @param petId 삭제할 반려동물 ID
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 반려동물
     */
    async removeAvailablePet(userId: string, petId: string): Promise<any> {
        return this.removeBreederManagementAvailablePetUseCase.execute(userId, petId);
    }

    /**
     * 받은 입양 신청 목록 조회 (페이지네이션)
     *
     * @param userId 브리더 고유 ID
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 항목 수 (기본값: 10)
     * @returns 페이지네이션된 입양 신청 목록
     * @throws BadRequestException 존재하지 않는 브리더
     */
    async getReceivedApplications(userId: string, page: number = 1, limit: number = 10): Promise<any> {
        return this.getBreederManagementReceivedApplicationsUseCase.execute(userId, page, limit);
    }

    /**
     * 받은 입양 신청 상세 조회
     * 브리더가 받은 특정 입양 신청의 상세 정보 조회
     *
     * @param userId 브리더 고유 ID
     * @param applicationId 신청 ID
     * @returns 신청 상세 정보
     * @throws BadRequestException 존재하지 않는 신청 또는 권한 없음
     */
    async getApplicationDetail(userId: string, applicationId: string): Promise<any> {
        return this.getBreederManagementApplicationDetailUseCase.execute(userId, applicationId);
    }

    /**
     * 입양 신청 상태 업데이트
     * 브리더가 받은 입양 신청에 대한 승인, 거절, 상담 처리
     *
     * 비즈니스 규칙:
     * - 양방향 데이터 동기화 (브리더 ↔ 입양자)
     * - 승인 완료 시 통계 업데이트
     * - 처리 메모 선택 사항
     * - 상태 변경 이력 추적
     *
     * @param userId 브리더 고유 ID
     * @param applicationId 처리할 입양 신청 ID
     * @param updateData 상태 및 처리 내용
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 신청
     */
    async updateApplicationStatus(
        userId: string,
        applicationId: string,
        updateData: ApplicationStatusUpdateRequestDto,
    ): Promise<any> {
        return this.updateBreederManagementApplicationStatusUseCase.execute(userId, applicationId, updateData);
    }

    /**
     * 브리더 인증 신청 제출
     * 관리자 검토를 위한 브리더 인증 서류 및 정보 제출
     *
     * 비즈니스 규칙:
     * - 이미 인증된 브리더는 재신청 불가
     * - 인증 서류 첨부 필수
     * - 제출 즉시 검토 중 상태로 변경
     * - 이메일 연락처 필수
     *
     * @param userId 브리더 고유 ID
     * @param verificationData 인증 신청 데이터
     * @returns 성공 메시지
     * @throws BadRequestException 이미 인증된 브리더 또는 존재하지 않는 브리더
     */
    async submitVerification(userId: string, verificationData: VerificationSubmitRequestDto): Promise<any> {
        return this.submitBreederManagementVerificationUseCase.execute(userId, verificationData);
    }

    /**
     * 브리더 인증 서류 업로드
     * 인증된 브리더가 인증 서류를 업로드
     *
     * @param userId 브리더 고유 ID
     * @param files 업로드할 파일들
     * @param types 파일 타입 배열
     * @param level 브리더 레벨
     * @returns 업로드 결과
     */
    async uploadVerificationDocuments(
        userId: string,
        files: Express.Multer.File[],
        types: string[],
        level: 'new' | 'elite',
    ): Promise<UploadDocumentsResponseDto> {
        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        if (!files || files.length === 0) {
            throw new BadRequestException('업로드할 파일이 없습니다.');
        }

        if (files.length !== types.length) {
            throw new BadRequestException('파일 수와 타입 수가 일치하지 않습니다.');
        }

        const uploadedDocuments: UploadedDocumentDto[] = [];

        const tempDocuments: TempUploadDocument[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const type = types[i];

            // 원본 파일명을 먼저 저장 (UUID 변경 전)
            // multer가 자동으로 디코딩한 파일명을 사용
            let originalFileName = file.originalname;

            // 한글 파일명이 깨진 경우 UTF-8로 재인코딩
            try {
                // 파일명이 ISO-8859-1로 인코딩되어 있는지 확인
                if (originalFileName && /[^\x00-\x7F]/.test(originalFileName)) {
                    // 이미 올바른 UTF-8 문자가 포함된 경우 그대로 사용
                    this.logger.log(`[uploadVerificationDocuments] UTF-8 filename detected: ${originalFileName}`);
                } else if (originalFileName) {
                    // ASCII 범위 밖의 문자가 없으면 ISO-8859-1로 인코딩되어 있을 가능성
                    try {
                        const decoded = Buffer.from(originalFileName, 'latin1').toString('utf8');
                        if (decoded !== originalFileName) {
                            this.logger.log(
                                `[uploadVerificationDocuments] Filename re-encoded from latin1 to utf8: ${originalFileName} -> ${decoded}`,
                            );
                            originalFileName = decoded;
                        }
                    } catch (error) {
                        // 재인코딩 실패 시 원본 사용
                        this.logger.logWarning(
                            'uploadVerificationDocuments',
                            'Failed to re-encode filename, using original',
                            error,
                        );
                    }
                }
            } catch (error) {
                this.logger.logWarning('uploadVerificationDocuments', 'Filename encoding check failed', error);
            }

            // 디버깅 로그: 업로드 시점의 파일명 확인
            this.logger.log(
                `[uploadVerificationDocuments] File upload - type: ${type}, originalname: ${originalFileName}, mimetype: ${file.mimetype}, size: ${file.size}`,
            );

            // 폴더 경로: verification/{breederId}
            const folder = `verification/${userId}`;

            // GCS에 업로드 (generateFileName에서 UUID로 변경됨)
            const uploadResult = await this.storageService.uploadFile(file, folder);

            // Signed URL 생성 (미리보기용, 1시간)
            const signedUrl = this.storageService.generateSignedUrl(uploadResult.fileName, 60);

            this.logger.log(
                `[uploadVerificationDocuments] Upload result - fileName: ${uploadResult.fileName}, originalFileName to save: ${originalFileName}`,
            );

            uploadedDocuments.push({
                type,
                url: signedUrl,
                fileName: uploadResult.fileName,
                size: file.size,
                originalFileName, // 원본 파일명 저장
            });

            // tempUploads에 저장 (신규 가입 방식과 동일)
            tempDocuments.push({
                type,
                fileName: uploadResult.fileName,
                originalFileName,
            });
        }

        // userId를 키로 tempUploads에 저장
        this.tempUploads.set(userId, tempDocuments);
        this.logger.log(
            `[uploadVerificationDocuments] Saved to tempUploads - userId: ${userId}, documents: ${tempDocuments.length}`,
        );

        return new UploadDocumentsResponseDto(uploadedDocuments.length, level, uploadedDocuments);
    }

    /**
     * 브리더 인증 서류 제출 (간소화된 버전)
     * 업로드된 서류를 제출하여 인증 신청
     *
     * @param userId 브리더 고유 ID
     * @param dto 제출 데이터
     * @returns 성공 메시지
     */
    async submitVerificationDocuments(userId: string, dto: SubmitDocumentsRequestDto): Promise<any> {
        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        // APPROVED 상태에서는 서류 제출 불가
        if (breeder.verification?.status === VerificationStatus.APPROVED) {
            throw new BadRequestException('이미 인증이 완료된 브리더입니다.');
        }

        // 필수 서류 검증 (재제출인 경우 기존 서류 + 새 서류 합쳐서 검증)
        const requiredTypes =
            dto.level === 'new' ? ['idCard', 'businessLicense'] : ['idCard', 'businessLicense', 'contractSample'];

        // 재제출인 경우 기존 서류 타입도 포함
        const isResubmissionCheck =
            breeder.verification?.status === VerificationStatus.REVIEWING ||
            breeder.verification?.status === VerificationStatus.REJECTED;

        const submittedTypes = dto.documents.map((d) => d.type);
        const existingTypes = isResubmissionCheck ? breeder.verification?.documents?.map((d) => d.type) || [] : [];
        const allTypes = [...new Set([...submittedTypes, ...existingTypes])]; // 중복 제거

        // Elite 레벨인 경우 브리더 인증 서류 검증 (breederCatCertificate 또는 breederDogCertificate 중 하나 필수)
        if (dto.level === 'elite') {
            const hasBreederCertificate =
                allTypes.includes('breederCatCertificate') || allTypes.includes('breederDogCertificate');
            if (!hasBreederCertificate) {
                throw new BadRequestException('Elite 레벨은 브리더 인증 서류가 필수입니다.');
            }
        }

        const missingTypes = requiredTypes.filter((t) => !allTypes.includes(t));

        this.logger.log(
            `[submitVerificationDocuments] Required validation - isResubmission: ${isResubmissionCheck}, submittedTypes: ${submittedTypes.join(', ')}, existingTypes: ${existingTypes.join(', ')}, allTypes: ${allTypes.join(', ')}, missingTypes: ${missingTypes.join(', ')}`,
        );

        if (missingTypes.length > 0) {
            throw new BadRequestException(`필수 서류가 누락되었습니다: ${missingTypes.join(', ')}`);
        }

        // 프론트엔드에서 받은 원본 데이터 로깅
        this.logger.log(
            `[submitVerificationDocuments] Received DTO - userId: ${userId}, level: ${dto.level}, documents count: ${dto.documents.length}`,
        );
        dto.documents.forEach((doc, index) => {
            this.logger.log(
                `[submitVerificationDocuments] DTO Document ${index + 1} - type: ${doc.type}, fileName: ${doc.fileName}, originalFileName: ${doc.originalFileName}`,
            );
        });

        // tempUploads에서 업로드 정보 조회 (신규 가입 방식과 동일)
        const tempDocuments = this.tempUploads.get(userId);
        if (tempDocuments) {
            this.logger.log(
                `[submitVerificationDocuments] Found tempUploads - userId: ${userId}, documents: ${tempDocuments.length}`,
            );
            tempDocuments.forEach((temp, index) => {
                this.logger.log(
                    `[submitVerificationDocuments] TempUpload ${index + 1} - fileName: ${temp.fileName}, originalFileName: ${temp.originalFileName}`,
                );
            });
        } else {
            this.logger.logWarning('submitVerificationDocuments', `No tempUploads found for userId: ${userId}`);
        }

        // DTO에서 받은 서류를 "새로 업로드한 서류"와 "기존 서류" 구분
        // fileName이 "verification/"으로 시작하면 올바른 GCS 경로 (새 업로드 or 기존 유지)
        // 그렇지 않으면 잘못된 데이터 (프론트엔드가 originalFileName을 fileName에 넣은 경우)
        const actualNewDocuments: Array<{
            type: string;
            fileName: string;
            originalFileName?: string;
            uploadedAt: Date;
        }> = [];

        const typesToKeepFromExisting: string[] = [];

        dto.documents.forEach((doc) => {
            const isValidGcsPath = doc.fileName && doc.fileName.startsWith('verification/');
            const tempDoc = tempDocuments?.find((temp) => temp.fileName === doc.fileName);

            this.logger.log(
                `[submitVerificationDocuments] Processing document - type: ${doc.type}, fileName: ${doc.fileName}, isValidGcsPath: ${isValidGcsPath}, inTempUploads: ${!!tempDoc}`,
            );

            if (isValidGcsPath) {
                // 올바른 GCS 경로 → 새로 업로드했거나 기존 서류를 유지
                const originalFileName = doc.originalFileName || tempDoc?.originalFileName;
                actualNewDocuments.push({
                    type: doc.type,
                    fileName: doc.fileName,
                    originalFileName: originalFileName,
                    uploadedAt: new Date(),
                });
            } else {
                // 잘못된 fileName (originalFileName이 들어옴) → 기존 서류를 유지하려는 의도
                this.logger.logWarning(
                    'submitVerificationDocuments',
                    `Invalid fileName received for type ${doc.type}: ${doc.fileName}. Will keep existing document.`,
                );
                typesToKeepFromExisting.push(doc.type);
            }
        });

        const submittedAt = new Date();
        // 이미 서류를 제출한 적이 있으면 재제출 (REVIEWING, REJECTED 상태)
        const isResubmission =
            breeder.verification?.status === VerificationStatus.REVIEWING ||
            breeder.verification?.status === VerificationStatus.REJECTED;

        this.logger.log(
            `[submitVerificationDocuments] Resubmission check - current status: ${breeder.verification?.status}, isResubmission: ${isResubmission}`,
        );

        // 기존 서류와 새로 제출된 서류 병합 (재제출인 경우)
        let finalDocuments = actualNewDocuments;
        if (isResubmission && breeder.verification?.documents) {
            // 기존 서류 중에서:
            // 1. actualNewDocuments에 포함된 type은 제외 (새로 업로드했으므로 덮어쓰기)
            // 2. typesToKeepFromExisting에 포함된 type은 유지 (프론트가 유지 요청)
            const existingDocuments = breeder.verification.documents.filter((existingDoc) => {
                const isBeingReplaced = actualNewDocuments.some((newDoc) => newDoc.type === existingDoc.type);
                const shouldKeep = typesToKeepFromExisting.includes(existingDoc.type);

                // 올바른 fileName을 가진 서류만 유지
                const hasValidFileName = existingDoc.fileName && existingDoc.fileName.startsWith('verification/');

                this.logger.log(
                    `[submitVerificationDocuments] Existing doc ${existingDoc.type} - isBeingReplaced: ${isBeingReplaced}, shouldKeep: ${shouldKeep}, hasValidFileName: ${hasValidFileName}`,
                );

                return !isBeingReplaced && shouldKeep && hasValidFileName;
            });

            // 기존 서류 + 새로 제출된 서류 병합
            finalDocuments = [...existingDocuments, ...actualNewDocuments];

            this.logger.log(
                `[submitVerificationDocuments] Merged documents - existing: ${existingDocuments.length}, new: ${actualNewDocuments.length}, total: ${finalDocuments.length}`,
            );
            this.logger.log(
                `[submitVerificationDocuments] Existing document types kept: ${existingDocuments.map((d) => d.type).join(', ')}`,
            );
            this.logger.log(
                `[submitVerificationDocuments] New document types: ${actualNewDocuments.map((d) => d.type).join(', ')}`,
            );
        }

        // 최종 서류 목록으로 필수 서류 재검증
        const finalDocumentTypes = finalDocuments.map((d) => d.type);
        const finalMissingTypes = requiredTypes.filter((t) => !finalDocumentTypes.includes(t));

        this.logger.log(
            `[submitVerificationDocuments] Final validation - finalDocumentTypes: ${finalDocumentTypes.join(', ')}, finalMissingTypes: ${finalMissingTypes.join(', ')}`,
        );

        if (finalMissingTypes.length > 0) {
            throw new BadRequestException(`필수 서류가 누락되었습니다: ${finalMissingTypes.join(', ')}`);
        }

        // Elite 레벨인 경우 최종 서류 목록에서 브리더 인증 서류 검증
        if (dto.level === 'elite') {
            const hasBreederCertificateInFinal =
                finalDocumentTypes.includes('breederCatCertificate') ||
                finalDocumentTypes.includes('breederDogCertificate');
            if (!hasBreederCertificateInFinal) {
                throw new BadRequestException('Elite 레벨은 브리더 인증 서류가 필수입니다.');
            }
        }

        const verification: any = {
            status: VerificationStatus.REVIEWING,
            level: dto.level,
            submittedAt,
            documents: finalDocuments,
            submittedByEmail: dto.submittedByEmail || false,
        };

        await this.breederRepository.updateVerification(userId, verification);

        // DB 업데이트 후 최신 정보 다시 조회 (originalFileName 포함)
        const updatedBreeder = await this.breederRepository.findById(userId);

        // 디스코드 알림 전송 (브리더 입점 서류 제출)
        try {
            // finalDocuments(기존 + 새 서류)의 모든 문서에 대해 Signed URL 생성
            const documentsWithOriginalName = finalDocuments.map((doc) => {
                // tempUploads에서 해당 fileName을 가진 문서 찾기
                const tempDoc = tempDocuments?.find((temp) => temp.fileName === doc.fileName);

                // 원본 파일명 결정 우선순위:
                // 1. tempUploads에 저장된 originalFileName (새로 업로드한 경우)
                // 2. DB에 이미 저장된 originalFileName (기존 서류)
                // 3. fileName에서 추출 (최후의 수단)
                const originalFileName =
                    tempDoc?.originalFileName || doc.originalFileName || doc.fileName.split('/').pop();

                this.logger.log(
                    `[submitVerificationDocuments] Discord webhook document - type: ${doc.type}, fileName: ${doc.fileName}, tempDoc.originalFileName: ${tempDoc?.originalFileName}, doc.originalFileName: ${doc.originalFileName}, final: ${originalFileName}`,
                );

                return {
                    type: doc.type,
                    url: this.storageService.generateSignedUrl(doc.fileName, 60 * 24 * 7), // 7일 유효
                    originalFileName,
                };
            });

            await this.discordWebhookService.notifyBreederVerificationSubmission({
                breederId: userId,
                breederName: breeder.name || '이름 미설정',
                email: breeder.emailAddress,
                phone: breeder.phoneNumber,
                level: dto.level,
                isResubmission,
                documents: documentsWithOriginalName,
                submittedAt,
            });

            this.logger.logSuccess('submitVerificationDocuments', '디스코드 웹훅 전송 성공', {
                breederId: userId,
                documentsCount: documentsWithOriginalName.length,
                documents: documentsWithOriginalName.map((d) => ({
                    type: d.type,
                    originalFileName: d.originalFileName,
                })),
            });
        } catch (error) {
            this.logger.logWarning('submitVerificationDocuments', '디스코드 알림 전송 실패 (서류 제출은 성공)', error);
        }

        // 임시 업로드 정보 정리
        if (tempDocuments) {
            this.tempUploads.delete(userId);
            this.logger.log(`[submitVerificationDocuments] Cleaned up tempUploads for userId: ${userId}`);
        }

        return { message: '입점 서류 제출이 완료되었습니다. 관리자 검토 후 결과를 알려드립니다.' };
    }

    /**
     * 브리더 인증 상태 조회
     * 인증된 브리더가 자신의 인증 상태와 관련 정보를 확인
     *
     * 반환 정보:
     * - 인증 상태 (pending, reviewing, approved, rejected)
     * - 구독 플랜 및 브리더 레벨
     * - 제출/검토 일시
     * - 인증 문서 URL (Signed URL, 1시간 유효)
     * - 거절 사유 (거절된 경우)
     *
     * @param userId 브리더 고유 ID
     * @returns 인증 상태 정보
     * @throws BadRequestException 존재하지 않는 브리더
     */
    async getVerificationStatus(userId: string): Promise<any> {
        return this.getBreederManagementVerificationStatusUseCase.execute(userId);
    }

    /**
     * 브리더 전체 프로필 정보 조회
     * 브리더 관리 페이지에서 사용할 모든 정보 제공
     *
     * 포함 정보:
     * - 기본 정보 (이름, 이메일, 연락처 등)
     * - 인증 상태 및 프로필 정보
     * - 활성화된 부모견/분양 개체 목록
     * - 공개 가능한 후기 및 통계
     * - 신고 내역 (관리 목적)
     *
     * @param userId 브리더 고유 ID
     * @returns 브리더 전체 프로필 정보
     * @throws BadRequestException 존재하지 않는 브리더
     */
    async getBreederProfile(userId: string): Promise<any> {
        return this.getBreederManagementProfileUseCase.execute(userId);
    }

    /**
     * 브리더 자신의 개체 목록 조회 (관리용)
     * 모든 상태의 개체를 포함하며, 비활성화된 개체도 조회 가능
     *
     * @param userId 브리더 고유 ID
     * @param status 상태 필터 (선택사항)
     * @param includeInactive 비활성화된 개체 포함 여부
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 페이지네이션된 개체 목록과 통계
     */
    async getMyPets(
        userId: string,
        status?: string,
        includeInactive: boolean = false,
        page: number = 1,
        limit: number = 20,
    ): Promise<any> {
        return this.getBreederManagementMyPetsUseCase.execute(userId, status, includeInactive, page, limit);
    }

    /**
     * 브리더 자신에게 달린 후기 목록 조회 (관리용)
     * 공개/비공개 후기 모두 조회 가능
     *
     * @param userId 브리더 고유 ID
     * @param visibility 공개 여부 필터 (all, visible, hidden)
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 페이지네이션된 후기 목록과 통계
     */
    async getMyReviews(userId: string, visibility: string = 'all', page: number = 1, limit: number = 10): Promise<any> {
        return this.getBreederManagementMyReviewsUseCase.execute(userId, visibility, page, limit);
    }

    /**
     * 표준 입양 신청 폼 질문 17개 (Figma 디자인 기반 - 수정 불가)
     *
     * 모든 브리더에게 자동으로 포함되는 필수 질문들입니다.
     */
    /**
     * 입양 신청 폼 조회 (표준 + 커스텀 질문)
     *
     * 브리더가 설정한 전체 폼 구조를 조회합니다.
     * 표준 17개 질문은 자동으로 포함되며, 브리더가 추가한 커스텀 질문도 함께 반환합니다.
     *
     * @param breederId 브리더 ID
     * @returns 전체 폼 구조 (표준 + 커스텀 질문)
     */
    async getApplicationForm(breederId: string): Promise<any> {
        return this.getBreederManagementApplicationFormUseCase.execute(breederId);
    }

    /**
     * 입양 신청 폼 수정 (커스텀 질문만)
     *
     * 브리더가 커스텀 질문을 추가/수정/삭제합니다.
     * 표준 17개 질문은 수정할 수 없습니다.
     *
     * @param breederId 브리더 ID
     * @param updateDto 커스텀 질문 목록
     * @returns 성공 메시지
     */
    async updateApplicationForm(breederId: string, updateDto: any): Promise<any> {
        return this.updateBreederManagementApplicationFormUseCase.execute(breederId, updateDto);
    }

    /**
     * 입양 신청 폼 업데이트 (간소화 버전)
     * 질문 텍스트만 받아서 자동으로 기본값 설정
     *
     * 자동 설정값:
     * - id: `custom_${timestamp}_${index}`
     * - type: 'textarea' (고정)
     * - required: false (선택)
     * - order: 배열 순서 (1부터 시작)
     *
     * 검증 규칙:
     * - 빈 질문 자동 제거 (공백만 있는 질문)
     * - 최대 5개 제한
     * - 질문당 최소 2자, 최대 200자
     * - 중복 질문 체크 (대소문자 구분 없음)
     *
     * @param breederId 브리더 고유 ID
     * @param questions 질문 텍스트 배열
     * @returns 업데이트 결과 (message, customQuestions, totalQuestions)
     * @throws BadRequestException 브리더를 찾을 수 없거나 유효성 검증 실패
     */
    async updateApplicationFormSimple(breederId: string, questions: Array<{ question: string }>): Promise<any> {
        return this.updateBreederManagementSimpleApplicationFormUseCase.execute(breederId, questions);
    }

    /**
     * 브리더 계정 탈퇴 (소프트 딜리트)
     * 계정 상태를 'deleted'로 변경하여 로그인 불가 처리하고 탈퇴 사유 저장
     *
     * @param userId 브리더 고유 ID
     * @param deleteData 탈퇴 사유 정보
     * @returns 탈퇴 정보
     * @throws BadRequestException 존재하지 않는 브리더 또는 이미 탈퇴된 계정
     */
    async deleteBreederAccount(
        userId: string,
        deleteData?: { reason?: string; otherReason?: string },
    ): Promise<{ breederId: string; deletedAt: string; message: string }> {
        return this.deleteBreederManagementAccountUseCase.execute(userId, deleteData);
    }

    /**
     * 후기 답글 등록
     * 브리더가 자신에게 달린 후기에 답글을 작성합니다.
     */
    async addReviewReply(breederId: string, reviewId: string, content: string): Promise<any> {
        return this.addBreederManagementReviewReplyUseCase.execute(breederId, reviewId, content);
    }

    /**
     * 후기 답글 수정
     * 브리더가 자신이 작성한 답글을 수정합니다.
     */
    async updateReviewReply(breederId: string, reviewId: string, content: string): Promise<any> {
        return this.updateBreederManagementReviewReplyUseCase.execute(breederId, reviewId, content);
    }

    /**
     * 후기 답글 삭제
     * 브리더가 자신이 작성한 답글을 삭제합니다.
     */
    async deleteReviewReply(breederId: string, reviewId: string): Promise<any> {
        return this.removeBreederManagementReviewReplyUseCase.execute(breederId, reviewId);
    }
}
