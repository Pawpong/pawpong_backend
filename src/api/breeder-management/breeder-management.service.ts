import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { VerificationStatus, ApplicationStatus, PetStatus } from '../../common/enum/user.enum';

import { StorageService } from '../../common/storage/storage.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../../schema/notification.schema';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { MailService } from '../../common/mail/mail.service';
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

import { Adopter, AdopterDocument } from '../../schema/adopter.schema';
import { BreederReview, BreederReviewDocument } from '../../schema/breeder-review.schema';
import { BreederRepository } from './repository/breeder.repository';
import { ParentPetRepository } from './repository/parent-pet.repository';
import { AdoptionApplicationRepository } from './repository/adoption-application.repository';
import { AvailablePetManagementRepository } from './repository/available-pet-management.repository';

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

        @InjectModel(Adopter.name) private adopterModel: Model<AdopterDocument>,
        @InjectModel(BreederReview.name) private breederReviewModel: Model<BreederReviewDocument>,
        private breederRepository: BreederRepository,
        private parentPetRepository: ParentPetRepository,
        private availablePetRepository: AvailablePetManagementRepository,
        private adoptionApplicationRepository: AdoptionApplicationRepository,
        private notificationService: NotificationService,
        private mailService: MailService,
        private configService: ConfigService,
        private logger: CustomLoggerService,
        private discordWebhookService: DiscordWebhookService,
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
        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        // 대기 중인 입양 신청 수 계산 (별도 컬렉션 조회)
        const pendingApplications = await this.adoptionApplicationRepository.countByStatus(
            userId,
            ApplicationStatus.CONSULTATION_PENDING,
        );

        // 최근 신청 내역 (최대 5개)
        const recentApplicationsList = await this.adoptionApplicationRepository.findRecentByBreeder(userId, 5);

        // 분양 가능한 반려동물 수 계산 (별도 컬렉션 조회)
        const availablePetsCount = await this.availablePetRepository.countByStatus(userId, PetStatus.AVAILABLE, true);

        return {
            profileInfo: {
                verificationInfo: {
                    verificationStatus: breeder.verification?.status || VerificationStatus.PENDING,
                    subscriptionPlan: breeder.verification?.plan || 'basic',
                    submittedAt: breeder.verification?.submittedAt,
                    reviewedAt: breeder.verification?.reviewedAt,
                    rejectionReason: breeder.verification?.rejectionReason,
                },
            },
            statisticsInfo: {
                totalApplicationCount: breeder.stats?.totalApplications || 0,
                pendingApplicationCount: pendingApplications,
                completedAdoptionCount: breeder.stats?.completedAdoptions || 0,
                averageRating: breeder.stats?.averageRating || 0,
                totalReviewCount: breeder.stats?.totalReviews || 0,
                profileViewCount: breeder.stats?.profileViews || 0,
            },
            recentApplicationList: recentApplicationsList.map((app: any) => ({
                applicationId: app._id.toString(),
                adopterName: app.adopterName || 'Unknown',
                petName: app.petName || 'Unknown',
                applicationStatus: app.status,
                appliedAt: app.appliedAt,
            })),
            availablePetCount: availablePetsCount,
        };
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
        const breeder = await this.breederRepository.findByIdWithAllData(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const profileUpdateData: any = {};

        // 프로필 객체가 존재하지 않는 경우 초기화
        if (!breeder.profile) {
            profileUpdateData.profile = {};
        }

        // 각 필드별 업데이트 데이터 구성 (MongoDB 중첩 객체 업데이트)
        if (updateData.profileDescription !== undefined) {
            // 줄바꿈 문자(\n, \r\n)는 완전히 유지
            // 각 줄의 앞뒤 공백/탭만 제거 (줄바꿈 자체는 절대 제거하지 않음)
            const description = updateData.profileDescription
                .split('\n') // 줄바꿈으로 분리
                .map((line) => line.replace(/^[ \t]+|[ \t]+$/g, '')) // 각 줄의 앞뒤 공백/탭만 제거
                .join('\n'); // 줄바꿈으로 다시 결합
            profileUpdateData['profile.description'] = description;
        }
        if (updateData.locationInfo) {
            profileUpdateData['profile.location'] = {
                city: updateData.locationInfo.cityName,
                district: updateData.locationInfo.districtName,
                address: updateData.locationInfo.detailAddress || '',
            };
        }
        if (updateData.profilePhotos) {
            if (updateData.profilePhotos.length > 3) {
                throw new BadRequestException('프로필 사진은 최대 3장까지만 업로드할 수 있습니다.');
            }
            profileUpdateData['profile.representativePhotos'] = updateData.profilePhotos;
        }
        if (updateData.specializationTypes) {
            profileUpdateData['profile.specialization'] = updateData.specializationTypes;
        }
        if (updateData.breeds) {
            profileUpdateData['breeds'] = updateData.breeds;
        }
        if (updateData.experienceYears !== undefined) {
            profileUpdateData['profile.experienceYears'] = updateData.experienceYears;
        }
        if (updateData.priceRangeInfo) {
            const min = updateData.priceRangeInfo.minimumPrice;
            const max = updateData.priceRangeInfo.maximumPrice;

            // display는 프론트엔드에서 전달받거나, 값에 따라 자동 계산
            let display: string;
            if (min === 0 && max === 0) {
                // 0, 0인 경우는 프론트엔드에서 display를 명시해야 함
                // not_set(미설정) vs consultation(상담 후 공개) 구분
                display = updateData.priceRangeInfo.display || 'not_set';
            } else {
                display = 'range';
            }

            profileUpdateData['profile.priceRange'] = {
                min,
                max,
                display,
            };
        }
        if (updateData.profileImage !== undefined) {
            // null이면 삭제, 문자열이면 업데이트
            profileUpdateData['profileImageFileName'] = updateData.profileImage;
        }
        if (updateData.marketingAgreed !== undefined) {
            profileUpdateData['marketingAgreed'] = updateData.marketingAgreed;
        }
        if (updateData.consultationAgreed !== undefined) {
            profileUpdateData['consultationAgreed'] = updateData.consultationAgreed;
        }

        await this.breederRepository.updateProfile(userId, profileUpdateData);

        return { message: '프로필이 성공적으로 수정되었습니다.' };
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
        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const savedParentPet = await this.parentPetRepository.create({
            breederId: new Types.ObjectId(userId) as any,
            name: parentPetDto.name,
            breed: parentPetDto.breed,
            gender: parentPetDto.gender,
            birthDate: new Date(parentPetDto.birthDate),
            photoFileName: parentPetDto.photoFileName,
            description: parentPetDto.description || '',
            photos: parentPetDto.photos || [],
            isActive: true,
        });

        return { petId: (savedParentPet._id as any).toString(), message: '부모견/부모묘가 성공적으로 등록되었습니다.' };
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
        const pet = await this.parentPetRepository.findByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 부모견/부모묘를 찾을 수 없습니다.');
        }

        const updateFields: any = {};
        if (updateData.name) updateFields.name = updateData.name;
        if (updateData.breed) updateFields.breed = updateData.breed;
        if (updateData.gender) updateFields.gender = updateData.gender;
        if (updateData.birthDate) updateFields.birthDate = new Date(updateData.birthDate);
        if (updateData.photoFileName) updateFields.photoFileName = updateData.photoFileName;
        if (updateData.description !== undefined) updateFields.description = updateData.description;
        if (updateData.photos !== undefined) updateFields.photos = updateData.photos;

        await this.parentPetRepository.update(petId, updateFields);

        return { message: '부모견/부모묘 정보가 성공적으로 수정되었습니다.' };
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
        const pet = await this.parentPetRepository.findByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 부모견/부모묘를 찾을 수 없습니다.');
        }

        await this.parentPetRepository.delete(petId);

        return { message: '부모견/부모묘가 성공적으로 삭제되었습니다.' };
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
        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const savedPet = await this.availablePetRepository.create({
            breederId: new Types.ObjectId(userId) as any,
            name: availablePetDto.name,
            breed: availablePetDto.breed,
            gender: availablePetDto.gender,
            birthDate: new Date(availablePetDto.birthDate),
            price: availablePetDto.price,
            status: 'available',
            photos: availablePetDto.photos || [],
            description: availablePetDto.description || '',
            parentInfo: availablePetDto.parentInfo
                ? {
                      mother: availablePetDto.parentInfo.mother as any,
                      father: availablePetDto.parentInfo.father as any,
                  }
                : undefined,
        });

        return {
            petId: (savedPet._id as any).toString(),
            message: '분양 가능한 반려동물이 성공적으로 등록되었습니다.',
        };
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
        const pet = await this.availablePetRepository.findByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 분양 개체를 찾을 수 없습니다.');
        }

        const updateFields: any = {};
        if (updateData.name) updateFields.name = updateData.name;
        if (updateData.breed) updateFields.breed = updateData.breed;
        if (updateData.gender) updateFields.gender = updateData.gender;
        if (updateData.birthDate) updateFields.birthDate = new Date(updateData.birthDate);
        if (updateData.price) updateFields.price = updateData.price;
        if (updateData.description !== undefined) updateFields.description = updateData.description;
        if (updateData.photos !== undefined) updateFields.photos = updateData.photos;
        if (updateData.parentInfo) {
            updateFields.parentInfo = {
                mother: updateData.parentInfo.mother,
                father: updateData.parentInfo.father,
            };
        }

        await this.availablePetRepository.update(petId, updateFields);

        return { message: '분양 개체 정보가 성공적으로 수정되었습니다.' };
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
        const pet = await this.availablePetRepository.findByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 분양 개체를 찾을 수 없습니다.');
        }

        await this.availablePetRepository.updateStatus(petId, status);

        return { message: '반려동물 상태가 성공적으로 업데이트되었습니다.' };
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
        const pet = await this.availablePetRepository.findByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 분양 개체를 찾을 수 없습니다.');
        }

        await this.availablePetRepository.delete(petId);

        return { message: '분양 개체가 성공적으로 삭제되었습니다.' };
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
        const { applications, total } = await this.adoptionApplicationRepository.findByBreederId(userId, page, limit);

        // MongoDB _id를 applicationId로 매핑 + preferredPetInfo 추출 + 입양자 닉네임 추출
        const mappedApplications = applications.map((app) => {
            const plainApp = app.toObject ? app.toObject() : app;
            // populate된 adopterId에서 nickname 추출
            // adopterId가 객체인 경우(populate됨) nickname 사용, 아니면 adopterName 사용
            const adopterInfo = plainApp.adopterId;
            const adopterNickname =
                typeof adopterInfo === 'object' && adopterInfo !== null
                    ? adopterInfo.nickname || plainApp.adopterName || '알 수 없음'
                    : plainApp.adopterName || '알 수 없음';

            return {
                ...plainApp,
                applicationId: (app._id as any).toString(),
                adopterNickname, // 입양자 닉네임 추가
                // 입양 원하는 아이 정보를 최상위 필드로 추출 (프론트엔드 편의성)
                preferredPetInfo: plainApp.standardResponses?.preferredPetDescription || null,
            };
        });

        return new PaginationBuilder<any>()
            .setItems(mappedApplications)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(total)
            .build();
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
        // 신청 조회 (본인이 받은 신청만 조회 가능)
        const application = await this.adoptionApplicationRepository.findByIdAndBreeder(applicationId, userId);

        if (!application) {
            throw new BadRequestException('해당 입양 신청을 찾을 수 없거나 조회 권한이 없습니다.');
        }

        // 입양자 정보 조회
        const adopter = await this.adopterModel.findById(application.adopterId).lean();

        return {
            applicationId: (application as any)._id.toString(),
            adopterId: application.adopterId.toString(),
            adopterName: application.adopterName,
            adopterEmail: application.adopterEmail,
            adopterPhone: application.adopterPhone,
            petId: application.petId?.toString(),
            petName: application.petName,
            status: application.status,
            standardResponses: application.standardResponses,
            customResponses: application.customResponses || [],
            appliedAt: application.appliedAt.toISOString(),
            processedAt: application.processedAt?.toISOString(),
            breederNotes: application.breederNotes,
        };
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
        this.logger.logStart('updateApplicationStatus', '입양 신청 상태 업데이트 시작', {
            userId,
            applicationId,
            newStatus: updateData.status,
        });

        const application = await this.adoptionApplicationRepository.findByIdAndBreeder(applicationId, userId);

        if (!application) {
            throw new BadRequestException('해당 입양 신청을 찾을 수 없습니다.');
        }

        this.logger.log(
            `[updateApplicationStatus] 현재 상태: ${application.status} → 변경할 상태: ${updateData.status}`,
        );

        await this.adoptionApplicationRepository.updateStatus(applicationId, updateData.status);

        // 입양 승인 완료 시 통계 업데이트
        if (updateData.status === ApplicationStatus.ADOPTION_APPROVED) {
            await this.breederRepository.incrementCompletedAdoptions(userId);
        }

        // 상담 완료 시 입양자에게 알림 및 이메일 발송
        this.logger.log(
            `[updateApplicationStatus] 상담 완료 체크: ${updateData.status} === ${ApplicationStatus.CONSULTATION_COMPLETED} ? ${updateData.status === ApplicationStatus.CONSULTATION_COMPLETED}`,
        );

        if (updateData.status === ApplicationStatus.CONSULTATION_COMPLETED) {
            try {
                this.logger.log('[updateApplicationStatus] 상담 완료 알림 발송 시작');

                const breeder = await this.breederRepository.findById(userId);
                const adopterId = application.adopterId.toString();
                const adopter = await this.adopterModel.findById(adopterId).lean().exec();

                this.logger.log(
                    `[updateApplicationStatus] 브리더 조회 결과: ${breeder ? `찾음 (name: ${breeder.name})` : '없음'}`,
                );
                this.logger.log(
                    `[updateApplicationStatus] 입양자 조회 결과: ${adopter ? `찾음 (email: ${adopter.emailAddress})` : '없음'}`,
                );

                if (breeder && adopter) {
                    this.logger.log(`[updateApplicationStatus] 알림 발송 대상 입양자 ID: ${adopterId}`);

                    // breederName이 빈 값일 경우를 대비하여 기본값 설정
                    const breederDisplayName = breeder.name || breeder.nickname || '브리더';

                    // 1. 인앱 알림 생성
                    await this.notificationService.createNotification(
                        adopterId,
                        'adopter',
                        NotificationType.CONSULT_COMPLETED,
                        {
                            breederId: userId,
                            breederName: breederDisplayName,
                            applicationId: applicationId,
                        },
                        `/applications/${applicationId}`,
                    );

                    this.logger.logSuccess('updateApplicationStatus', '상담 완료 인앱 알림 발송 완료', {
                        adopterId,
                        breederName: breederDisplayName,
                    });

                    // 2. 이메일 발송 (비동기, 결과를 기다리지 않음)
                    const appUrl = this.configService.get('APP_URL', 'https://pawpong.com');
                    this.mailService
                        .sendMail({
                            to: adopter.emailAddress,
                            subject: `${breederDisplayName}님과의 상담이 완료되었어요!`,
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2 style="color: #4F3B2E;">🐾 상담이 완료되었습니다!</h2>
                                    <p>${breederDisplayName}님과의 상담이 완료되었어요.</p>
                                    <p>어떠셨는지 후기를 남겨주세요!</p>
                                    <div style="margin: 30px 0;">
                                        <a href="${appUrl}/applications/${applicationId}"
                                           style="background-color: #4F3B2E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                            후기 작성하기
                                        </a>
                                    </div>
                                    <p style="color: #666; font-size: 12px;">
                                        이 이메일은 발신 전용입니다. 문의사항은 포퐁 고객센터를 이용해주세요.
                                    </p>
                                </div>
                            `,
                        })
                        .then(() => {
                            this.logger.logSuccess('updateApplicationStatus', '상담 완료 이메일 발송 완료', {
                                adopterEmail: adopter.emailAddress,
                                breederName: breeder.name,
                            });
                        })
                        .catch((emailError) => {
                            // 이메일 발송 실패는 로그만 남기고 계속 진행
                            this.logger.logWarning('updateApplicationStatus', '상담 완료 이메일 발송 실패', {
                                error: emailError,
                            });
                        });

                } else {
                    this.logger.logWarning(
                        'updateApplicationStatus',
                        '브리더 또는 입양자 정보를 찾을 수 없어 알림 발송 실패',
                        {
                            breederId: userId,
                            adopterId,
                        },
                    );
                }
            } catch (error) {
                // 알림 발송 실패해도 상담 완료 처리는 계속 진행
                this.logger.logError('updateApplicationStatus', '상담 완료 알림 발송 실패', error);
            }
        }

        // ✅ 참조 방식: AdoptionApplication 컬렉션만 업데이트하면 됨
        // (입양자 문서에 신청 내역 없음)

        return { message: '입양 신청 상태가 성공적으로 업데이트되었습니다.' };
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
        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        if (breeder.verification?.status === VerificationStatus.APPROVED) {
            throw new BadRequestException('이미 인증이 완료된 브리더입니다.');
        }

        const verification = {
            status: VerificationStatus.REVIEWING,
            plan: verificationData.plan,
            submittedAt: new Date(),
            documents: verificationData.documents || [],
            submittedByEmail: verificationData.submittedByEmail,
        };

        await this.breederRepository.updateVerification(userId, verification);

        return { message: '브리더 인증 신청이 성공적으로 제출되었습니다. 관리자 검토 후 결과를 알려드립니다.' };
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
        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const verification = breeder.verification;

        this.logger.log(
            `[getVerificationStatus] userId: ${userId}, documents count: ${verification?.documents?.length || 0}`,
        );
        verification?.documents?.forEach((doc: any, index: number) => {
            this.logger.log(
                `[getVerificationStatus] Document ${index + 1} - type: ${doc.type}, fileName: ${doc.fileName}, originalFileName: ${doc.originalFileName}`,
            );
        });

        // 문서 URL을 Signed URL로 변환 (1시간 유효)
        const documents =
            verification?.documents
                ?.map((doc: any) => {
                    // fileName이 올바른 GCS 경로인지 검증
                    // verification/ 또는 documents/verification/ 형식 모두 허용
                    const isValidFileName =
                        doc.fileName &&
                        (doc.fileName.startsWith('verification/') ||
                            doc.fileName.startsWith('documents/verification/'));

                    if (!isValidFileName) {
                        this.logger.logWarning(
                            'getVerificationStatus',
                            `Invalid fileName detected - type: ${doc.type}, fileName: ${doc.fileName}. This document will be skipped in the response.`,
                        );
                        return null; // 잘못된 서류는 제외
                    }

                    return {
                        type: doc.type,
                        fileName: doc.fileName, // 재제출 시 필요한 GCS 경로
                        url: this.storageService.generateSignedUrl(doc.fileName, 60),
                        originalFileName: doc.originalFileName,
                        uploadedAt: doc.uploadedAt,
                    };
                })
                .filter((doc) => doc !== null) || [];

        return {
            status: verification?.status || 'pending',
            plan: verification?.plan,
            level: verification?.level,
            submittedAt: verification?.submittedAt,
            reviewedAt: verification?.reviewedAt,
            documents,
            rejectionReason: verification?.rejectionReason,
            submittedByEmail: verification?.submittedByEmail || false,
        };
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
        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        // 별도 컬렉션에서 데이터 조회
        const [parentPets, availablePets] = await Promise.all([
            this.parentPetRepository.findByBreederId(userId, true),
            this.availablePetRepository.findByBreederIdWithFilters(userId, { includeInactive: false }),
        ]);

        const availablePetsData = (availablePets as any).pets || availablePets;

        // 파일명을 Signed URL로 변환 (1시간 유효)
        const profileImageFileName = this.storageService.generateSignedUrlSafe(breeder.profileImageFileName, 60);

        // verification.documents의 fileName을 동적으로 Signed URL로 변환
        const verificationWithSignedUrls = {
            ...breeder.verification,
            documents: breeder.verification.documents.map((doc: any) => ({
                type: doc.type,
                url: this.storageService.generateSignedUrl(doc.fileName, 60), // fileName → Signed URL 변환
                originalFileName: doc.originalFileName,
                uploadedAt: doc.uploadedAt,
            })),
        };

        // profile.representativePhotos를 Signed URL로 변환
        const profileWithSignedUrls = breeder.profile
            ? {
                  ...breeder.profile,
                  representativePhotos: this.storageService.generateSignedUrls(
                      breeder.profile.representativePhotos || [],
                      60,
                  ),
                  priceRange: (() => {
                      const priceRange = breeder.profile.priceRange;
                      if (!priceRange) return { min: 0, max: 0, display: 'not_set' };

                      // display 필드가 없는 경우 (마이그레이션 전 데이터) 자동 결정
                      if (!priceRange.display) {
                          return {
                              min: priceRange.min || 0,
                              max: priceRange.max || 0,
                              display: priceRange.min > 0 || priceRange.max > 0 ? 'range' : 'not_set',
                          };
                      }

                      return priceRange;
                  })(),
              }
            : breeder.profile;

        // parentPets의 photoFileName과 photos를 Signed URL로 변환
        const parentPetsWithSignedUrls = (parentPets || []).map((pet: any) => {
            const petObj = pet.toObject ? pet.toObject() : pet;
            const photoFileName = petObj.photoFileName;
            const photos = petObj.photos || [];

            // photos 배열에서 photoFileName과 중복되는 파일 제거 (대표사진은 photoUrl로만 표시)
            const additionalPhotos = photoFileName ? photos.filter((photo: string) => photo !== photoFileName) : photos;

            return {
                ...petObj,
                petId: (pet._id || pet.petId)?.toString(),
                photoFileName: this.storageService.generateSignedUrlSafe(photoFileName, 60),
                photos: this.storageService.generateSignedUrls(additionalPhotos, 60),
            };
        });

        // availablePets의 photos를 Signed URL로 변환
        const availablePetsWithSignedUrls = (availablePetsData || []).map((pet: any) => ({
            ...pet,
            petId: (pet._id || pet.petId)?.toString(),
            photos: this.storageService.generateSignedUrls(pet.photos || [], 60),
        }));

        return {
            breederId: (breeder._id as any).toString(),
            breederName: breeder.name,
            breederEmail: breeder.emailAddress,
            breederPhone: breeder.phoneNumber,
            authProvider: breeder.socialAuthInfo?.authProvider || 'local',
            marketingAgreed: breeder.marketingAgreed ?? false,
            profileImageFileName: profileImageFileName,
            accountStatus: breeder.accountStatus,
            petType: breeder.petType,
            verificationInfo: verificationWithSignedUrls,
            profileInfo: profileWithSignedUrls,
            breeds: breeder.breeds || [],
            parentPetInfo: parentPetsWithSignedUrls,
            availablePetInfo: availablePetsWithSignedUrls,
            applicationForm: breeder.applicationForm,
            statsInfo: breeder.stats,
            consultationAgreed: breeder.consultationAgreed ?? true,
        };
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
        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        // 통계 계산 및 데이터 조회
        const [statsResult, availableCount, reservedCount, adoptedCount, inactiveCount] = await Promise.all([
            this.availablePetRepository.findByBreederIdWithFilters(userId, { status, includeInactive, page, limit }),
            this.availablePetRepository.countByStatus(userId, PetStatus.AVAILABLE, true),
            this.availablePetRepository.countByStatus(userId, PetStatus.RESERVED, true),
            this.availablePetRepository.countByStatus(userId, PetStatus.ADOPTED, true),
            this.availablePetRepository.countInactive(userId),
        ]);

        const { pets, total } = statsResult;

        // 각 개체별 입양 신청 수 조회
        const petIds = pets.map((pet: any) => pet.petId || pet._id.toString());
        const applicationCountMap = await this.adoptionApplicationRepository.countByPetIds(petIds);

        // 데이터 변환
        const items = pets.map((pet: any) => {
            const birthDate = new Date(pet.birthDate);
            const now = new Date();
            const ageInMonths = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

            return {
                petId: pet.petId,
                name: pet.name,
                breed: pet.breed,
                gender: pet.gender,
                birthDate: pet.birthDate,
                ageInMonths,
                price: pet.price,
                status: pet.status,
                isActive: pet.isActive,
                mainPhoto: pet.photos?.[0] || '',
                photoCount: pet.photos?.length || 0,
                viewCount: pet.viewCount || 0,
                applicationCount: applicationCountMap.get(pet.petId) || 0,
                createdAt: pet.createdAt,
                updatedAt: pet.updatedAt,
            };
        });

        const totalPages = Math.ceil(total / limit);

        const paginationResponse = new PaginationBuilder<any>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(total)
            .build();

        return {
            ...paginationResponse,
            availableCount,
            reservedCount,
            adoptedCount,
            inactiveCount,
        };
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
        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        // BreederReview 컬렉션에서 직접 조회 (reply 정보 포함)
        const breederId = new Types.ObjectId(userId);

        // 기본 필터: 해당 브리더의 후기
        const filter: any = { breederId };

        // 공개 여부 필터링
        if (visibility === 'visible') {
            filter.isVisible = true;
        } else if (visibility === 'hidden') {
            filter.isVisible = false;
        }

        // 전체 통계 조회
        const [totalCount, visibleCount] = await Promise.all([
            this.breederReviewModel.countDocuments({ breederId }),
            this.breederReviewModel.countDocuments({ breederId, isVisible: true }),
        ]);
        const hiddenCount = totalCount - visibleCount;

        // 페이지네이션 조회
        const skip = (page - 1) * limit;
        const reviewDocs = await this.breederReviewModel
            .find(filter)
            .sort({ writtenAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('adopterId', 'name nickname')
            .lean();

        // 데이터 변환
        const reviews = reviewDocs.map((review: any) => ({
            reviewId: review._id.toString(),
            adopterId: review.adopterId?._id?.toString() || '',
            adopterName: review.adopterId?.name || review.adopterId?.nickname || '익명',
            petName: '', // 필요시 추가 조회
            rating: 0, // 현재 스키마에 rating 없음
            petHealthRating: undefined,
            communicationRating: undefined,
            content: review.content,
            photos: [],
            writtenAt: review.writtenAt,
            type: review.type || 'consultation',
            isVisible: review.isVisible,
            reportCount: review.isReported ? 1 : 0,
            // 답글 정보 추가
            replyContent: review.replyContent,
            replyWrittenAt: review.replyWrittenAt,
            replyUpdatedAt: review.replyUpdatedAt,
        }));

        const total = visibility === 'all' ? totalCount : await this.breederReviewModel.countDocuments(filter);

        const paginationResponse = new PaginationBuilder<any>()
            .setItems(reviews)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(total)
            .build();

        return {
            ...paginationResponse,
            averageRating: breeder.stats?.averageRating || 0,
            totalReviews: totalCount,
            visibleReviews: visibleCount,
            hiddenReviews: hiddenCount,
        };
    }

    /**
     * 표준 입양 신청 폼 질문 17개 (Figma 디자인 기반 - 수정 불가)
     *
     * 모든 브리더에게 자동으로 포함되는 필수 질문들입니다.
     */
    private getStandardQuestions() {
        return [
            {
                id: 'privacyConsent',
                type: 'checkbox',
                label: '개인정보 수집 및 이용에 동의하시나요?',
                required: true,
                order: 1,
                isStandard: true,
            },
            {
                id: 'selfIntroduction',
                type: 'textarea',
                label: '간단하게 자기소개 부탁드려요 (성별, 연령대, 거주지, 생활 패턴 등)',
                required: true,
                order: 2,
                isStandard: true,
            },
            {
                id: 'familyMembers',
                type: 'text',
                label: '함께 거주하는 가족 구성원을 알려주세요',
                required: true,
                order: 3,
                isStandard: true,
            },
            {
                id: 'allFamilyConsent',
                type: 'checkbox',
                label: '모든 가족 구성원들이 입양에 동의하셨나요?',
                required: true,
                order: 4,
                isStandard: true,
            },
            {
                id: 'allergyTestInfo',
                type: 'text',
                label: '본인을 포함한 모든 가족 구성원분들께서 알러지 검사를 마치셨나요?',
                required: true,
                order: 5,
                isStandard: true,
            },
            {
                id: 'timeAwayFromHome',
                type: 'text',
                label: '평균적으로 집을 비우는 시간은 얼마나 되나요?',
                required: true,
                order: 6,
                isStandard: true,
            },
            {
                id: 'livingSpaceDescription',
                type: 'textarea',
                label: '아이와 함께 지내게 될 공간을 소개해 주세요',
                required: true,
                order: 7,
                isStandard: true,
            },
            {
                id: 'previousPetExperience',
                type: 'textarea',
                label: '현재 함께하는, 또는 이전에 함께했던 반려동물에 대해 알려주세요',
                required: true,
                order: 8,
                isStandard: true,
            },
            {
                id: 'canProvideBasicCare',
                type: 'checkbox',
                label: '정기 예방접종·건강검진·훈련 등 기본 케어를 책임지고 해주실 수 있나요?',
                required: true,
                order: 9,
                isStandard: true,
            },
            {
                id: 'canAffordMedicalExpenses',
                type: 'checkbox',
                label: '예상치 못한 질병이나 사고 등으로 치료비가 발생할 경우 감당 가능하신가요?',
                required: true,
                order: 10,
                isStandard: true,
            },
            {
                id: 'preferredPetDescription',
                type: 'textarea',
                label: '마음에 두신 아이가 있으신가요? (특징: 성별, 타입, 외모, 컬러패턴, 성격 등)',
                required: false,
                order: 11,
                isStandard: true,
            },
            {
                id: 'desiredAdoptionTiming',
                type: 'text',
                label: '원하시는 입양 시기가 있나요?',
                required: false,
                order: 12,
                isStandard: true,
            },
            {
                id: 'additionalNotes',
                type: 'textarea',
                label: '마지막으로 궁금하신 점이나 남기시고 싶으신 말씀이 있나요?',
                required: false,
                order: 13,
                isStandard: true,
            },
        ]; // 총 13개 표준 질문
    }

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
        const breeder = await this.breederRepository.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const standardQuestions = this.getStandardQuestions();

        // 브리더의 커스텀 질문 가져오기
        const customQuestions = (breeder.applicationForm || []).map((q, index) => ({
            id: q.id,
            type: q.type,
            label: q.label,
            required: q.required,
            options: q.options,
            placeholder: q.placeholder,
            order: standardQuestions.length + index + 1, // 표준 질문 다음에 순서 배치
            isStandard: false,
        }));

        return {
            standardQuestions,
            customQuestions,
            totalQuestions: standardQuestions.length + customQuestions.length,
        };
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
        const breeder = await this.breederRepository.findByIdForUpdate(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        // 커스텀 질문 ID 중복 검증
        const ids = updateDto.customQuestions.map((q: any) => q.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
            throw new BadRequestException('질문 ID가 중복되었습니다.');
        }

        // 표준 질문 ID와 충돌 방지
        const standardIds = this.getStandardQuestions().map((q) => q.id);
        const conflicts = ids.filter((id: string) => standardIds.includes(id));
        if (conflicts.length > 0) {
            throw new BadRequestException(`다음 ID는 표준 질문과 중복되어 사용할 수 없습니다: ${conflicts.join(', ')}`);
        }

        // 브리더 문서 업데이트
        breeder.applicationForm = updateDto.customQuestions.map((q: any) => ({
            id: q.id,
            type: q.type,
            label: q.label,
            required: q.required,
            options: q.options,
            placeholder: q.placeholder,
            order: q.order,
        }));

        await breeder.save();

        return {
            message: '입양 신청 폼이 성공적으로 업데이트되었습니다.',
            customQuestions: breeder.applicationForm,
        };
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
        const breeder = await this.breederRepository.findByIdForUpdate(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        // 1. 빈 질문 제거 (공백만 있는 질문)
        const validQuestions = questions.filter((q) => q.question && q.question.trim().length > 0);

        // 2. 최대 5개 제한 (DTO에서도 체크하지만 이중 검증)
        if (validQuestions.length > 5) {
            throw new BadRequestException('커스텀 질문은 최대 5개까지만 추가할 수 있습니다.');
        }

        // 3. 중복 질문 체크
        const questionTexts = validQuestions.map((q) => q.question.trim().toLowerCase());
        const uniqueQuestions = new Set(questionTexts);
        if (questionTexts.length !== uniqueQuestions.size) {
            throw new BadRequestException('중복된 질문이 있습니다. 각 질문은 고유해야 합니다.');
        }

        const timestamp = Date.now();

        // 질문 텍스트를 전체 커스텀 질문 객체로 변환
        breeder.applicationForm = validQuestions.map((q, index) => ({
            id: `custom_${timestamp}_${index}`,
            type: 'textarea',
            label: q.question.trim(), // 앞뒤 공백 제거
            required: false,
            options: undefined,
            placeholder: undefined,
            order: index + 1,
        }));

        await breeder.save();

        return {
            message: '입양 신청 폼이 성공적으로 업데이트되었습니다.',
            customQuestions: breeder.applicationForm,
            totalQuestions: breeder.applicationForm.length,
        };
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
        this.logger.logStart('deleteBreederAccount', '브리더 계정 탈퇴 처리 시작', { userId });

        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            this.logger.logError('deleteBreederAccount', '브리더를 찾을 수 없음', new Error('Breeder not found'));
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        // 이미 탈퇴된 계정인지 확인
        if (breeder.accountStatus === 'deleted') {
            throw new BadRequestException('이미 탈퇴된 계정입니다.');
        }

        // 기타 사유인 경우 otherReason 필수 검증
        if (deleteData?.reason === 'other' && !deleteData?.otherReason) {
            throw new BadRequestException('기타 사유를 입력해주세요.');
        }

        // 진행 중인 입양 신청 확인 (선택적 - 비즈니스 요구사항에 따라 활성화)
        const pendingApplications = await this.adoptionApplicationRepository.countByStatus(
            userId,
            ApplicationStatus.CONSULTATION_PENDING,
        );

        if (pendingApplications > 0) {
            this.logger.logWarning('deleteBreederAccount', `진행 중인 입양 신청 ${pendingApplications}건 존재`, {
                userId,
                pendingApplications,
            });
            // 필요시 여기서 에러를 던질 수 있음:
            // throw new BadRequestException(`진행 중인 입양 신청 ${pendingApplications}건을 먼저 처리해주세요.`);
        }

        // 소프트 딜리트: accountStatus를 'deleted'로 변경하고 탈퇴 정보 저장
        const deletedAt = new Date();
        await this.breederRepository.updateProfile(userId, {
            accountStatus: 'deleted',
            deletedAt: deletedAt,
            deleteReason: deleteData?.reason || null,
            deleteReasonDetail: deleteData?.otherReason || null,
            updatedAt: deletedAt,
        });

        // 브리더의 모든 분양 개체 비활성화 (홈에서 노출되지 않도록)
        const deactivatedPetsCount = await this.availablePetRepository.deactivateAllByBreeder(userId);
        this.logger.log(`[deleteBreederAccount] 분양 개체 ${deactivatedPetsCount}개 비활성화 완료`);

        // Discord 탈퇴 알림 전송
        await this.discordWebhookService.notifyUserWithdrawal({
            userId: userId,
            userType: 'breeder',
            email: breeder.emailAddress,
            name: breeder.name || breeder.nickname || '알 수 없음',
            nickname: breeder.nickname,
            reason: deleteData?.reason || 'unknown',
            reasonDetail: deleteData?.otherReason || undefined,
            deletedAt: deletedAt,
        });

        this.logger.logSuccess('deleteBreederAccount', '브리더 계정 탈퇴 완료', {
            userId,
            deletedAt,
            reason: deleteData?.reason,
            pendingApplications,
        });

        return {
            breederId: userId,
            deletedAt: deletedAt.toISOString(),
            message: '브리더 회원 탈퇴가 성공적으로 처리되었습니다.',
        };
    }

    /**
     * 후기 답글 등록
     * 브리더가 자신에게 달린 후기에 답글을 작성합니다.
     */
    async addReviewReply(breederId: string, reviewId: string, content: string): Promise<any> {
        // 후기 조회 및 권한 확인
        const review = await this.breederReviewModel.findOne({
            _id: new Types.ObjectId(reviewId),
            breederId: new Types.ObjectId(breederId),
        });

        if (!review) {
            throw new BadRequestException('해당 후기를 찾을 수 없거나 권한이 없습니다.');
        }

        // 이미 답글이 있는지 확인
        if (review.replyContent) {
            throw new BadRequestException('이미 답글이 작성되어 있습니다. 수정 기능을 이용해주세요.');
        }

        const now = new Date();

        // 답글 저장
        await this.breederReviewModel.findByIdAndUpdate(reviewId, {
            $set: {
                replyContent: content,
                replyWrittenAt: now,
            },
        });

        this.logger.logSuccess('addReviewReply', '후기 답글 등록 완료', {
            breederId,
            reviewId,
        });

        return {
            reviewId,
            replyContent: content,
            replyWrittenAt: now.toISOString(),
        };
    }

    /**
     * 후기 답글 수정
     * 브리더가 자신이 작성한 답글을 수정합니다.
     */
    async updateReviewReply(breederId: string, reviewId: string, content: string): Promise<any> {
        // 후기 조회 및 권한 확인
        const review = await this.breederReviewModel.findOne({
            _id: new Types.ObjectId(reviewId),
            breederId: new Types.ObjectId(breederId),
        });

        if (!review) {
            throw new BadRequestException('해당 후기를 찾을 수 없거나 권한이 없습니다.');
        }

        // 기존 답글이 있는지 확인
        if (!review.replyContent) {
            throw new BadRequestException('수정할 답글이 없습니다. 먼저 답글을 작성해주세요.');
        }

        const now = new Date();

        // 답글 수정
        await this.breederReviewModel.findByIdAndUpdate(reviewId, {
            $set: {
                replyContent: content,
                replyUpdatedAt: now,
            },
        });

        this.logger.logSuccess('updateReviewReply', '후기 답글 수정 완료', {
            breederId,
            reviewId,
        });

        return {
            reviewId,
            replyContent: content,
            replyWrittenAt: review.replyWrittenAt?.toISOString(),
            replyUpdatedAt: now.toISOString(),
        };
    }

    /**
     * 후기 답글 삭제
     * 브리더가 자신이 작성한 답글을 삭제합니다.
     */
    async deleteReviewReply(breederId: string, reviewId: string): Promise<any> {
        // 후기 조회 및 권한 확인
        const review = await this.breederReviewModel.findOne({
            _id: new Types.ObjectId(reviewId),
            breederId: new Types.ObjectId(breederId),
        });

        if (!review) {
            throw new BadRequestException('해당 후기를 찾을 수 없거나 권한이 없습니다.');
        }

        // 기존 답글이 있는지 확인
        if (!review.replyContent) {
            throw new BadRequestException('삭제할 답글이 없습니다.');
        }

        // 답글 삭제 (필드 제거)
        await this.breederReviewModel.findByIdAndUpdate(reviewId, {
            $unset: {
                replyContent: '',
                replyWrittenAt: '',
                replyUpdatedAt: '',
            },
        });

        this.logger.logSuccess('deleteReviewReply', '후기 답글 삭제 완료', {
            breederId,
            reviewId,
        });

        return {
            reviewId,
            message: '답글이 삭제되었습니다.',
        };
    }
}
