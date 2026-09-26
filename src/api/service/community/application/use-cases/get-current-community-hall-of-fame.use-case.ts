import { Inject, Injectable } from '@nestjs/common';

import { COMMUNITY_HALL_OF_FAME_PORT, type CommunityHallOfFamePort } from '../ports/community-hall-of-fame.port';
import { CommunityHallOfFameMapperService } from '../../domain/services/community-hall-of-fame-mapper.service';
import { CommunityHallOfFamePeriodService } from '../../domain/services/community-hall-of-fame-period.service';
import type { CommunityHallOfFameResult } from '../types/community-hall-of-fame-result.type';

@Injectable()
export class GetCurrentCommunityHallOfFameUseCase {
    constructor(
        @Inject(COMMUNITY_HALL_OF_FAME_PORT)
        private readonly hallOfFamePort: CommunityHallOfFamePort,
        private readonly periodService: CommunityHallOfFamePeriodService,
        private readonly mapperService: CommunityHallOfFameMapperService,
    ) {}

    async execute(now: Date = new Date()): Promise<CommunityHallOfFameResult> {
        const period = this.periodService.resolve(now);
        const snapshot = await this.hallOfFamePort.findByPeriodKey(period.periodKey);

        // 아직 집계 전이어도 회차 정보는 그대로 내려준다 — 프론트가 빈 상태를 따로 분기하지 않게 한다.
        return snapshot ? this.mapperService.toResult(snapshot) : this.mapperService.toEmptyResult(period);
    }
}
