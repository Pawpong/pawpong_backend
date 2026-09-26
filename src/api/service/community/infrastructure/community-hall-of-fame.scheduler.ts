import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { getErrorMessage } from '../../../../common/utils/error.util';

import { RefreshCommunityHallOfFameUseCase } from '../application/use-cases/refresh-community-hall-of-fame.use-case';

/**
 * 명예의 전당 집계 스케줄러.
 *
 * 매시 정각(KST)에 갱신하고, 기동 직후에도 한 번 실행해 배포 직후 빈 상태를 피한다.
 * 집계 실패가 애플리케이션 기동이나 다음 주기를 막지 않도록 예외를 삼키고 로그만 남긴다.
 */
@Injectable()
export class CommunityHallOfFameScheduler implements OnApplicationBootstrap {
    constructor(
        private readonly refreshUseCase: RefreshCommunityHallOfFameUseCase,
        private readonly logger: CustomLoggerService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.refresh('bootstrap');
    }

    @Cron('0 0 * * * *', { name: 'community-hall-of-fame-refresh', timeZone: 'Asia/Seoul' })
    async handleCron(): Promise<void> {
        await this.refresh('cron');
    }

    private async refresh(trigger: string): Promise<void> {
        try {
            await this.refreshUseCase.execute();
        } catch (error) {
            this.logger.logError(
                'communityHallOfFameRefresh',
                `명예의 전당 집계 실패 (${trigger}): ${getErrorMessage(error, '알 수 없는 오류')}`,
                error,
            );
        }
    }
}
