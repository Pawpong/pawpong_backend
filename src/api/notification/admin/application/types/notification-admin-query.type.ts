import { NotificationType } from '../../../../../schema/notification.schema';

export type NotificationAdminListQuery = {
    userId?: string;
    userRole?: 'adopter' | 'breeder';
    type?: NotificationType;
    isRead?: boolean;
    pageNumber?: number;
    itemsPerPage?: number;
};
