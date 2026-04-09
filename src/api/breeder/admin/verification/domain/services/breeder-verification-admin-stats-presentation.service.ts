import { Injectable } from '@nestjs/common';

import { BreederVerificationAdminStatsSnapshot } from '../../application/ports/breeder-verification-admin-reader.port';
import { BreederStatsResponseDto } from '../../dto/response/breeder-stats-response.dto';

@Injectable()
export class BreederVerificationAdminStatsPresentationService {
    toBreederStatsResponse(stats: BreederVerificationAdminStatsSnapshot): BreederStatsResponseDto {
        return {
            totalApproved: stats.totalApproved,
            eliteCount: stats.eliteCount,
            newCount: stats.totalApproved - stats.eliteCount,
        };
    }
}
