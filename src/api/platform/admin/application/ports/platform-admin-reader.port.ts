import { StatsType } from '../../../../../common/enum/user.enum';

export interface PlatformAdminAdminSnapshot {
    id: string;
    permissions?: {
        canViewStatistics?: boolean;
    };
}

export interface PlatformAdminStatsFilterSnapshot {
    statsType?: StatsType;
    startDate?: string;
    endDate?: string;
    pageNumber: number;
    itemsPerPage: number;
}

export interface PlatformAdminUserStatisticsSnapshot {
    totalAdopterCount: number;
    newAdopterCount: number;
    activeAdopterCount: number;
    totalBreederCount: number;
    newBreederCount: number;
    approvedBreederCount: number;
    pendingBreederCount: number;
}

export interface PlatformAdminAdoptionStatisticsSnapshot {
    totalApplicationCount: number;
    newApplicationCount: number;
    completedAdoptionCount: number;
    pendingApplicationCount: number;
    rejectedApplicationCount: number;
}

export interface PlatformAdminPopularBreedSnapshot {
    breedName: string;
    petType: string;
    applicationCount: number;
    completedAdoptionCount: number;
    averagePrice: number;
}

export interface PlatformAdminRegionalStatisticsSnapshot {
    cityName: string;
    districtName: string;
    breederCount: number;
    applicationCount: number;
    completedAdoptionCount: number;
}

export interface PlatformAdminBreederPerformanceSnapshot {
    breederId: string;
    breederName: string;
    cityName: string;
    applicationCount: number;
    completedAdoptionCount: number;
    averageRating: number;
    totalReviewCount: number;
    profileViewCount: number;
}

export interface PlatformAdminReportStatisticsSnapshot {
    totalReportCount: number;
    newReportCount: number;
    resolvedReportCount: number;
    pendingReportCount: number;
    dismissedReportCount: number;
}

export interface PlatformAdminStatsSnapshot {
    userStatistics: PlatformAdminUserStatisticsSnapshot;
    adoptionStatistics: PlatformAdminAdoptionStatisticsSnapshot;
    popularBreeds: PlatformAdminPopularBreedSnapshot[];
    regionalStatistics: PlatformAdminRegionalStatisticsSnapshot[];
    breederPerformanceRanking: PlatformAdminBreederPerformanceSnapshot[];
    reportStatistics: PlatformAdminReportStatisticsSnapshot;
}

export interface PlatformAdminActiveUserStatsSnapshot {
    adopters7Days: number;
    adopters14Days: number;
    adopters28Days: number;
    breeders7Days: number;
    breeders14Days: number;
    breeders28Days: number;
}

export interface PlatformAdminConsultationStatsSnapshot {
    consultations7Days: number;
    consultations14Days: number;
    consultations28Days: number;
    adoptions7Days: number;
    adoptions14Days: number;
    adoptions28Days: number;
}

export interface PlatformAdminFilterUsageItemSnapshot {
    filterType: string;
    filterValue: string;
    usageCount: number;
}

export interface PlatformAdminFilterUsageStatsSnapshot {
    topLocations: PlatformAdminFilterUsageItemSnapshot[];
    topBreeds: PlatformAdminFilterUsageItemSnapshot[];
    emptyResultFilters: PlatformAdminFilterUsageItemSnapshot[];
}

export interface PlatformAdminBreederResubmissionStatsSnapshot {
    totalRejections: number;
    resubmissions: number;
    resubmissionRate: number;
    resubmissionApprovals: number;
    resubmissionApprovalRate: number;
}

export interface PlatformAdminMvpStatsSnapshot {
    activeUserStats: PlatformAdminActiveUserStatsSnapshot;
    consultationStats: PlatformAdminConsultationStatsSnapshot;
    filterUsageStats: PlatformAdminFilterUsageStatsSnapshot;
    breederResubmissionStats: PlatformAdminBreederResubmissionStatsSnapshot;
}

export const PLATFORM_ADMIN_READER = Symbol('PLATFORM_ADMIN_READER');

export interface PlatformAdminReaderPort {
    findAdminById(adminId: string): Promise<PlatformAdminAdminSnapshot | null>;
    getStats(filter: PlatformAdminStatsFilterSnapshot): Promise<PlatformAdminStatsSnapshot>;
    getMvpStats(): Promise<PlatformAdminMvpStatsSnapshot>;
}
