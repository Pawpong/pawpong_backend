import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CustomLoggerService } from '../../../logger/custom-logger.service';
import type { OpsPendingResolvedEvent } from '../../../events/ops-pending.event';
import { OpsPendingEventRepository } from '../../repository/ops-pending-event.repository';

/**
 * 관리자가 처리한 건의 리마인드를 멈춘다.
 *
 * 처리했는데도 독촉이 계속 오면 알림 자체를 무시하게 되므로, 해소 경로를 반드시 붙인다.
 */
@Injectable()
export class ResolveOpsPendingUseCase {
    constructor(
        private readonly repository: OpsPendingEventRepository,
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(event: OpsPendingResolvedEvent): Promise<void> {
        const environment =
            this.configService.get<string>('APP_ENV') || this.configService.get<string>('NODE_ENV') || 'development';

        const resolvedCount = await this.repository.resolve(
            environment,
            event.kind,
            event.referenceId,
            event.resolution ?? '처리완료',
            new Date(),
        );

        if (resolvedCount > 0) {
            this.logger.logSuccess('resolveOpsPending', '운영 대기 알림 종료', {
                kind: event.kind,
                referenceId: event.referenceId,
            });
        }
    }
}
