import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { VerificationStatus, UserStatus, ApplicationStatus } from '../../../common/enum/user.enum';

import { Admin, AdminDocument } from '../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { SystemStats, SystemStatsDocument } from '../../../schema/system-stats.schema';
import { AdoptionApplication, AdoptionApplicationDocument } from '../../../schema/adoption-application.schema';

import { StatsFilterRequestDto } from './dto/request/stats-filter-request.dto';
import { AdminStatsResponseDto } from './dto/response/admin-stats-response.dto';
import { MvpStatsResponseDto } from './dto/response/mvp-stats-response.dto';

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
}
