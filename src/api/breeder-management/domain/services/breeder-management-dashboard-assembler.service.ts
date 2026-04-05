import { Injectable } from '@nestjs/common';

import { BreederDashboardResponseDto } from '../../../breeder/dto/response/breeder-dashboard-response.dto';
import type {
    BreederManagementBreederRecord,
    BreederManagementRecentApplicationRecord,
} from '../../application/ports/breeder-management-profile.port';

@Injectable()
export class BreederManagementDashboardAssemblerService {
    toResponse(
        breeder: BreederManagementBreederRecord,
        pendingApplications: number,
        recentApplications: BreederManagementRecentApplicationRecord[],
        availablePetsCount: number,
    ): BreederDashboardResponseDto {
        return {
            profileInfo: {
                verificationInfo: {
                    verificationStatus: breeder.verification?.status || 'pending',
                    subscriptionPlan: breeder.verification?.plan || 'basic',
                    submittedAt: breeder.verification?.submittedAt as Date | undefined,
                    reviewedAt: breeder.verification?.reviewedAt as Date | undefined,
                    rejectionReason: breeder.verification?.rejectionReason as string | undefined,
                },
            },
            statisticsInfo: {
                totalApplicationCount: (breeder.stats as any)?.totalApplications || 0,
                pendingApplicationCount: pendingApplications,
                completedAdoptionCount: (breeder.stats as any)?.completedAdoptions || 0,
                averageRating: (breeder.stats as any)?.averageRating || 0,
                totalReviewCount: (breeder.stats as any)?.totalReviews || 0,
                profileViewCount: (breeder.stats as any)?.profileViews || 0,
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
