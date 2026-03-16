import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { ApplicationStatus, ReportStatus, RecipientType } from '../../common/enum/user.enum';

import { MailService } from '../../common/mail/mail.service';
import { StorageService } from '../../common/storage/storage.service';
import { MailTemplateService } from '../../common/mail/mail-template.service';
import { NotificationService } from '../notification/notification.service';
import { DiscordWebhookService } from '../../common/discord/discord-webhook.service';

import { NotificationType } from '../../schema/notification.schema';
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
import { AccountDeleteRequestDto } from './dto/request/account-delete-request.dto';
import { ApplicationCreateRequestDto } from './dto/request/application-create-request.dto';
import { PaginationBuilder } from '../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { AccountDeleteResponseDto } from './dto/response/account-delete-response.dto';
import { AdopterProfileResponseDto } from './dto/response/adopter-profile-response.dto';

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
    private readonly logger = new Logger(AdopterService.name);

    constructor(
        private storageService: StorageService,
        private mailService: MailService,
        private mailTemplateService: MailTemplateService,
        private notificationService: NotificationService,
        private discordWebhookService: DiscordWebhookService,
        private adopterRepository: AdopterRepository,
        private breederRepository: BreederRepository,
        private availablePetManagementRepository: AvailablePetManagementRepository,

        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        @InjectModel(BreederReview.name) private breederReviewModel: Model<BreederReviewDocument>,
        @InjectModel(AdoptionApplication.name) private adoptionApplicationModel: Model<AdoptionApplicationDocument>,
    ) {}

    /**
     * 입양 신청서 제출 처리
     *
     * 별도 컬렉션(adoption_applications)에 신청 정보를 저장합니다.
     * 입양자와 브리더 양쪽에서 이 컬렉션을 참조합니다.
     *
     * 비즈니스 규칙:
     * - 입양자 또는 브리더 계정 상태 확인 필수
     * - 브리더 존재 여부 검증
     * - 반려동물 ID는 선택사항 (특정 개체 또는 전체 상담)
     * - 개인정보 수집 동의 필수
     * - 중복 신청 방지 검증 (같은 브리더에게 대기 중인 신청이 있는 경우)
     *
     * @param userId 신청자 고유 ID (JWT에서 추출)
     * @param dto 입양 신청 데이터 (Figma 디자인 기반 필드)
     * @param userRole 사용자 역할 ('adopter' | 'breeder')
     * @returns 생성된 신청서 정보
     * @throws BadRequestException 잘못된 요청 데이터
     * @throws ConflictException 중복 신청 시도
     */
    async createApplication(userId: string, dto: ApplicationCreateRequestDto, userRole?: string): Promise<any> {
        // 1. 신청자 계정 존재 및 상태 검증 (입양자 또는 브리더)
        let applicant: any;

        if (userRole === 'breeder') {
            applicant = await this.breederRepository.findById(userId);
            if (!applicant) {
                throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
            }
        } else {
            applicant = await this.adopterRepository.findById(userId);
            if (!applicant) {
                throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
            }
        }

        // 1-1. 프론트엔드 폼에서 입력한 이름, 이메일, 전화번호 사용 (DB 값이 아닌 사용자가 직접 입력한 값)
        const applicantName = dto.name;
        const applicantEmail = dto.email;
        const applicantPhone = dto.phone;

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
        // TODO: 프론트엔드에서 커스텀 질문 기능 구현 후 주석 해제
        const customQuestions = breeder.applicationForm || [];
        // const customResponsesMap = new Map((dto.customResponses || []).map((r) => [r.questionId, r.answer]));

        // for (const question of customQuestions) {
        //     if (question.required) {
        //         const answer = customResponsesMap.get(question.id);
        //         if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
        //             throw new BadRequestException(`필수 질문에 답변해주세요: ${question.label}`);
        //         }
        //     }
        // }

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

            // answer 필드가 실제로 전달되었는지 확인
            if (response.answer === undefined || response.answer === null) {
                throw new BadRequestException(
                    `질문 "${question.label}"에 대한 답변이 필요합니다. (questionId: ${response.questionId})`,
                );
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
            adopterName: applicantName,
            adopterEmail: applicantEmail,
            adopterPhone: applicantPhone,
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

        // 9. 신청자에게 상담 신청 확인 알림 및 이메일 발송
        // breeder.name이 빈 값일 경우를 대비하여 기본값 설정
        const breederDisplayName = breeder.name || breeder.nickname || '브리더';
        await this.sendApplicationConfirmationNotification(
            userId,
            userRole || 'adopter',
            applicantName,
            applicantEmail,
            breederDisplayName,
        );

        // 10. 응답 데이터 구성 (Mapper 패턴 사용)
        return AdopterMapper.toApplicationCreateResponse(savedApplication, breederDisplayName, pet?.name);
    }

    /**
     * 새 상담 신청 알림 및 이메일 발송 (브리더용)
     * @private
     */
    private async sendNewApplicationNotification(breeder: any): Promise<void> {
        const breederId = breeder._id.toString();
        const emailContent = breeder.emailAddress
            ? this.mailTemplateService.getNewApplicationEmail(breeder.name)
            : null;

        const builder = this.notificationService
            .to(breederId, RecipientType.BREEDER)
            .type(NotificationType.NEW_CONSULT_REQUEST)
            .title('💬 새로운 입양 상담 신청이 도착했어요!')
            .content('지금 확인해보세요.')
            .related('/application', 'page');

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
     * 상담 신청 확인 알림 및 이메일 발송 (신청자용)
     * @private
     */
    private async sendApplicationConfirmationNotification(
        applicantId: string,
        applicantRole: string,
        applicantName: string,
        applicantEmail: string,
        breederName: string,
    ): Promise<void> {
        const emailContent = applicantEmail
            ? this.mailTemplateService.getApplicationConfirmationEmail(applicantName, breederName)
            : null;

        const recipientType = applicantRole === 'breeder' ? RecipientType.BREEDER : RecipientType.ADOPTER;

        const builder = this.notificationService
            .to(applicantId, recipientType)
            .type(NotificationType.CONSULT_REQUEST_CONFIRMED)
            .title('✅ 상담 신청이 접수되었습니다!')
            .content(`${breederName}님이 확인 후 연락드릴 예정입니다.`)
            .metadata({ breederName })
            .related(applicantId, 'applications');

        if (emailContent && applicantEmail) {
            builder.withEmail({
                to: applicantEmail,
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
     * - 본인 신청에 대해서만 후기 작성 가능
     * - 동일 신청에 대해 여러 후기 작성 가능 (제한 없음)
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
     * 새 후기 등록 알림 및 이메일 발송 (브리더용)
     * @private
     */
    private async sendNewReviewNotification(breederId: string): Promise<void> {
        // 브리더 정보 조회
        const breeder = await this.breederRepository.findById(breederId);
        if (!breeder) {
            return; // 브리더를 찾을 수 없으면 알림 발송 중단
        }

        const emailContent = breeder.emailAddress ? this.mailTemplateService.getNewReviewEmail(breeder.name) : null;

        const builder = this.notificationService
            .to(breederId, RecipientType.BREEDER)
            .type(NotificationType.NEW_REVIEW_REGISTERED)
            .title('⭐ 새로운 후기가 등록되었어요!')
            .content('브리더 프로필에서 후기를 확인해보세요.')
            .related(`/explore/breeder/${breederId}#reviews`, 'profile')
            .metadata({ breederId });

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
     * 즐겨찾기 브리더 추가
     * 브리더 기본 정보를 캐시하여 빠른 조회 지원
     * 입양자 및 브리더 모두 사용 가능
     *
     * 비즈니스 규칙:
     * - 중복 즐겨찾기 방지
     * - 브리더 기본 정보 스냅샷 저장
     * - 실시간 브리더 정보 반영
     *
     * @param userId 사용자 고유 ID (입양자 또는 브리더)
     * @param addFavoriteDto 즐겨찾기 추가 데이터
     * @param userRole 사용자 역할 ('adopter' | 'breeder')
     * @returns 성공 메시지
     * @throws ConflictException 이미 즐겨찾기된 브리더
     */
    async addFavorite(userId: string, addFavoriteDto: FavoriteAddRequestDto, userRole?: string): Promise<any> {
        const { breederId } = addFavoriteDto;

        // 역할에 따라 적절한 사용자 조회
        let user: any;
        if (userRole === 'breeder') {
            user = await this.breederRepository.findById(userId);
            if (!user) {
                throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
            }
        } else {
            user = await this.adopterRepository.findById(userId);
            if (!user) {
                throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
            }
        }

        const targetBreeder = await this.breederRepository.findById(breederId);
        if (!targetBreeder) {
            throw new BadRequestException('해당 브리더를 찾을 수 없습니다.');
        }

        // 중복 즐겨찾기 검증
        const favoriteList = user.favoriteBreederList || [];
        const existingFavorite = favoriteList.find((fav: any) => fav.favoriteBreederId === breederId);
        if (existingFavorite) {
            throw new ConflictException('이미 즐겨찾기에 추가된 브리더입니다.');
        }

        // 즐겨찾기 데이터 구성 (Mapper 패턴 사용)
        const favorite = AdopterMapper.toFavoriteBreeder(breederId, targetBreeder);

        // 역할에 따라 적절한 레포지토리 사용
        if (userRole === 'breeder') {
            console.log('[AdopterService.addFavorite] Adding favorite for breeder:', userId);
            console.log('[AdopterService.addFavorite] favorite data:', JSON.stringify(favorite));
            const result = await this.breederModel
                .findByIdAndUpdate(
                    userId,
                    {
                        $push: { favoriteBreederList: favorite },
                        $set: { updatedAt: new Date() },
                    },
                    { new: true },
                )
                .exec();
            console.log(
                '[AdopterService.addFavorite] Updated breeder favoriteBreederList:',
                JSON.stringify(result?.favoriteBreederList),
            );
        } else {
            await this.adopterRepository.addFavoriteBreeder(userId, favorite);
        }

        return { message: '브리더를 즐겨찾기에 추가했습니다.' };
    }

    /**
     * 즐겨찾기 브리더 제거
     * 입양자 및 브리더 모두 사용 가능
     *
     * @param userId 사용자 고유 ID (입양자 또는 브리더)
     * @param breederId 제거할 브리더 ID
     * @param userRole 사용자 역할 ('adopter' | 'breeder')
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 즐겨찾기
     */
    async removeFavorite(userId: string, breederId: string, userRole?: string): Promise<any> {
        // 역할에 따라 적절한 사용자 조회
        let user: any;
        if (userRole === 'breeder') {
            user = await this.breederRepository.findById(userId);
            if (!user) {
                throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
            }
        } else {
            user = await this.adopterRepository.findById(userId);
            if (!user) {
                throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
            }
        }

        // 즐겨찾기 존재 여부 확인
        const favoriteList = user.favoriteBreederList || [];
        const existingFavorite = favoriteList.find((fav: any) => fav.favoriteBreederId === breederId);
        if (!existingFavorite) {
            throw new BadRequestException('즐겨찾기 목록에서 해당 브리더를 찾을 수 없습니다.');
        }

        // 역할에 따라 적절한 레포지토리 사용
        if (userRole === 'breeder') {
            await this.breederModel
                .findByIdAndUpdate(userId, {
                    $pull: { favoriteBreederList: { favoriteBreederId: breederId } },
                    $set: { updatedAt: new Date() },
                })
                .exec();
        } else {
            await this.adopterRepository.removeFavoriteBreeder(userId, breederId);
        }

        return { message: '즐겨찾기에서 브리더를 제거했습니다.' };
    }

    /**
     * 즐겨찾기 브리더 목록 조회
     * 페이지네이션을 지원하며, 브리더의 최신 정보와 함께 반환
     * 입양자 및 브리더 모두 사용 가능
     *
     * @param userId 사용자 고유 ID (입양자 또는 브리더)
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 항목 수 (기본값: 10)
     * @param userRole 사용자 역할 ('adopter' | 'breeder')
     * @returns 즐겨찾기 브리더 목록과 페이지네이션 정보
     * @throws BadRequestException 존재하지 않는 사용자
     */
    async getFavoriteList(userId: string, page: number = 1, limit: number = 10, userRole?: string): Promise<any> {
        let favorites: any[];
        let total: number;

        if (userRole === 'breeder') {
            const breeder = await this.breederRepository.findById(userId);
            if (!breeder) {
                throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
            }

            // 브리더의 즐겨찾기 목록에서 페이지네이션 적용
            const allFavorites = breeder.favoriteBreederList || [];
            total = allFavorites.length;
            const startIndex = (page - 1) * limit;
            favorites = allFavorites.slice(startIndex, startIndex + limit);
        } else {
            const adopter = await this.adopterRepository.findById(userId);
            if (!adopter) {
                throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
            }

            const result = await this.adopterRepository.findFavoriteList(userId, page, limit);
            favorites = result.favorites;
            total = result.total;
        }

        // 각 즐겨찾기 브리더의 최신 정보 조회 (Mapper 패턴 사용)
        const favoriteListWithDetails = await Promise.all(
            favorites.map(async (fav: any) => {
                try {
                    const breeder = await this.breederRepository.findById(fav.favoriteBreederId);

                    // 브리더 프로필 이미지 Signed URL 생성
                    let profileImageUrl = '';
                    if (breeder?.profileImageFileName) {
                        profileImageUrl = this.storageService.generateSignedUrl(breeder.profileImageFileName);
                    }

                    // 대표 사진들 Signed URL 생성
                    const representativePhotos = breeder?.profile?.representativePhotos
                        ? this.storageService.generateSignedUrls(breeder.profile.representativePhotos)
                        : [];

                    return AdopterMapper.toFavoriteDetail(fav, breeder, profileImageUrl, representativePhotos);
                } catch (error) {
                    // 에러 발생 시 기본 정보 반환
                    return AdopterMapper.toFavoriteDetail(fav, null, '', []);
                }
            }),
        );

        return new PaginationBuilder<any>()
            .setItems(favoriteListWithDetails)
            .setPage(page)
            .setLimit(limit)
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
        const { breederId, type, reason, description } = createReportDto;

        // 기타(other) 사유 선택 시 description 필수 검증
        if (reason === 'other' && (!description || description.trim() === '')) {
            throw new BadRequestException('기타 사유를 선택한 경우 상세 내용을 입력해주세요.');
        }

        // 신고자 정보 조회 (입양자 또는 브리더)
        let reporterNickname = '';
        const adopter = await this.adopterRepository.findById(userId);
        if (adopter) {
            reporterNickname = adopter.nickname;
        } else {
            const reporterBreeder = await this.breederRepository.findById(userId);
            if (reporterBreeder) {
                reporterNickname = reporterBreeder.name;
            } else {
                throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
            }
        }

        const breeder = await this.breederRepository.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('신고할 브리더를 찾을 수 없습니다.');
        }

        const reportId = randomUUID();

        // 신고 데이터 구성 (Mapper 패턴 사용)
        // reason을 type으로 매핑 (reason이 실제 신고 사유)
        const report = AdopterMapper.toReport(
            reportId,
            userId,
            reporterNickname,
            reason,
            description || '',
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
            .setLimit(limit)
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
    async reportReview(userId: string, reviewId: string, reason: string, description?: string): Promise<any> {
        // 신고자 존재 확인 (입양자 또는 브리더)
        const adopter = await this.adopterRepository.findById(userId);
        const breeder = await this.breederRepository.findById(userId);

        if (!adopter && !breeder) {
            throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
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
        review.reportDescription = description || '';
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

                // adopterId 처리 (ObjectId이거나 populate된 객체일 수 있음)
                const adopterIdValue =
                    app.adopterId && typeof app.adopterId === 'object' && app.adopterId._id
                        ? app.adopterId._id.toString()
                        : app.adopterId
                          ? app.adopterId.toString()
                          : null;

                return {
                    applicationId: app._id.toString(),
                    breederId: app.breederId.toString(),
                    adopterId: adopterIdValue,
                    breederName: breeder?.nickname || breeder?.name || '알 수 없음',
                    petId: app.petId?.toString(),
                    petName: app.petName,
                    status: app.status,
                    appliedAt: app.appliedAt.toISOString(),
                    processedAt: app.processedAt?.toISOString(),
                    // 프론트엔드 요구사항 필드 추가
                    breederLevel: (breeder?.verification?.level || 'new') as 'elite' | 'new',
                    profileImage: breeder?.profileImageFileName
                        ? this.storageService.generateSignedUrlSafe(breeder.profileImageFileName, 60)
                        : null,
                    animalType: animalType as 'cat' | 'dog',
                    applicationDate: formatDate(app.appliedAt),
                    customResponses: app.customResponses || [],
                };
            }),
        );

        // 페이지네이션 정보 계산
        const totalPages = Math.ceil(totalItems / limit);

        return new PaginationBuilder<any>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
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
            // 4. 계정 상태를 'deleted'로 변경하고 탈퇴 정보 저장
            const deletedAt = new Date();
            await this.adopterRepository.updateProfile(userId, {
                accountStatus: 'deleted',
                deletedAt: deletedAt,
                deleteReason: deleteData.reason,
                deleteReasonDetail: deleteData.otherReason || null,
                updatedAt: deletedAt,
            });

            // 5. Discord 탈퇴 알림 전송
            await this.discordWebhookService.notifyUserWithdrawal({
                userId: userId,
                userType: 'adopter',
                email: adopter.emailAddress,
                name: adopter.nickname || '알 수 없음',
                nickname: adopter.nickname,
                reason: deleteData.reason,
                reasonDetail: deleteData.otherReason || undefined,
                deletedAt: deletedAt,
            });

            return {
                adopterId: userId,
                deletedAt: deletedAt.toISOString(),
                message: '회원 탈퇴가 성공적으로 처리되었습니다.',
            };
        } catch (error) {
            throw new BadRequestException('회원 탈퇴 처리 중 오류가 발생했습니다.');
        }
    }
}
