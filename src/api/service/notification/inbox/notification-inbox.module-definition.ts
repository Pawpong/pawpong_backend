import { NotificationSharedModule } from '../shared/notification-shared.module';
import { NotificationListController } from '../controller/notification-list.controller';
import { NotificationUnreadCountController } from '../controller/notification-unread-count.controller';
import { NotificationMarkReadController } from '../controller/notification-mark-read.controller';
import { NotificationMarkAllReadController } from '../controller/notification-mark-all-read.controller';
import { NotificationDeleteController } from '../controller/notification-delete.controller';
import { GetNotificationsUseCase } from '../application/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from '../application/use-cases/get-unread-notification-count.use-case';
import { MarkNotificationReadUseCase } from '../application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from '../application/use-cases/mark-all-notifications-read.use-case';
import { DeleteNotificationUseCase } from '../application/use-cases/delete-notification.use-case';
import { CreateNotificationUseCase } from '../application/use-cases/create-notification.use-case';
import { CreateNotificationFromBuilderUseCase } from '../application/use-cases/create-notification-from-builder.use-case';
import { NotificationPageAssemblerService } from '../domain/services/notification-page-assembler.service';
import { NotificationPaginationAssemblerService } from '../domain/services/notification-pagination-assembler.service';
import { NotificationStateResultMapperService } from '../domain/services/notification-state-result-mapper.service';
import {
    CREATE_NOTIFICATION_DISPATCH_USE_CASE,
    CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE,
} from '../application/tokens/notification-dispatch-use-case.token';

// 알림 > 사용자 알림함 슬라이스 (목록·미읽음 수·읽음 처리·삭제)
// 알림 생성 유스케이스도 여기 소속이며, dispatch 슬라이스가 Port 토큰으로 소비한다.
export const NOTIFICATION_INBOX_MODULE_IMPORTS = [NotificationSharedModule];

export const NOTIFICATION_INBOX_MODULE_CONTROLLERS = [
    NotificationListController,
    NotificationUnreadCountController,
    NotificationMarkReadController,
    NotificationMarkAllReadController,
    NotificationDeleteController,
];

export const NOTIFICATION_INBOX_MODULE_PROVIDERS = [
    GetNotificationsUseCase,
    GetUnreadNotificationCountUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    DeleteNotificationUseCase,
    CreateNotificationUseCase,
    CreateNotificationFromBuilderUseCase,
    NotificationPageAssemblerService,
    NotificationPaginationAssemblerService,
    NotificationStateResultMapperService,
    {
        provide: CREATE_NOTIFICATION_DISPATCH_USE_CASE,
        useExisting: CreateNotificationUseCase,
    },
    {
        provide: CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE,
        useExisting: CreateNotificationFromBuilderUseCase,
    },
];

// dispatch 슬라이스가 소비
export const NOTIFICATION_INBOX_MODULE_EXPORTS = [
    CREATE_NOTIFICATION_DISPATCH_USE_CASE,
    CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE,
];
