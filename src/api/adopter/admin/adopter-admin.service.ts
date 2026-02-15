import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';

import { AdminAction, AdminTargetType, ApplicationStatus } from '../../../common/enum/user.enum';

import { Admin, AdminDocument } from '../../../schema/admin.schema';
import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { BreederReview, BreederReviewDocument } from '../../../schema/breeder-review.schema';
import { AdoptionApplication, AdoptionApplicationDocument } from '../../../schema/adoption-application.schema';

import { ApplicationListRequestDto } from './dto/request/application-list-request.dto';
import {
    AdminApplicationListResponseDto,
    AdminApplicationListItemDto,
} from './dto/response/application-list-response.dto';
import { AdminApplicationDetailResponseDto } from './dto/response/application-detail-response.dto';

/**
 * 입양자 관리 Admin 서비스
 *
 * 입양자 도메인에 대한 관리자 기능을 제공합니다:
 * - 후기 신고 관리
 * - 부적절한 후기 삭제
 * - 입양 신청 모니터링
 */
@Injectable()
export class AdopterAdminService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(Adopter.name) private adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        @InjectModel(BreederReview.name) private breederReviewModel: Model<BreederReviewDocument>,
        @InjectModel(AdoptionApplication.name) private adoptionApplicationModel: Model<AdoptionApplicationDocument>,
    ) {}

    /**
     * 관리자 활동 로그 기록
     * @private
     */
    private async logAdminActivity(
        adminId: string,
        action: AdminAction,
        targetType: AdminTargetType,
        targetId: string,
        targetName?: string,
        description?: string,
    ): Promise<void> {
        const admin = await this.adminModel.findById(adminId);
        if (admin) {
            const logEntry = {
                logId: randomUUID(),
                action,
                targetType,
                targetId,
                targetName,
                description: description || `${action} performed on ${targetType} ${targetName || targetId}`,
                performedAt: new Date(),
            };
            admin.activityLogs.push(logEntry);
            await admin.save();
        }
    }

    /**
     * 후기 신고 목록 조회
     *
     * 신고된 후기 목록을 페이지네이션과 함께 조회합니다.
     * BreederReview 컬렉션에서 isReported가 true인 후기들을 조회합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param pageStr 페이지 번호 (문자열)
     * @param limitStr 페이지당 항목 수 (문자열)
     * @returns 신고된 후기 목록과 페이지네이션 정보
     * @throws ForbiddenException 권한 없음
     */
    async getReviewReports(adminId: string, pageStr: string = '1', limitStr: string = '10'): Promise<any> {
        const page = parseInt(pageStr, 10) || 1;
        const limit = parseInt(limitStr, 10) || 10;
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageReports) {
            throw new ForbiddenException('Access denied');
        }

        const skip = (page - 1) * limit;

        // BreederReview 컬렉션에서 신고된 후기 조회
        const [reviews, total] = await Promise.all([
            this.breederReviewModel
                .find({ isReported: true })
                .sort({ reportedAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('breederId', 'name')
                .populate('adopterId', 'nickname')
                .lean(),
            this.breederReviewModel.countDocuments({ isReported: true }),
        ]);

        // 신고자 정보를 Adopter와 Breeder 모두에서 조회
        const formattedReviews = await Promise.all(
            reviews.map(async (review: any) => {
                let reporterName = 'Unknown';

                if (review.reportedBy) {
                    const reporterId = review.reportedBy.toString();

                    // Adopter에서 먼저 조회
                    const adopter = await this.adopterModel.findById(reporterId).select('nickname').lean();
                    if (adopter) {
                        reporterName = adopter.nickname;
                    } else {
                        // Adopter에 없으면 Breeder에서 조회
                        const breeder = await this.breederModel.findById(reporterId).select('name').lean();
                        if (breeder) {
                            reporterName = breeder.name;
                        }
                    }
                }

                return {
                    reviewId: review._id.toString(),
                    breederId: review.breederId?._id?.toString(),
                    breederName: review.breederId?.name || 'Unknown',
                    authorId: review.adopterId?._id?.toString(),
                    authorName: review.adopterId?.nickname || 'Unknown',
                    reportedBy: review.reportedBy?.toString(),
                    reporterName,
                    reportReason: review.reportReason,
                    reportDescription: review.reportDescription,
                    reportedAt: review.reportedAt,
                    content: review.content,
                    writtenAt: review.writtenAt,
                    isVisible: review.isVisible,
                };
            }),
        );

        return {
            items: formattedReviews,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
            },
        };
    }

    /**
     * 부적절한 후기 삭제
     *
     * 신고된 부적절한 후기를 삭제합니다 (isVisible = false로 설정).
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @param reviewId 후기 고유 ID
     * @returns 삭제 결과
     * @throws ForbiddenException 권한 없음
     * @throws BadRequestException 후기를 찾을 수 없음
     */
    async deleteReview(adminId: string, breederId: string, reviewId: string): Promise<any> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageReports) {
            throw new ForbiddenException('Access denied');
        }

        const review = await this.breederReviewModel.findOne({
            _id: reviewId,
            breederId: breederId,
        });

        if (!review) {
            throw new BadRequestException('후기를 찾을 수 없습니다.');
        }

        review.isVisible = false;
        await review.save();

        // BreederReview 컬렉션만 업데이트 (참조 방식)

        // 브리더 정보 조회
        const breeder = await this.breederModel.findById(breederId);

        await this.logAdminActivity(
            adminId,
            AdminAction.DELETE_REVIEW,
            AdminTargetType.REVIEW,
            reviewId,
            `Review for ${breeder?.name || 'Unknown'}`,
            'Review deleted due to violation',
        );

        return { message: 'Review deleted successfully' };
    }

    /**
     * 입양 신청 리스트 조회 (플랫폼 어드민용)
     *
     * 전체 입양 신청 내역을 조회합니다.
     * 상태별 필터링, 브리더 이름 검색, 날짜 범위 필터링을 지원합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param filters 필터 조건 (page, limit, status, breederName, startDate, endDate)
     * @returns 입양 신청 목록 및 상태별 통계
     */
    async getApplicationList(
        adminId: string,
        filters: ApplicationListRequestDto,
    ): Promise<AdminApplicationListResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canViewStatistics) {
            throw new ForbiddenException('통계 조회 권한이 없습니다.');
        }

        const { page = 1, limit = 10, status, breederName, startDate, endDate } = filters;

        // 쿼리 조건 생성
        const query: any = {};
        if (status) {
            query.status = status;
        }

        // 브리더 이름으로 검색
        if (breederName) {
            const breeders = await this.breederModel
                .find({ name: { $regex: breederName, $options: 'i' } })
                .select('_id')
                .lean();

            if (breeders.length === 0) {
                // 검색 결과가 없으면 빈 결과 반환
                return {
                    applications: [],
                    totalCount: 0,
                    pendingCount: 0,
                    completedCount: 0,
                    approvedCount: 0,
                    rejectedCount: 0,
                    currentPage: page,
                    pageSize: limit,
                    totalPages: 0,
                };
            }

            query.breederId = { $in: breeders.map((b) => b._id) };
        }

        if (startDate || endDate) {
            query.appliedAt = {};
            if (startDate) {
                query.appliedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                query.appliedAt.$lte = endDateTime;
            }
        }

        // 전체 건수 조회
        const totalCount = await this.adoptionApplicationModel.countDocuments(query);

        // 상태별 통계 (필터 적용된 범위 내에서)
        const [pendingCount, completedCount, approvedCount, rejectedCount] = await Promise.all([
            this.adoptionApplicationModel.countDocuments({
                ...query,
                status: ApplicationStatus.CONSULTATION_PENDING,
            }),
            this.adoptionApplicationModel.countDocuments({
                ...query,
                status: ApplicationStatus.CONSULTATION_COMPLETED,
            }),
            this.adoptionApplicationModel.countDocuments({
                ...query,
                status: ApplicationStatus.ADOPTION_APPROVED,
            }),
            this.adoptionApplicationModel.countDocuments({
                ...query,
                status: ApplicationStatus.ADOPTION_REJECTED,
            }),
        ]);

        // 페이지네이션된 데이터 조회
        const applications = await this.adoptionApplicationModel
            .find(query)
            .sort({ appliedAt: -1 }) // 최신순
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('breederId', 'name') // 브리더 이름 조인
            .lean()
            .exec();

        // 응답 DTO 매핑 (삭제된 브리더 참조 시 null 방어)
        const applicationItems: AdminApplicationListItemDto[] = applications.map((app) => {
            const breeder = app.breederId as any;
            return {
                applicationId: app._id.toString(),
                adopterName: app.adopterName,
                adopterEmail: app.adopterEmail,
                adopterPhone: app.adopterPhone,
                breederId: breeder?._id ? breeder._id.toString() : breeder ? breeder.toString() : '',
                breederName: breeder?.name || '알 수 없음',
                petName: app.petName,
                status: app.status as ApplicationStatus,
                appliedAt: app.appliedAt,
                processedAt: app.processedAt,
            };
        });

        return {
            applications: applicationItems,
            totalCount,
            pendingCount,
            completedCount,
            approvedCount,
            rejectedCount,
            currentPage: page,
            pageSize: limit,
            totalPages: Math.ceil(totalCount / limit),
        };
    }

    /**
     * 입양 신청 상세 조회 (플랫폼 어드민용)
     *
     * 특정 입양 신청의 상세 정보를 조회합니다.
     * 표준 신청 응답, 커스텀 질문 응답, 브리더 메모 등 전체 정보를 제공합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param applicationId 입양 신청 고유 ID
     * @returns 입양 신청 상세 정보
     */
    async getApplicationDetail(adminId: string, applicationId: string): Promise<AdminApplicationDetailResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canViewStatistics) {
            throw new ForbiddenException('통계 조회 권한이 없습니다.');
        }

        // ObjectId 형식 검증
        if (!Types.ObjectId.isValid(applicationId)) {
            throw new BadRequestException('올바르지 않은 신청 ID 형식입니다.');
        }

        const application = await this.adoptionApplicationModel
            .findById(applicationId)
            .populate('breederId', 'name')
            .lean()
            .exec();

        if (!application) {
            throw new BadRequestException('해당 입양 신청을 찾을 수 없습니다.');
        }

        // 삭제된 브리더 참조 시 null 방어
        const breeder = application.breederId as any;

        return {
            applicationId: application._id.toString(),
            adopterName: application.adopterName,
            adopterEmail: application.adopterEmail,
            adopterPhone: application.adopterPhone,
            breederId: breeder?._id ? breeder._id.toString() : breeder ? breeder.toString() : '',
            breederName: breeder?.name || '알 수 없음',
            petName: application.petName,
            status: application.status as ApplicationStatus,
            standardResponses: application.standardResponses,
            customResponses: application.customResponses || [],
            appliedAt: application.appliedAt,
            processedAt: application.processedAt,
            breederNotes: application.breederNotes,
        };
    }
}
