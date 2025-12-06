import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { ApplicationStatus, ReportStatus, NotificationType, RecipientType } from '../../common/enum/user.enum';

import { StorageService } from '../../common/storage/storage.service';
import { MailService } from '../../common/mail/mail.service';
import { MailTemplateService } from '../../common/mail/mail-template.service';
import { NotificationService } from '../notification/notification.service';

import { Breeder, BreederDocument } from '../../schema/breeder.schema';
import { BreederReview, BreederReviewDocument } from '../../schema/breeder-review.schema';
import { AdoptionApplication, AdoptionApplicationDocument } from '../../schema/adoption-application.schema';

import { AdopterRepository } from './adopter.repository';
import { BreederRepository } from '../breeder-management/repository/breeder.repository';
import { AvailablePetManagementRepository } from '../breeder-management/repository/available-pet-management.repository';

import { AdopterMapper } from './mapper/adopter.mapper';

import { FavoriteAddRequestDto } from './dto/request/favorite-add-request.dto';
import { ReviewCreateRequestDto } from './dto/request/review-create-request.dto';
import { ReportCreateRequestDto } from './dto/request/report-create-request.dto';
import { ApplicationCreateRequestDto } from './dto/request/application-create-request.dto';
import { AccountDeleteRequestDto } from './dto/request/account-delete-request.dto';
import { AdopterProfileResponseDto } from './dto/response/adopter-profile-response.dto';
import { AccountDeleteResponseDto } from './dto/response/account-delete-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { PaginationBuilder } from '../../common/dto/pagination/pagination-builder.dto';

/**
 * 입양자 비즈니스 로직 처리 Service
 *
 * 역할:
 * - 입양 신청, 후기 작성, 즐겨찾기, 신고 등 입양자 핵심 기능 처리
 * - Repository 계층과 Controller 계층 사이의 비즈니스 로직 담당
 * - 복잡한 비즈니스 규칙 검증 및 데이터 일관성 보장
 * - 도메인 간 데이터 동기화 및 관계 관리
 *
 * 설계 원칙:
 * - 단일 책임 원칙: 입양자 도메인 비즈니스 로직만 담당
 * - 의존성 주입: Repository를 통한 데이터 접근
 * - 트랜잭션 일관성: 관련 데이터 동시 업데이트
 * - 예외 안전성: 모든 에러 케이스 대응
 */
@Injectable()
export class AdopterService {
    constructor(
        private storageService: StorageService,
        private mailService: MailService,
        private mailTemplateService: MailTemplateService,
        private notificationService: NotificationService,

        private adopterRepository: AdopterRepository,
        private breederRepository: BreederRepository,
        private availablePetManagementRepository: AvailablePetManagementRepository,

        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        @InjectModel(BreederReview.name) private breederReviewModel: Model<BreederReviewDocument>,
        @InjectModel(AdoptionApplication.name) private adoptionApplicationModel: Model<AdoptionApplicationDocument>,
    ) { }

    /**
     * 입양 신청서 제출 처리
     *
     * 별도 컬렉션(adoption_applications)에 신청 정보를 저장합니다.
     * 입양자와 브리더 양쪽에서 이 컬렉션을 참조합니다.
     *
     * 비즈니스 규칙:
     * - 입양자 계정 상태 확인 필수
     * - 브리더 존재 여부 검증
     * - 반려동물 ID는 선택사항 (특정 개체 또는 전체 상담)
     * - 개인정보 수집 동의 필수
     * - 중복 신청 방지 검증 (같은 브리더에게 대기 중인 신청이 있는 경우)
     *
     * @param userId 입양자 고유 ID (JWT에서 추출)
     * @param dto 입양 신청 데이터 (Figma 디자인 기반 필드)
     * @returns 생성된 신청서 정보
     * @throws BadRequestException 잘못된 요청 데이터
     * @throws ConflictException 중복 신청 시도
     */
    async createApplication(userId: string, dto: ApplicationCreateRequestDto): Promise<any> {
        // 1. 입양자 계정 존재 및 상태 검증
        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        // 2. 개인정보 수집 동의 확인
        if (!dto.privacyConsent) {
            throw new BadRequestException('개인정보 수집 및 이용에 동의해야 신청이 가능합니다.');
        }

        // 3. 브리더 계정 존재 검증 및 커스텀 폼 가져오기
        const breeder = await this.breederRepository.findById(dto.breederId);
        if (!breeder) {
            throw new BadRequestException('해당 브리더를 찾을 수 없습니다.');
        }

        // 3-1. 커스텀 질문 validation (브리더가 설정한 필수 질문 체크)
        const customQuestions = breeder.applicationForm || [];
        const customResponsesMap = new Map((dto.customResponses || []).map((r) => [r.questionId, r.answer]));

        for (const question of customQuestions) {
            if (question.required) {
                const answer = customResponsesMap.get(question.id);
                if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
                    throw new BadRequestException(`필수 질문에 답변해주세요: ${question.label}`);
                }
            }
        }

        // 4. 반려동물 검증 (petId가 있는 경우에만)
        let pet: any = null;
        if (dto.petId) {
            pet = await this.availablePetManagementRepository.findByIdAndBreeder(dto.petId, dto.breederId);
            if (!pet) {
                throw new BadRequestException('해당 반려동물을 찾을 수 없습니다.');
            }

            if (pet.status !== 'available') {
                throw new BadRequestException('현재 분양 신청이 불가능한 반려동물입니다.');
            }
        }

        // 5. 중복 신청 방지 검증 (같은 브리더에게 대기 중인 신청이 있는지 확인)
        const existingPendingApplication = await this.adoptionApplicationModel.findOne({
            adopterId: userId,
            breederId: dto.breederId,
            status: ApplicationStatus.CONSULTATION_PENDING,
        });

        if (existingPendingApplication) {
            throw new ConflictException('해당 브리더에게 이미 대기 중인 상담 신청이 있습니다.');
        }

        // 6. 커스텀 응답 스냅샷 생성 (브리더가 나중에 질문을 수정/삭제해도 기록 유지)
        const customResponsesSnapshot = (dto.customResponses || []).map((response) => {
            const question = customQuestions.find((q) => q.id === response.questionId);
            if (!question) {
                throw new BadRequestException(`존재하지 않는 질문 ID입니다: ${response.questionId}`);
            }
            return {
                questionId: response.questionId,
                questionLabel: question.label,
                questionType: question.type,
                answer: response.answer,
            };
        });

        // 7. AdoptionApplication 컬렉션에 저장할 데이터 구성
        const newApplication = new this.adoptionApplicationModel({
            breederId: dto.breederId,
            adopterId: userId,
            adopterName: adopter.nickname,
            adopterEmail: adopter.emailAddress,
            adopterPhone: adopter.phoneNumber || '',
            petId: pet ? dto.petId : undefined,
            petName: pet ? pet.name : undefined,
            status: ApplicationStatus.CONSULTATION_PENDING,
            standardResponses: {
                privacyConsent: dto.privacyConsent,
                selfIntroduction: dto.selfIntroduction,
                familyMembers: dto.familyMembers,
                allFamilyConsent: dto.allFamilyConsent,
                allergyTestInfo: dto.allergyTestInfo,
                timeAwayFromHome: dto.timeAwayFromHome,
                livingSpaceDescription: dto.livingSpaceDescription,
                previousPetExperience: dto.previousPetExperience,
                // 추가된 Figma 디자인 기반 필드들
                canProvideBasicCare: dto.canProvideBasicCare,
                canAffordMedicalExpenses: dto.canAffordMedicalExpenses,
                preferredPetDescription: dto.preferredPetDescription,
                desiredAdoptionTiming: dto.desiredAdoptionTiming,
                additionalNotes: dto.additionalNotes,
            },
            customResponses: customResponsesSnapshot,
            appliedAt: new Date(),
        });

        const savedApplication = await newApplication.save();

        // 8. 브리더에게 새 상담 신청 알림 및 이메일 발송
        await this.sendNewApplicationNotification(breeder);

        // 9. 응답 데이터 구성 (Mapper 패턴 사용)
        return AdopterMapper.toApplicationCreateResponse(savedApplication, breeder.name, pet?.name);
    }

    /**
     * 새 상담 신청 알림 및 이메일 발송 (빌더 통합)
     * @private
     */
    private async sendNewApplicationNotification(breeder: any): Promise<void> {
        const breederId = breeder._id.toString();
        const emailContent = breeder.emailAddress
            ? this.mailTemplateService.getNewApplicationEmail(breeder.name)
            : null;

        const builder = this.notificationService
            .to(breederId, RecipientType.BREEDER)
            .type(NotificationType.NEW_APPLICATION)
            .title('💬 새로운 입양 상담 신청이 도착했어요!')
            .content('지금 확인해보세요.')
            .related(breederId, 'applications');

        if (emailContent && breeder.emailAddress) {
            builder.withEmail({
                to: breeder.emailAddress,
                subject: emailContent.subject,
                html: emailContent.html,
            });
        }

        await builder.send();
    }

    /**
     * 입양 후기 작성 처리
     *
     * 변경사항:
     * - 상담 완료된 입양 신청에 대해서만 작성 가능
     * - 입양 신청당 1개의 후기만 작성 가능 (중복 방지)
     * - 본인 신청에 대해서만 후기 작성 가능
     *
     * @param userId 입양자 고유 ID (JWT에서 추출)
     * @param createReviewDto 후기 작성 데이터
     * @returns 생성된 후기 정보
     * @throws BadRequestException 잘못된 요청
     */
    async createReview(userId: string, createReviewDto: ReviewCreateRequestDto): Promise<any> {
        const { applicationId, reviewType, content } = createReviewDto;

        // 1. 입양자 존재 확인
        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        // 2. 입양 신청 조회 및 검증
        const application = await this.adoptionApplicationModel.findById(applicationId);
        if (!application) {
            throw new BadRequestException('해당 입양 신청을 찾을 수 없습니다.');
        }

        // 3. 본인 신청인지 확인
        if (application.adopterId.toString() !== userId) {
            throw new BadRequestException('본인의 입양 신청에 대해서만 후기를 작성할 수 있습니다.');
        }

        // 4. 상담 완료 상태인지 확인
        if (application.status !== ApplicationStatus.CONSULTATION_COMPLETED) {
            throw new BadRequestException(
                '상담이 완료된 신청에 대해서만 후기를 작성할 수 있습니다. 현재 상태: ' + application.status,
            );
        }

        // 5. 브리더 존재 확인
        const breeder = await this.breederRepository.findById(application.breederId.toString());
        if (!breeder) {
            throw new BadRequestException('해당 브리더를 찾을 수 없습니다.');
        }

        // 6. 중복 후기 작성 방지 (해당 신청에 이미 작성한 후기가 있는지 확인)
        const existingReview = await this.breederReviewModel.findOne({
            applicationId: applicationId,
        });

        if (existingReview) {
            throw new ConflictException('이미 해당 신청에 대한 후기를 작성하셨습니다.');
        }

        // 7. BreederReview 컬렉션에 후기 저장
        const newReview = new this.breederReviewModel({
            applicationId: applicationId,
            breederId: application.breederId,
            adopterId: userId,
            type: reviewType,
            content: content,
            writtenAt: new Date(),
            isVisible: true,
        });

        const savedReview = await newReview.save();

        // 8. 브리더 통계 업데이트
        await this.breederRepository.incrementReviewCount(application.breederId.toString());

        // 9. 브리더에게 새 후기 알림 발송 (이메일 없음, 서비스 알림만)
        await this.sendNewReviewNotification(application.breederId.toString());

        return {
            reviewId: (savedReview._id as any).toString(),
            applicationId: applicationId,
            breederId: application.breederId.toString(),
            reviewType: reviewType,
            writtenAt: savedReview.writtenAt.toISOString(),
        };
    }

    /**
     * 새 후기 등록 알림 발송 (서비스 알림만, 이메일 없음)
     * @private
     */
    private async sendNewReviewNotification(breederId: string): Promise<void> {
        await this.notificationService
            .to(breederId, RecipientType.BREEDER)
            .type(NotificationType.NEW_REVIEW)
            .title('⭐ 새로운 후기가 등록되었어요!')
            .content('브리더 프로필에서 후기를 확인해보세요.')
            .related(breederId, 'profile')
            .send();
    }

    /**
     * 즐겨찾기 브리더 추가
     * 브리더 기본 정보를 캐시하여 빠른 조회 지원
     *
     * 비즈니스 규칙:
     * - 중복 즐겨찾기 방지
     * - 브리더 기본 정보 스냅샷 저장
     * - 실시간 브리더 정보 반영
     *
     * @param userId 입양자 고유 ID
     * @param addFavoriteDto 즐겨찾기 추가 데이터
     * @returns 성공 메시지
     * @throws ConflictException 이미 즐겨찾기된 브리더
     */
    async addFavorite(userId: string, addFavoriteDto: FavoriteAddRequestDto): Promise<any> {
        const { breederId } = addFavoriteDto;

        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        const breeder = await this.breederRepository.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('해당 브리더를 찾을 수 없습니다.');
        }

        // 중복 즐겨찾기 검증
        const existingFavorite = await this.adopterRepository.findExistingFavorite(userId, breederId);
        if (existingFavorite) {
            throw new ConflictException('이미 즐겨찾기에 추가된 브리더입니다.');
        }

        // 즐겨찾기 데이터 구성 (Mapper 패턴 사용)
        const favorite = AdopterMapper.toFavoriteBreeder(breederId, breeder);

        await this.adopterRepository.addFavoriteBreeder(userId, favorite);

        return { message: '브리더를 즐겨찾기에 추가했습니다.' };
    }

    /**
     * 즐겨찾기 브리더 제거
     *
     * @param userId 입양자 고유 ID
     * @param breederId 제거할 브리더 ID
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 즐겨찾기
     */
    async removeFavorite(userId: string, breederId: string): Promise<any> {
        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        const existingFavorite = await this.adopterRepository.findExistingFavorite(userId, breederId);
        if (!existingFavorite) {
            throw new BadRequestException('즐겨찾기 목록에서 해당 브리더를 찾을 수 없습니다.');
        }

        await this.adopterRepository.removeFavoriteBreeder(userId, breederId);

        return { message: '즐겨찾기에서 브리더를 제거했습니다.' };
    }

    /**
     * 즐겨찾기 브리더 목록 조회
     * 페이지네이션을 지원하며, 브리더의 최신 정보와 함께 반환
     *
     * @param userId 입양자 고유 ID
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 항목 수 (기본값: 10)
     * @returns 즐겨찾기 브리더 목록과 페이지네이션 정보
     * @throws BadRequestException 존재하지 않는 입양자
     */
    async getFavoriteList(userId: string, page: number = 1, limit: number = 10): Promise<any> {
        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        const { favorites, total } = await this.adopterRepository.findFavoriteList(userId, page, limit);

        // 각 즐겨찾기 브리더의 최신 정보 조회 (Mapper 패턴 사용)
        const favoriteListWithDetails = await Promise.all(
            favorites.map(async (fav: any) => {
                try {
                    const breeder = await this.breederRepository.findById(fav.favoriteBreederId);
                    return AdopterMapper.toFavoriteDetail(fav, breeder);
                } catch (error) {
                    // 에러 발생 시 기본 정보 반환
                    return AdopterMapper.toFavoriteDetail(fav, null);
                }
            }),
        );

        const totalPages = Math.ceil(total / limit);

        return new PaginationBuilder<any>()
            .setItems(favoriteListWithDetails)
            .setPage(page)
            .setTake(limit)
            .setTotalCount(total)
            .build();
    }

    /**
     * 브리더 신고 제출
     * 관리자 검토를 위한 신고 내역 생성
     *
     * 비즈니스 규칙:
     * - 신고자 정보 기록 및 추적
     * - 신고 사유 및 상세 내용 필수
     * - 관리자 검토 대기 상태로 초기화
     *
     * @param userId 신고자 (입양자) 고유 ID
     * @param createReportDto 신고 내용 데이터
     * @returns 생성된 신고 ID 및 성공 메시지
     */
    async createReport(userId: string, createReportDto: ReportCreateRequestDto): Promise<any> {
        const { breederId, type, description } = createReportDto;

        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        const breeder = await this.breederRepository.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('신고할 브리더를 찾을 수 없습니다.');
        }

        const reportId = randomUUID();

        // 신고 데이터 구성 (Mapper 패턴 사용)
        const report = AdopterMapper.toReport(
            reportId,
            userId,
            adopter.nickname,
            type,
            description,
            ReportStatus.PENDING,
        );

        await this.breederRepository.addReport(breederId, report);

        return {
            reportId,
            message: '신고가 성공적으로 접수되었습니다. 관리자 검토 후 처리됩니다.',
        };
    }

    /**
     * 입양자 프로필 정보 조회
     * 즐겨찾기, 입양 신청 내역, 작성한 후기 등 전체 데이터 포함
     *
     * @param userId 입양자 고유 ID
     * @returns 입양자 전체 프로필 정보
     * @throws BadRequestException 존재하지 않는 입양자
     */
    async getProfile(userId: string): Promise<AdopterProfileResponseDto> {
        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        // 프로필 응답 데이터 구성 (Mapper 패턴 사용)
        const profileResponse = AdopterMapper.toProfileResponse(adopter);

        // 파일명을 Signed URL로 변환 (1시간 유효)
        if (profileResponse.profileImageFileName) {
            profileResponse.profileImageFileName = this.storageService.generateSignedUrlSafe(
                profileResponse.profileImageFileName,
                60,
            );
        }

        return profileResponse;
    }

    /**
     * 입양자 프로필 정보 수정
     * 이름, 연락처, 프로필 이미지 등 기본 정보 변경
     *
     * @param userId 입양자 고유 ID
     * @param updateData 수정할 프로필 데이터
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 입양자
     */
    async updateProfile(
        userId: string,
        updateData: { name?: string; phone?: string; profileImage?: string },
    ): Promise<any> {
        // 요청 데이터를 데이터베이스 스키마에 맞게 변환 (Mapper 패턴 사용)
        const mappedUpdateData = AdopterMapper.toProfileUpdateData(updateData);

        const adopter = await this.adopterRepository.updateProfile(userId, mappedUpdateData);

        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        return { message: '프로필이 성공적으로 수정되었습니다.' };
    }

    /**
     * 입양자가 작성한 후기 목록 조회 (브리더 상세 정보 포함)
     *
     * 반환 정보:
     * - 브리더 닉네임, 프로필 사진, 레벨, 브리딩 동물 종류
     * - 후기 내용, 후기 종류, 작성 일자
     * - 최신순 정렬, 페이지당 10개
     *
     * @param userId 입양자 고유 ID
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 후기 목록과 페이지네이션 정보
     */
    async getMyReviews(userId: string, page: number = 1, limit: number = 10): Promise<any> {
        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            this.breederReviewModel
                .find({ adopterId: userId })
                .sort({ writtenAt: -1 }) // 최신순 정렬
                .skip(skip)
                .limit(limit)
                .populate('breederId', 'nickname profileImageFileName verification.level petType') // 브리더 상세 정보
                .lean()
                .exec(),
            this.breederReviewModel.countDocuments({ adopterId: userId }).exec(),
        ]);

        const formattedReviews = reviews.map((review: any) => {
            const breeder = review.breederId;
            return {
                reviewId: review._id.toString(),
                applicationId: review.applicationId?.toString() || null,
                breederId: breeder?._id?.toString() || null,
                breederNickname: breeder?.nickname || '알 수 없음',
                breederProfileImage: breeder?.profileImageFileName
                    ? this.storageService.generateSignedUrlSafe(breeder.profileImageFileName, 60)
                    : null,
                breederLevel: breeder?.verification?.level || 'new',
                breedingPetType: breeder?.petType || 'unknown',
                content: review.content,
                reviewType: review.type,
                writtenAt: review.writtenAt,
            };
        });

        const totalPages = Math.ceil(total / limit);

        return new PaginationBuilder<any>()
            .setItems(formattedReviews)
            .setPage(page)
            .setTake(limit)
            .setTotalCount(total)
            .build();
    }

    /**
     * 후기 세부 조회
     *
     * @param userId 입양자 고유 ID
     * @param reviewId 후기 ID
     * @returns 후기 세부 정보
     */
    async getReviewDetail(userId: string, reviewId: string): Promise<any> {
        const review = await this.breederReviewModel
            .findOne({ _id: reviewId, adopterId: userId })
            .populate('breederId', 'nickname profileImageFileName verification.level petType')
            .lean()
            .exec();

        if (!review) {
            throw new BadRequestException('후기를 찾을 수 없습니다.');
        }

        const breeder = review.breederId as any;

        return {
            reviewId: review._id.toString(),
            breederNickname: breeder?.nickname || '알 수 없음',
            breederProfileImage: breeder?.profileImageFileName
                ? this.storageService.generateSignedUrlSafe(breeder.profileImageFileName, 60)
                : null,
            breederLevel: breeder?.verification?.level || 'new',
            breedingPetType: breeder?.petType || 'unknown',
            content: review.content,
            reviewType: review.type,
            writtenAt: review.writtenAt,
            isVisible: review.isVisible,
        };
    }

    /**
     * 후기 신고 처리
     *
     * 부적절한 후기를 신고하여 관리자 검토를 요청합니다.
     * 신고된 후기는 isReported 필드가 true로 변경되며,
     * 관리자가 검토 후 공개 여부를 결정합니다.
     *
     * @param userId 신고자 (입양자) 고유 ID
     * @param reviewId 신고할 후기 ID
     * @param reason 신고 사유
     * @param description 신고 상세 설명
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 후기
     */
    async reportReview(userId: string, reviewId: string, reason: string, description: string): Promise<any> {
        // 입양자 존재 확인
        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        // 후기 존재 확인
        const review = await this.breederReviewModel.findById(reviewId);
        if (!review) {
            throw new BadRequestException('신고할 후기를 찾을 수 없습니다.');
        }

        // 후기 신고 정보 업데이트
        review.isReported = true;
        review.reportedBy = userId as any;
        review.reportReason = reason;
        review.reportDescription = description;
        review.reportedAt = new Date();

        await review.save();

        return {
            message: '후기가 신고되었습니다. 관리자가 검토 후 처리합니다.',
        };
    }

    /**
     * 입양자가 제출한 모든 입양 신청 내역을 페이지네이션으로 조회
     *
     * @param userId 입양자 고유 ID
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 아이템 수 (기본값: 10)
     * @param animalType 동물 타입 필터 (선택사항: 'cat' 또는 'dog')
     * @returns 입양 신청 목록과 페이지네이션 정보
     * @throws BadRequestException 존재하지 않는 입양자
     */
    async getMyApplications(
        userId: string,
        page: number = 1,
        limit: number = 10,
        animalType?: 'cat' | 'dog',
    ): Promise<any> {
        // 입양자 존재 확인
        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        // animalType 필터가 있는 경우 해당 타입을 브리딩하는 브리더 ID 목록 조회
        let breederIds: string[] | undefined;
        if (animalType) {
            const breeders = await this.breederModel
                .find({
                    'profile.specialization': animalType,
                })
                .select('_id')
                .exec();
            breederIds = breeders.map((breeder: any) => breeder._id.toString());

            // 해당 동물 타입을 브리딩하는 브리더가 없는 경우 빈 결과 반환
            if (breederIds.length === 0) {
                return {
                    items: [],
                    pagination: {
                        currentPage: page,
                        pageSize: limit,
                        totalItems: 0,
                        totalPages: 0,
                        hasNextPage: false,
                        hasPrevPage: false,
                    },
                };
            }
        }

        // 쿼리 조건 구성
        const queryConditions: any = { adopterId: userId };
        if (breederIds) {
            queryConditions.breederId = { $in: breederIds };
        }

        // 전체 신청 수 조회
        const totalItems = await this.adoptionApplicationModel.countDocuments(queryConditions);

        // 페이지네이션된 신청 목록 조회
        const applications = await this.adoptionApplicationModel
            .find(queryConditions)
            .sort({ appliedAt: -1 }) // 최신순 정렬
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        // 응답 데이터 매핑
        const items = await Promise.all(
            applications.map(async (app: any) => {
                const breeder = await this.breederRepository.findById(app.breederId.toString());

                // 날짜를 "2024. 01. 15." 형식으로 변환
                const formatDate = (date: Date): string => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}. ${month}. ${day}.`;
                };

                // 브리더의 주요 동물 타입 추출 (첫 번째 specialization 사용)
                const animalType = breeder?.profile?.specialization?.[0] || 'dog';

                return {
                    applicationId: app._id.toString(),
                    breederId: app.breederId.toString(),
                    breederName: breeder?.name || '알 수 없음',
                    petId: app.petId?.toString(),
                    petName: app.petName,
                    status: app.status,
                    appliedAt: app.appliedAt.toISOString(),
                    processedAt: app.processedAt?.toISOString(),
                    // 프론트엔드 요구사항 필드 추가
                    breederLevel: (breeder?.verification?.level || 'new') as 'elite' | 'new',
                    profileImage: breeder?.profileImageFileName,
                    animalType: animalType as 'cat' | 'dog',
                    applicationDate: formatDate(app.appliedAt),
                };
            }),
        );

        // 페이지네이션 정보 계산
        const totalPages = Math.ceil(totalItems / limit);

        return new PaginationBuilder<any>()
            .setItems(items)
            .setPage(page)
            .setTake(limit)
            .setTotalCount(totalItems)
            .build();
    }

    /**
     * 입양자가 자신이 제출한 특정 입양 신청의 상세 정보 조회
     *
     * @param userId 입양자 고유 ID
     * @param applicationId 신청 ID
     * @returns 신청 상세 정보
     * @throws BadRequestException 존재하지 않는 신청 또는 권한 없음
     */
    async getApplicationDetail(userId: string, applicationId: string): Promise<any> {
        // 입양자 존재 확인
        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        // 신청 조회 (본인 신청만 조회 가능)
        const application = await this.adoptionApplicationModel.findOne({
            _id: applicationId,
            adopterId: userId,
        });

        if (!application) {
            throw new BadRequestException('해당 입양 신청을 찾을 수 없거나 조회 권한이 없습니다.');
        }

        // 브리더 정보 조회
        const breeder = await this.breederRepository.findById(application.breederId.toString());

        return {
            applicationId: (application as any)._id.toString(),
            breederId: application.breederId.toString(),
            breederName: breeder?.name || '알 수 없음',
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
     * [deleteAccount] 입양자 회원 탈퇴
     *
     * 기능:
     * - 입양자 계정을 소프트 삭제 처리
     * - 개인정보 마스킹 처리
     * - 탈퇴 사유 저장 (통계용)
     * - 작성한 후기, 신고 등은 보존 (통계 및 법적 보존 요건)
     *
     * @param userId - 입양자 고유 ID
     * @param deleteData - 탈퇴 사유 정보
     * @returns 탈퇴 처리 결과
     */
    async deleteAccount(userId: string, deleteData: AccountDeleteRequestDto): Promise<AccountDeleteResponseDto> {
        // 1. 입양자 정보 조회
        const adopter = await this.adopterRepository.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        // 2. 이미 탈퇴한 계정인지 확인
        if (adopter.accountStatus === 'deleted') {
            throw new BadRequestException('이미 탈퇴한 계정입니다.');
        }

        // 3. 기타 사유인 경우 otherReason 필수 검증
        if (deleteData.reason === 'other' && !deleteData.otherReason) {
            throw new BadRequestException('기타 사유를 입력해주세요.');
        }

        try {
            // 4. 계정 상태를 'deleted'로 변경
            adopter.accountStatus = 'deleted';

            // 5. 개인정보 마스킹 처리 (선택적)
            // adopter.emailAddress = `deleted_${(adopter as any)._id.toString()}@deleted.com`;
            // adopter.phoneNumber = null;
            // adopter.nickname = '탈퇴한 사용자';

            // 6. 탈퇴 정보 기록 (스키마에 필드 추가 시 사용)
            // adopter.deletedAt = new Date();
            // adopter.deleteReason = deleteData.reason;
            // adopter.deleteReasonDetail = deleteData.otherReason;

            // 7. 변경사항 저장
            await adopter.save();

            return {
                adopterId: (adopter as any)._id.toString(),
                deletedAt: new Date().toISOString(),
                message: '회원 탈퇴가 성공적으로 처리되었습니다.',
            };
        } catch (error) {
            throw new BadRequestException('회원 탈퇴 처리 중 오류가 발생했습니다.');
        }
    }
}
