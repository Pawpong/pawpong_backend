import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';

import {
    COMMUNITY_HALL_OF_FAME_POST_READER_PORT,
    type CommunityHallOfFamePostReaderPort,
} from '../ports/community-hall-of-fame-post-reader.port';
import { COMMUNITY_HALL_OF_FAME_PORT, type CommunityHallOfFamePort } from '../ports/community-hall-of-fame.port';
import {
    CommunityHallOfFamePeriodService,
    type CommunityHallOfFamePeriod,
} from '../../domain/services/community-hall-of-fame-period.service';
import { CommunityHallOfFameMapperService } from '../../domain/services/community-hall-of-fame-mapper.service';

const WINNER_COUNT = 3;

/**
 * 명예의 전당 회차를 갱신한다.
 *
 * 1) 직전 회차가 아직 open 이면 final 로 확정한다 (확정 후에는 다시 집계하지 않는다)
 * 2) 현재 회차를 재집계해 upsert 한다
 *
 * upsert 기반이라 인스턴스가 여럿이어도 락 없이 안전하다.
 */
@Injectable()
export class RefreshCommunityHallOfFameUseCase {
    constructor(
        @Inject(COMMUNITY_HALL_OF_FAME_PORT)
        private readonly hallOfFamePort: CommunityHallOfFamePort,
        @Inject(COMMUNITY_HALL_OF_FAME_POST_READER_PORT)
        private readonly postReaderPort: CommunityHallOfFamePostReaderPort,
        private readonly periodService: CommunityHallOfFamePeriodService,
        private readonly mapperService: CommunityHallOfFameMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(now: Date = new Date()): Promise<void> {
        await this.finalizePrevious(now);
        await this.recomputeCurrent(now);
    }

    private async finalizePrevious(now: Date): Promise<void> {
        const previous = this.periodService.resolvePrevious(now);

        // 직전 회차가 한 번도 집계되지 않았다면(배포 공백 등) 마지막으로 한 번 집계한 뒤 확정한다.
        const existing = await this.hallOfFamePort.findByPeriodKey(previous.periodKey);
        if (!existing) {
            await this.recompute(previous, now);
        }

        if (await this.hallOfFamePort.finalize(previous.periodKey)) {
            this.logger.log(`[refreshCommunityHallOfFame] 회차 확정: ${previous.periodKey}`);
        }
    }

    private async recomputeCurrent(now: Date): Promise<void> {
        await this.recompute(this.periodService.resolve(now), now);
    }

    private async recompute(period: CommunityHallOfFamePeriod, now: Date): Promise<void> {
        const candidates = await this.postReaderPort.findTopPosts(period.startDate, period.endDate, WINNER_COUNT);

        await this.hallOfFamePort.upsertOpen({
            periodKey: period.periodKey,
            startDate: period.startDate,
            endDate: period.endDate,
            refreshedAt: now,
            winners: this.mapperService.toWinnerSnapshots(candidates),
        });
    }
}
