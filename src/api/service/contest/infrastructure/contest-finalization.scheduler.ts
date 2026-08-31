import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { ContestRepository } from '../repository/contest.repository';

/** 만료 콘테스트 확정 주기 (1분 — endDate 경과 후 확정까지의 최대 지연) */
const CONTEST_FINALIZATION_INTERVAL_MS = 60 * 1000;

/**
 * 콘테스트 지연 종료 확정 스케줄러.
 *
 * 결과 확정은 status flip 이라는 "쓰기"로만 진입한다는 불변식을 요청 유무와 무관하게 보장한다.
 * 투표/취소 요청 시의 자기 치유는 요청이 와야만 동작하므로, 이 스케줄러가
 * 주기적으로(그리고 부팅 직후 1회) 만료된 active 콘테스트를 ended 로 확정한다.
 * updateMany 조건부 갱신이라 다중 인스턴스 동시 실행에도 안전하다.
 */
@Injectable()
export class ContestFinalizationScheduler implements OnModuleInit, OnModuleDestroy {
    private timer: NodeJS.Timeout | null = null;

    constructor(
        private readonly repository: ContestRepository,
        private readonly logger: CustomLoggerService,
    ) {}

    async onModuleInit(): Promise<void> {
        // 부팅 직후 1회 실행 — 서버가 내려가 있던 동안 만료된 콘테스트의 확정 백로그 처리
        await this.runOnce();

        this.timer = setInterval(() => {
            void this.runOnce();
        }, CONTEST_FINALIZATION_INTERVAL_MS);
        // 이 타이머가 프로세스 종료를 붙잡지 않게 한다
        this.timer.unref?.();
    }

    onModuleDestroy(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /** 만료된 active 콘테스트를 일괄 확정한다. 스케줄러 틱과 테스트에서 직접 호출한다 */
    async runOnce(): Promise<void> {
        try {
            const finalized = await this.repository.finalizeAllExpiredContests();
            if (finalized > 0) {
                this.logger.logSuccess('finalizeExpiredContests', '만료 콘테스트 확정 완료', { finalized });
            }
        } catch (error) {
            // 다음 틱에서 재시도되므로 오류는 기록만 하고 삼킨다
            this.logger.logError('finalizeExpiredContests', '만료 콘테스트 확정 실패', error as Error);
        }
    }
}
