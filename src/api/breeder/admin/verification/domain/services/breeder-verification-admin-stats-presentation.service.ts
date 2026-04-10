import { Injectable } from '@nestjs/common';

import { BreederVerificationAdminStatsSnapshot } from '../../application/ports/breeder-verification-admin-reader.port';
import type { BreederStatsResult } from '../../application/types/breeder-verification-admin-result.type';

@Injectable()
export class BreederVerificationAdminStatsPresentationService {
    toBreederStatsResponse(stats: BreederVerificationAdminStatsSnapshot): BreederStatsResult {
        return {
            totalApproved: stats.totalApproved,
            eliteCount: stats.eliteCount,
            newCount: stats.totalApproved - stats.eliteCount,
        };
    }
}
