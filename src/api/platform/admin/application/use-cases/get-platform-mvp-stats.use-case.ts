import { Inject, Injectable } from '@nestjs/common';

import { PLATFORM_ADMIN_READER_PORT, type PlatformAdminReaderPort } from '../ports/platform-admin-reader.port';
import { PlatformAdminResultMapperService } from '../../domain/services/platform-admin-result-mapper.service';
import { PlatformAdminQueryPolicyService } from '../../domain/services/platform-admin-query-policy.service';
import type { PlatformAdminMvpStatsResult } from '../types/platform-admin-result.type';

@Injectable()
export class GetPlatformMvpStatsUseCase {
    constructor(
        @Inject(PLATFORM_ADMIN_READER_PORT)
        private readonly platformAdminReader: PlatformAdminReaderPort,
        private readonly platformAdminQueryPolicyService: PlatformAdminQueryPolicyService,
        private readonly platformAdminResultMapperService: PlatformAdminResultMapperService,
    ) {}

    async execute(adminId: string): Promise<PlatformAdminMvpStatsResult> {
        this.platformAdminQueryPolicyService.assertCanViewStatistics(
            await this.platformAdminReader.findAdminById(adminId),
            '통계 조회 권한이 없습니다.',
        );

        return this.platformAdminResultMapperService.toMvpStatsResult(await this.platformAdminReader.getMvpStats());
    }
}
