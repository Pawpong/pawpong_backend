import { Inject, Injectable } from '@nestjs/common';

import { MvpStatsResponseDto } from '../../dto/response/mvp-stats-response.dto';
import { PLATFORM_ADMIN_READER, type PlatformAdminReaderPort } from '../ports/platform-admin-reader.port';
import { PlatformAdminPresentationService } from '../../domain/services/platform-admin-presentation.service';
import { PlatformAdminQueryPolicyService } from '../../domain/services/platform-admin-query-policy.service';

@Injectable()
export class GetPlatformMvpStatsUseCase {
    constructor(
        @Inject(PLATFORM_ADMIN_READER)
        private readonly platformAdminReader: PlatformAdminReaderPort,
        private readonly platformAdminQueryPolicyService: PlatformAdminQueryPolicyService,
        private readonly platformAdminPresentationService: PlatformAdminPresentationService,
    ) {}

    async execute(adminId: string): Promise<MvpStatsResponseDto> {
        this.platformAdminQueryPolicyService.assertCanViewStatistics(
            await this.platformAdminReader.findAdminById(adminId),
            '통계 조회 권한이 없습니다.',
        );

        return this.platformAdminPresentationService.toMvpStatsResponse(await this.platformAdminReader.getMvpStats());
    }
}
