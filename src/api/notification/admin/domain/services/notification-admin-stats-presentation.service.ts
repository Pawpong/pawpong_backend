import { Injectable } from '@nestjs/common';

import {
    NotificationAdminStatsSnapshot,
} from '../../application/ports/notification-admin-reader.port';
import { NotificationStatsResponseDto } from '../../dto/response/notification-admin-response.dto';

@Injectable()
export class NotificationAdminStatsPresentationService {
    toStats(snapshot: NotificationAdminStatsSnapshot): NotificationStatsResponseDto {
        return {
            totalNotifications: snapshot.totalNotifications,
            unreadNotifications: snapshot.unreadNotifications,
            notificationsByType: snapshot.notificationsByType,
            notificationsByRole: snapshot.notificationsByRole,
        };
    }
}
