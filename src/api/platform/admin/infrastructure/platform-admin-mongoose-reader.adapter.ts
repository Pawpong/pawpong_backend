import { Injectable } from '@nestjs/common';
import { ApplicationStatus, VerificationStatus } from '../../../../common/enum/user.enum';
import {
    PlatformAdminAdminSnapshot,
    PlatformAdminFilterUsageItemSnapshot,
    PlatformAdminMvpStatsSnapshot,
    PlatformAdminReaderPort,
    PlatformAdminStatsFilterSnapshot,
    PlatformAdminStatsSnapshot,
} from '../application/ports/platform-admin-reader.port';
import { PlatformAdminRepository } from '../repository/platform-admin.repository';

@Injectable()
export class PlatformAdminMongooseReaderAdapter implements PlatformAdminReaderPort {
    constructor(private readonly platformAdminRepository: PlatformAdminRepository) {}

    async findAdminById(adminId: string): Promise<PlatformAdminAdminSnapshot | null> {
        const admin = await this.platformAdminRepository.findAdminById(adminId);

        if (!admin) {
            return null;
        }

        return {
            id: admin._id.toString(),
            permissions: admin.permissions,
        };
    }

    async getStats(_filter: PlatformAdminStatsFilterSnapshot): Promise<PlatformAdminStatsSnapshot> {
        const [adoptersTotal, breedersTotal, breedersApproved, breedersPending] = await Promise.all([
            this.platformAdminRepository.countActiveAdopters(),
            this.platformAdminRepository.countActiveBreeders(),
            this.platformAdminRepository.countApprovedBreeders(),
            this.platformAdminRepository.countPendingBreeders(),
        ]);

        const applicationStats = await this.platformAdminRepository.aggregateApplicationStats();

        const totalApplications = applicationStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
        const pendingApplications =
            applicationStats.find((item: any) => item._id === ApplicationStatus.CONSULTATION_PENDING)?.count || 0;
        const completedAdoptions =
            applicationStats.find((item: any) => item._id === ApplicationStatus.ADOPTION_APPROVED)?.count || 0;
        const rejectedApplications =
            applicationStats.find((item: any) => item._id === ApplicationStatus.ADOPTION_REJECTED)?.count || 0;

        const popularBreeds = await this.platformAdminRepository.aggregatePopularBreeds(10);

        const regionalStats = await this.platformAdminRepository.aggregateRegionalStats(10);

        const breederPerformance = await this.platformAdminRepository.aggregateBreederPerformance(10);

        const reportStats = await this.platformAdminRepository.aggregateReportStats();

        const totalReports = reportStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
        const pendingReports = reportStats.find((item: any) => item._id === 'pending')?.count || 0;
        const resolvedReports = reportStats.find((item: any) => item._id === 'resolved')?.count || 0;
        const dismissedReports = reportStats.find((item: any) => item._id === 'dismissed')?.count || 0;

        return {
            userStatistics: {
                totalAdopterCount: adoptersTotal,
                newAdopterCount: 0,
                activeAdopterCount: adoptersTotal,
                totalBreederCount: breedersTotal,
                newBreederCount: 0,
                approvedBreederCount: breedersApproved,
                pendingBreederCount: breedersPending,
            },
            adoptionStatistics: {
                totalApplicationCount: totalApplications,
                newApplicationCount: 0,
                completedAdoptionCount: completedAdoptions,
                pendingApplicationCount: pendingApplications,
                rejectedApplicationCount: rejectedApplications,
            },
            popularBreeds: popularBreeds.map((breed: any) => ({
                breedName: breed._id.breed,
                petType: breed._id.type,
                applicationCount: breed.applicationCount,
                completedAdoptionCount: 0,
                averagePrice: breed.averagePrice || 0,
            })),
            regionalStatistics: regionalStats.map((region: any) => ({
                cityName: region._id.city || 'Unknown',
                districtName: region._id.district || 'Unknown',
                breederCount: region.breederCount,
                applicationCount: region.applicationCount || 0,
                completedAdoptionCount: region.completedAdoptionCount || 0,
            })),
            breederPerformanceRanking: breederPerformance.map((breeder: any) => ({
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
                newReportCount: 0,
                resolvedReportCount: resolvedReports,
                pendingReportCount: pendingReports,
                dismissedReportCount: dismissedReports,
            },
        };
    }

    async getMvpStats(): Promise<PlatformAdminMvpStatsSnapshot> {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

        const [adopters7Days, adopters14Days, adopters28Days, breeders7Days, breeders14Days, breeders28Days] =
            await Promise.all([
                this.platformAdminRepository.countActiveAdoptersSince(sevenDaysAgo),
                this.platformAdminRepository.countActiveAdoptersSince(fourteenDaysAgo),
                this.platformAdminRepository.countActiveAdoptersSince(twentyEightDaysAgo),
                this.platformAdminRepository.countActiveBreedersSince(sevenDaysAgo),
                this.platformAdminRepository.countActiveBreedersSince(fourteenDaysAgo),
                this.platformAdminRepository.countActiveBreedersSince(twentyEightDaysAgo),
            ]);

        const [
            consultations7Days,
            consultations14Days,
            consultations28Days,
            adoptions7Days,
            adoptions14Days,
            adoptions28Days,
        ] = await Promise.all([
            this.platformAdminRepository.countConsultationsSince(sevenDaysAgo),
            this.platformAdminRepository.countConsultationsSince(fourteenDaysAgo),
            this.platformAdminRepository.countConsultationsSince(twentyEightDaysAgo),
            this.platformAdminRepository.countApprovedAdoptionsSince(sevenDaysAgo),
            this.platformAdminRepository.countApprovedAdoptionsSince(fourteenDaysAgo),
            this.platformAdminRepository.countApprovedAdoptionsSince(twentyEightDaysAgo),
        ]);

        const topLocations = await this.platformAdminRepository.aggregateTopLocations(10);

        const topBreeds = await this.platformAdminRepository.aggregateTopBreeds(10);

        const [rejectedBreeders, resubmittedBreeders, resubmittedAndApproved] = await Promise.all([
            this.platformAdminRepository.countRejectedBreeders(),
            this.platformAdminRepository.countResubmittedBreeders(),
            this.platformAdminRepository.countResubmittedAndApprovedBreeders(),
        ]);

        const totalRejections = rejectedBreeders + resubmittedBreeders;
        const resubmissions = resubmittedBreeders;
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
                topLocations: topLocations.map((location: any) =>
                    this.toFilterUsageItem('location', location._id || 'Unknown', location.count),
                ),
                topBreeds: topBreeds.map((breed: any) =>
                    this.toFilterUsageItem('breed', breed._id || 'Unknown', breed.count),
                ),
                emptyResultFilters: [],
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

    private toFilterUsageItem(
        filterType: string,
        filterValue: string,
        usageCount: number,
    ): PlatformAdminFilterUsageItemSnapshot {
        return {
            filterType,
            filterValue,
            usageCount,
        };
    }
}
