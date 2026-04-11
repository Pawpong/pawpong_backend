import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { NOTIFICATION_ADMIN_READER_PORT } from '../ports/notification-admin-reader.port';
import type { NotificationAdminReaderPort } from '../ports/notification-admin-reader.port';
import { NotificationAdminStatsResultMapperService } from '../../domain/services/notification-admin-stats-result-mapper.service';
import type { NotificationAdminStatsResult } from '../types/notification-admin-result.type';

@Injectable()
export class GetNotificationAdminStatsUseCase {
    constructor(
        @Inject(NOTIFICATION_ADMIN_READER_PORT)
        private readonly notificationAdminReader: NotificationAdminReaderPort,
        private readonly notificationAdminStatsResultMapperService: NotificationAdminStatsResultMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(adminUserId: string): Promise<NotificationAdminStatsResult> {
        this.logger.logStart('getStats', '관리자 알림 통계 조회 시작', { adminUserId });

        try {
            const result = await this.notificationAdminReader.getStats();
            const response = this.notificationAdminStatsResultMapperService.toResult(result);

            this.logger.logSuccess('getStats', '관리자 알림 통계 조회 완료', response);

            return response;
        } catch (error) {
            this.logger.logError('getStats', '관리자 알림 통계 조회 실패', error);
            throw new BadRequestException('알림 통계를 조회할 수 없습니다.');
        }
    }
}
