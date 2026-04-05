import { Inject, Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { NotificationListRequestDto } from '../../dto/request/notification-list-request.dto';
import { NotificationResponseDto } from '../../dto/response/notification-response.dto';
import { NOTIFICATION_INBOX_PORT } from '../ports/notification-inbox.port';
import type { NotificationInboxPort } from '../ports/notification-inbox.port';
import { NotificationResponseMapperService } from '../../domain/services/notification-response-mapper.service';

@Injectable()
export class GetNotificationsUseCase {
    constructor(
        @Inject(NOTIFICATION_INBOX_PORT)
        private readonly notificationInboxPort: NotificationInboxPort,
        private readonly notificationResponseMapperService: NotificationResponseMapperService,
    ) {}

    async execute(
        userId: string,
        filter: NotificationListRequestDto,
    ): Promise<PaginationResponseDto<NotificationResponseDto>> {
        const page = filter.pageNumber || 1;
        const limit = filter.itemsPerPage || 20;

        const result = await this.notificationInboxPort.findPagedByUser(userId, {
            isRead: filter.isRead,
            page,
            limit,
        });

        return this.notificationResponseMapperService.toPage(result.items, page, limit, result.totalItems);
    }
}
