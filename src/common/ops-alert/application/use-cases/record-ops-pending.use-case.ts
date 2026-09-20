import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { CustomLoggerService } from '../../../logger/custom-logger.service';
import { OpsAlertPresenterService } from '../../domain/services/ops-alert-presenter.service';
import { OpsPendingEventRepository } from '../../repository/ops-pending-event.repository';
import type { RecordOpsPendingCommand } from '../types/ops-alert.type';

/**
 * 운영 대기 접수를 outbox 에 적재한다.
 *
 * 전송 자체는 워커가 맡는다. 접수 시점에 웹훅을 직접 때리면 디스코드가 느리거나 죽었을 때
 * 사용자 요청이 같이 느려지고, 실패하면 접수 사실이 통째로 사라진다.
 */
@Injectable()
export class RecordOpsPendingUseCase {
    /** 일시적인 DB 오류로 접수가 사라지지 않도록 짧게 재시도한다 */
    private static readonly MAX_ATTEMPTS = 3;
    private static readonly RETRY_DELAY_MS = 200;

    constructor(
        private readonly repository: OpsPendingEventRepository,
        private readonly presenter: OpsAlertPresenterService,
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(command: RecordOpsPendingCommand): Promise<void> {
        const environment =
            this.configService.get<string>('APP_ENV') || this.configService.get<string>('NODE_ENV') || 'development';

        const record = {
            eventId: randomUUID(),
            kind: command.kind,
            referenceId: command.referenceId,
            summary: command.summary,
            details: command.details ?? [],
            adminPath: this.presenter.getAdminPath(command.kind),
            environment,
        };

        // 같은 원본에 대한 중복 적재는 repository 가 막으므로 재시도해도 알림이 두 번 생기지 않는다.
        for (let attempt = 1; attempt <= RecordOpsPendingUseCase.MAX_ATTEMPTS; attempt++) {
            try {
                const inserted = await this.repository.insert(record);
                if (!inserted) {
                    // 같은 건이 이미 대기 중이면 방을 두 번 울리지 않는다
                    this.logger.logWarning('recordOpsPending', '이미 처리 대기 중인 접수라 알림을 추가하지 않습니다.');
                }
                return;
            } catch (error) {
                if (attempt === RecordOpsPendingUseCase.MAX_ATTEMPTS) throw error;
                await this.delay(RecordOpsPendingUseCase.RETRY_DELAY_MS * attempt);
            }
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
