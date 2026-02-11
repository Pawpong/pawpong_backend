import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { VerificationStatus, UserStatus, ApplicationStatus } from '../../../common/enum/user.enum';

import { Admin, AdminDocument } from '../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { SystemStats, SystemStatsDocument } from '../../../schema/system-stats.schema';
import { AdoptionApplication, AdoptionApplicationDocument } from '../../../schema/adoption-application.schema';
import { PhoneWhitelist, PhoneWhitelistDocument } from '../../../schema/phone-whitelist.schema';

import { StatsFilterRequestDto } from './dto/request/stats-filter-request.dto';
import { ApplicationListRequestDto } from './dto/request/application-list-request.dto';
import { AdminStatsResponseDto } from './dto/response/admin-stats-response.dto';
import { MvpStatsResponseDto } from './dto/response/mvp-stats-response.dto';
import { ApplicationListResponseDto, ApplicationListItemDto } from './dto/response/application-list-response.dto';
import { AddPhoneWhitelistRequestDto, UpdatePhoneWhitelistRequestDto } from './dto/request/phone-whitelist-request.dto';
import { PhoneWhitelistResponseDto, PhoneWhitelistListResponseDto } from './dto/response/phone-whitelist-response.dto';

/**
 * 플랫폼 Admin 서비스
 *
 * 플랫폼 전체 통계 관련 관리자 기능을 제공합니다:
 * - 플랫폼 통계 조회
 * - 사용자 통계
 * - 입양 신청 통계
 * - 인기 품종 통계
 * - 지역별 통계
 * - 브리더 성과 랭킹
 * - 신고 통계
 */
@Injectable()
export class PlatformAdminService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        @InjectModel(Adopter.name) private adopterModel: Model<AdopterDocument>,
        @InjectModel(SystemStats.name) private systemStatsModel: Model<SystemStatsDocument>,
        @InjectModel(AdoptionApplication.name) private adoptionApplicationModel: Model<AdoptionApplicationDocument>,
        @InjectModel(PhoneWhitelist.name) private phoneWhitelistModel: Model<PhoneWhitelistDocument>,
    ) {}

    /**
     * 플랫폼 통계 조회
     *
     * 전체 플랫폼의 통계 정보를 조회합니다:
     * - 사용자 통계 (입양자/브리더)
     * - 입양 신청 통계
     * - 인기 품종 통계
     * - 지역별 통계
     * - 브리더 성과 랭킹
     * - 신고 통계
     *
     * @param adminId 관리자 고유 ID
     * @param filter 통계 필터 (날짜 범위, 유형 등)
     * @returns 플랫폼 통계
     */
    async getStats(adminId: string, filter: StatsFilterRequestDto): Promise<AdminStatsResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canViewStatistics) {
            throw new ForbiddenException('Access denied');
        }

        const { statsType, startDate, endDate } = filter;

        // For now, return aggregated stats. In production, you'd use SystemStats collection
        const [adoptersTotal, breedersTotal, breedersApproved, breedersPending] = await Promise.all([
            this.adopterModel.countDocuments({ accountStatus: UserStatus.ACTIVE }),
            this.breederModel.countDocuments({ accountStatus: UserStatus.ACTIVE }),
            this.breederModel.countDocuments({ 'verification.status': VerificationStatus.APPROVED }),
            this.breederModel.countDocuments({ 'verification.status': VerificationStatus.PENDING }),
        ]);

        // Get application stats through aggregation
        const applicationStats = await this.breederModel.aggregate([
            { $unwind: '$receivedApplications' },
            {
                $group: {
                    _id: '$receivedApplications.status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const totalApplications = applicationStats.reduce((sum, stat) => sum + stat.count, 0);
        const pendingApplications =
            applicationStats.find((s) => s._id === ApplicationStatus.CONSULTATION_PENDING)?.count || 0;
        const completedAdoptions =
            applicationStats.find((s) => s._id === ApplicationStatus.ADOPTION_APPROVED)?.count || 0;
        const rejectedApplications =
            applicationStats.find((s) => s._id === ApplicationStatus.ADOPTION_REJECTED)?.count || 0;

        // Get popular breeds
        const popularBreeds = await this.breederModel.aggregate([
            { $unwind: '$availablePets' },
            {
                $group: {
                    _id: { breed: '$availablePets.breed', type: '$availablePets.type' },
                    applicationCount: { $sum: 1 },
                    averagePrice: { $avg: '$availablePets.price' },
                },
            },
            { $sort: { applicationCount: -1 } },
            { $limit: 10 },
        ]);

        // Get regional stats
        const regionalStats = await this.breederModel.aggregate([
            {
                $group: {
                    _id: { city: '$profile.location.city', district: '$profile.location.district' },
                    breederCount: { $sum: 1 },
                    applicationCount: { $sum: '$stats.totalApplications' },
                    completedAdoptionCount: { $sum: '$stats.completedAdoptions' },
                },
            },
            { $sort: { breederCount: -1 } },
            { $limit: 10 },
        ]);

        // Get breeder performance
        const breederPerformance = await this.breederModel.aggregate([
            {
                $project: {
                    breederId: '$_id',
                    breederName: '$name',
                    city: '$profile.location.city',
                    applicationCount: '$stats.totalApplications',
                    completedAdoptionCount: '$stats.completedAdoptions',
                    averageRating: '$stats.averageRating',
                    totalReviews: '$stats.totalReviews',
                    profileViews: '$stats.profileViews',
                },
            },
            { $sort: { applicationCount: -1 } },
            { $limit: 10 },
        ]);

        // Get report stats
        const reportStats = await this.breederModel.aggregate([
            { $unwind: '$reports' },
            {
                $group: {
                    _id: '$reports.status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const totalReports = reportStats.reduce((sum, stat) => sum + stat.count, 0);
        const pendingReports = reportStats.find((s) => s._id === 'pending')?.count || 0;
        const resolvedReports = reportStats.find((s) => s._id === 'resolved')?.count || 0;
        const dismissedReports = reportStats.find((s) => s._id === 'dismissed')?.count || 0;

        return {
            userStatistics: {
                totalAdopterCount: adoptersTotal,
                newAdopterCount: 0, // Would need date filtering
                activeAdopterCount: adoptersTotal,
                totalBreederCount: breedersTotal,
                newBreederCount: 0, // Would need date filtering
                approvedBreederCount: breedersApproved,
                pendingBreederCount: breedersPending,
            },
            adoptionStatistics: {
                totalApplicationCount: totalApplications,
                newApplicationCount: 0, // Would need date filtering
                completedAdoptionCount: completedAdoptions,
                pendingApplicationCount: pendingApplications,
                rejectedApplicationCount: rejectedApplications,
            },
            popularBreeds: popularBreeds.map((breed) => ({
                breedName: breed._id.breed,
                petType: breed._id.type,
                applicationCount: breed.applicationCount,
                completedAdoptionCount: 0,
                averagePrice: breed.averagePrice || 0,
            })),
            regionalStatistics: regionalStats.map((region) => ({
                cityName: region._id.city || 'Unknown',
                districtName: region._id.district || 'Unknown',
                breederCount: region.breederCount,
                applicationCount: region.applicationCount || 0,
                completedAdoptionCount: region.completedAdoptionCount || 0,
            })),
            breederPerformanceRanking: breederPerformance.map((breeder) => ({
                breederId: breeder.breederId.toString(),
                breederName: breeder.breederName,
                cityName: breeder.city || 'Unknown',
                applicationCount: breeder.applicationCount || 0,
                completedAdoptionCount: breeder.completedAdoptionCount || 0,
                averageRating: breeder.averageRating || 0,
                totalReviewCount: breeder.totalReviews || 0,
                profileViewCount: breeder.profileViews || 0,
            })),
            reportStatistics: {
                totalReportCount: totalReports,
                newReportCount: 0, // Would need date filtering
                resolvedReportCount: resolvedReports,
                pendingReportCount: pendingReports,
                dismissedReportCount: dismissedReports,
            },
        };
    }

    /**
     * MVP 통계 조회
     *
     * MVP 단계에서 필요한 핵심 통계 정보를 조회합니다:
     * - 최근 7/14/28일간 활성 사용자 통계
     * - 최근 7/14/28일간 상담/입양 신청 통계
     * - 필터 사용 통계 (지역/품종)
     * - 브리더 서류 재제출 비율
     *
     * @param adminId 관리자 고유 ID
     * @returns MVP 통계
     */
    async getMvpStats(adminId: string): Promise<MvpStatsResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canViewStatistics) {
            throw new ForbiddenException('통계 조회 권한이 없습니다.');
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

        // 1. 활성 사용자 통계 (최근 로그인 기준)
        const [adopters7Days, adopters14Days, adopters28Days, breeders7Days, breeders14Days, breeders28Days] =
            await Promise.all([
                this.adopterModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: sevenDaysAgo },
                }),
                this.adopterModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: fourteenDaysAgo },
                }),
                this.adopterModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: twentyEightDaysAgo },
                }),
                this.breederModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: sevenDaysAgo },
                }),
                this.breederModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: fourteenDaysAgo },
                }),
                this.breederModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: twentyEightDaysAgo },
                }),
            ]);

        // 2. 상담/입양 신청 통계 (AdoptionApplication 컬렉션 사용)
        // - 상담 신청 현황: 모든 신청 건수 (포퐁에서는 모든 신청이 상담 신청으로 시작)
        // - 입양 신청 현황: 입양 승인된 건수 (status가 'adoption_approved')
        const [
            consultations7Days,
            consultations14Days,
            consultations28Days,
            adoptions7Days,
            adoptions14Days,
            adoptions28Days,
        ] = await Promise.all([
            // 상담 신청 = 전체 신청 건수 (appliedAt 기준)
            this.adoptionApplicationModel.countDocuments({
                appliedAt: { $gte: sevenDaysAgo },
            }),
            this.adoptionApplicationModel.countDocuments({
                appliedAt: { $gte: fourteenDaysAgo },
            }),
            this.adoptionApplicationModel.countDocuments({
                appliedAt: { $gte: twentyEightDaysAgo },
            }),
            // 입양 완료 = 입양 승인된 건수 (processedAt 기준)
            this.adoptionApplicationModel.countDocuments({
                status: ApplicationStatus.ADOPTION_APPROVED,
                processedAt: { $gte: sevenDaysAgo },
            }),
            this.adoptionApplicationModel.countDocuments({
                status: ApplicationStatus.ADOPTION_APPROVED,
                processedAt: { $gte: fourteenDaysAgo },
            }),
            this.adoptionApplicationModel.countDocuments({
                status: ApplicationStatus.ADOPTION_APPROVED,
                processedAt: { $gte: twentyEightDaysAgo },
            }),
        ]);

        // 3. 필터 사용 통계 - 브리더 프로필에서 집계
        // 지역별 브리더 분포 (가장 많이 검색될 가능성이 높은 지역)
        const topLocations = await this.breederModel.aggregate([
            {
                $match: {
                    'verification.status': VerificationStatus.APPROVED,
                },
            },
            {
                $group: {
                    _id: '$profile.location.city',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        // 품종별 분양 가능한 반려동물 분포
        const topBreeds = await this.breederModel.aggregate([
            { $unwind: '$availablePets' },
            {
                $group: {
                    _id: '$availablePets.breed',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        // 4. 브리더 서류 재제출 통계
        const rejectedBreeders = await this.breederModel.find({
            'verification.status': VerificationStatus.REJECTED,
        });

        const resubmittedBreeders = await this.breederModel.find({
            'verification.status': { $in: [VerificationStatus.REVIEWING, VerificationStatus.APPROVED] },
            'verification.previousStatus': VerificationStatus.REJECTED,
        });

        const resubmittedAndApproved = await this.breederModel.countDocuments({
            'verification.status': VerificationStatus.APPROVED,
            'verification.previousStatus': VerificationStatus.REJECTED,
        });

        const totalRejections = rejectedBreeders.length + resubmittedBreeders.length;
        const resubmissions = resubmittedBreeders.length;
        const resubmissionRate = totalRejections > 0 ? (resubmissions / totalRejections) * 100 : 0;
        const resubmissionApprovalRate = resubmissions > 0 ? (resubmittedAndApproved / resubmissions) * 100 : 0;

        return {
            activeUserStats: {
                adopters7Days,
                adopters14Days,
                adopters28Days,
                breeders7Days,
                breeders14Days,
                breeders28Days,
            },
            consultationStats: {
                consultations7Days,
                consultations14Days,
                consultations28Days,
                adoptions7Days,
                adoptions14Days,
                adoptions28Days,
            },
            filterUsageStats: {
                topLocations: topLocations.map((loc) => ({
                    filterType: 'location',
                    filterValue: loc._id || 'Unknown',
                    usageCount: loc.count,
                })),
                topBreeds: topBreeds.map((breed) => ({
                    filterType: 'breed',
                    filterValue: breed._id || 'Unknown',
                    usageCount: breed.count,
                })),
                emptyResultFilters: [], // MVP에서는 추후 로깅 시스템 추가 시 구현
            },
            breederResubmissionStats: {
                totalRejections,
                resubmissions,
                resubmissionRate: Math.round(resubmissionRate),
                resubmissionApprovals: resubmittedAndApproved,
                resubmissionApprovalRate: Math.round(resubmissionApprovalRate),
            },
        };
    }

    /**
     * 입양 신청 리스트 조회 (플랫폼 어드민용)
     *
     * 전체 입양 신청 내역을 조회합니다.
     * 페이지네이션, 필터링, 통계 정보를 함께 제공합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param filters 필터 및 페이지네이션 옵션
     * @returns 입양 신청 리스트 및 통계
     */
    async getApplicationList(adminId: string, filters: ApplicationListRequestDto): Promise<ApplicationListResponseDto> {
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

        // 응답 DTO 매핑
        const applicationItems: ApplicationListItemDto[] = applications.map((app) => {
            const breeder = app.breederId as any;
            return {
                applicationId: app._id.toString(),
                adopterName: app.adopterName,
                adopterEmail: app.adopterEmail,
                adopterPhone: app.adopterPhone,
                breederId: breeder._id ? breeder._id.toString() : breeder.toString(),
                breederName: breeder.name || '알 수 없음',
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

    // ================== 전화번호 화이트리스트 관리 ==================

    /**
     * 전화번호 화이트리스트 목록 조회
     */
    async getPhoneWhitelist(): Promise<PhoneWhitelistListResponseDto> {
        const items = await this.phoneWhitelistModel.find().sort({ createdAt: -1 }).lean().exec();

        return {
            items: items.map((item) => ({
                id: item._id.toString(),
                phoneNumber: item.phoneNumber,
                description: item.description,
                isActive: item.isActive,
                createdBy: item.createdBy,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })),
            total: items.length,
        };
    }

    /**
     * 전화번호 화이트리스트 추가
     */
    async addPhoneWhitelist(adminId: string, dto: AddPhoneWhitelistRequestDto): Promise<PhoneWhitelistResponseDto> {
        // 중복 확인
        const existing = await this.phoneWhitelistModel.findOne({ phoneNumber: dto.phoneNumber }).exec();
        if (existing) {
            throw new BadRequestException('이미 화이트리스트에 등록된 전화번호입니다.');
        }

        const whitelist = new this.phoneWhitelistModel({
            phoneNumber: dto.phoneNumber,
            description: dto.description,
            isActive: true,
            createdBy: adminId,
        });

        const saved = await whitelist.save();

        return {
            id: (saved._id as any).toString(),
            phoneNumber: saved.phoneNumber,
            description: saved.description,
            isActive: saved.isActive,
            createdBy: saved.createdBy,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
        };
    }

    /**
     * 전화번호 화이트리스트 수정
     */
    async updatePhoneWhitelist(id: string, dto: UpdatePhoneWhitelistRequestDto): Promise<PhoneWhitelistResponseDto> {
        const whitelist = await this.phoneWhitelistModel.findById(id).exec();
        if (!whitelist) {
            throw new BadRequestException('화이트리스트를 찾을 수 없습니다.');
        }

        if (dto.description !== undefined) {
            whitelist.description = dto.description;
        }
        if (dto.isActive !== undefined) {
            whitelist.isActive = dto.isActive;
        }

        const saved = await whitelist.save();

        return {
            id: (saved._id as any).toString(),
            phoneNumber: saved.phoneNumber,
            description: saved.description,
            isActive: saved.isActive,
            createdBy: saved.createdBy,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
        };
    }

    /**
     * 전화번호 화이트리스트 삭제
     */
    async deletePhoneWhitelist(id: string): Promise<{ message: string }> {
        const result = await this.phoneWhitelistModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new BadRequestException('화이트리스트를 찾을 수 없습니다.');
        }

        return { message: '화이트리스트가 삭제되었습니다.' };
    }
}
