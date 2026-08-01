import { Injectable } from '@nestjs/common';

import type {
    BreederManagementBreederRecord,
    BreederManagementRecentApplicationRecord,
} from '../../application/ports/breeder-management-profile.port';
import type { BreederManagementDashboardResult } from '../../application/types/breeder-management-result.type';

@Injectable()
export class BreederManagementDashboardAssemblerService {
    toResponse(
        breeder: BreederManagementBreederRecord,
        pendingApplications: number,
        recentApplications: BreederManagementRecentApplicationRecord[],
        availablePetsCount: number,
    ): BreederManagementDashboardResult {
        return {
            profileInfo: {
                verificationInfo: {
                    verificationStatus: breeder.verification?.status || 'pending',
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
            recentApplicationList: (recentApplications || []).map((application) => ({
                applicationId: String(application._id || ''),
                adopterName: application.adopterName || 'Unknown',
                petName: application.petName || 'Unknown',
                applicationStatus: application.status || '',
                appliedAt: application.appliedAt as Date,
            })),
            availablePetCount: availablePetsCount,
        };
    }
}
