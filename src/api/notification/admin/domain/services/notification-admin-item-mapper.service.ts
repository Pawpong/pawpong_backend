import { Injectable } from '@nestjs/common';

import {
    NotificationAdminRecordSnapshot,
} from '../../application/ports/notification-admin-reader.port';
import type {
    NotificationAdminItemResult,
} from '../../application/types/notification-admin-result.type';

@Injectable()
export class NotificationAdminItemMapperService {
    toItem(record: NotificationAdminRecordSnapshot): NotificationAdminItemResult {
        return {
            notificationId: record.notificationId,
            userId: record.userId,
            userRole: record.userRole,
            type: record.type,
            title: record.title,
            body: record.body,
            metadata: record.metadata,
            isRead: record.isRead,
            readAt: record.readAt,
            targetUrl: record.targetUrl,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
    }
}
