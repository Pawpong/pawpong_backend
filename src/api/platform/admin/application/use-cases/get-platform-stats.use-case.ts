import { Inject, Injectable } from '@nestjs/common';

import { AdminStatsResponseDto } from '../../dto/response/admin-stats-response.dto';
import { PLATFORM_ADMIN_READER, type PlatformAdminReaderPort } from '../ports/platform-admin-reader.port';
import { PlatformAdminPresentationService } from '../../domain/services/platform-admin-presentation.service';
import { PlatformAdminQueryPolicyService } from '../../domain/services/platform-admin-query-policy.service';
import type { PlatformStatsQuery } from '../types/platform-admin-query.type';

@Injectable()
export class GetPlatformStatsUseCase {
    constructor(
        @Inject(PLATFORM_ADMIN_READER)
        private readonly platformAdminReader: PlatformAdminReaderPort,
        private readonly platformAdminQueryPolicyService: PlatformAdminQueryPolicyService,
        private readonly platformAdminPresentationService: PlatformAdminPresentationService,
    ) {}

    async execute(adminId: string, filter: PlatformStatsQuery): Promise<AdminStatsResponseDto> {
        this.platformAdminQueryPolicyService.assertCanViewStatistics(
            await this.platformAdminReader.findAdminById(adminId),
            'Access denied',
        );

        const snapshot = await this.platformAdminReader.getStats({
            statsType: filter.statsType,
            startDate: filter.startDate,
            endDate: filter.endDate,
            pageNumber: filter.pageNumber ?? 1,
            itemsPerPage: filter.itemsPerPage ?? 10,
        });

        return this.platformAdminPresentationService.toAdminStatsResponse(snapshot);
    }
}
