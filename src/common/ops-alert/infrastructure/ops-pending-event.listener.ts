import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
    OPS_PENDING_CREATED_EVENT,
    OPS_PENDING_RESOLVED_EVENT,
    type OpsPendingCreatedEvent,
    type OpsPendingResolvedEvent,
} from '../../events/ops-pending.event';
import { CustomLoggerService } from '../../logger/custom-logger.service';
import { RecordOpsPendingUseCase } from '../application/use-cases/record-ops-pending.use-case';
import { ResolveOpsPendingUseCase } from '../application/use-cases/resolve-ops-pending.use-case';

/**
 * 도메인이 발행한 운영 대기 이벤트를 받아 알림 큐에 반영한다.
 *
 * 각 도메인은 이벤트만 던지고 알림 채널을 모르게 두기 위해 리스너로 받는다.
 */
@Injectable()
export class OpsPendingEventListener {
    constructor(
        private readonly recordOpsPendingUseCase: RecordOpsPendingUseCase,
        private readonly resolveOpsPendingUseCase: ResolveOpsPendingUseCase,
        private readonly logger: CustomLoggerService,
    ) {}

    @OnEvent(OPS_PENDING_CREATED_EVENT)
    async handleCreated(event: OpsPendingCreatedEvent): Promise<void> {
        try {
            await this.recordOpsPendingUseCase.execute(event);
        } catch (error) {
            // 알림 적재가 실패해도 원래 요청(신청·신고 접수)은 성공시킨다.
            // 다만 조용히 사라지면 운영이 접수를 영영 모르므로 에러 로그로 남겨 추적할 수 있게 한다.
            this.logger.logError('opsPendingCreated', '운영 대기 알림 적재 실패', error);
        }
    }

    @OnEvent(OPS_PENDING_RESOLVED_EVENT)
    async handleResolved(event: OpsPendingResolvedEvent): Promise<void> {
        try {
            await this.resolveOpsPendingUseCase.execute(event);
        } catch (error) {
            // 여기서 실패하면 이미 처리한 건에 리마인드가 계속 간다. 반드시 눈에 보여야 한다.
            this.logger.logError('opsPendingResolved', '운영 대기 알림 종료 실패 - 리마인드가 계속될 수 있음', error);
        }
    }
}
