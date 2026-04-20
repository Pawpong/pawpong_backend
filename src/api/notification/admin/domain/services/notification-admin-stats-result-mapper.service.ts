import { Injectable } from '@nestjs/common';

import {
    NotificationAdminStatsSnapshot,
} from '../../application/ports/notification-admin-reader.port';
import type { NotificationAdminStatsResult } from '../../application/types/notification-admin-result.type';

@Injectable()
export class NotificationAdminStatsResultMapperService {
    toResult(snapshot: NotificationAdminStatsSnapshot): NotificationAdminStatsResult {
        return {
            totalNotifications: snapshot.totalNotifications,
            unreadNotifications: snapshot.unreadNotifications,
            notificationsByType: snapshot.notificationsByType,
            notificationsByRole: snapshot.notificationsByRole,
        };
    }
}
