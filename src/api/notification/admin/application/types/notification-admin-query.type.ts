import { NotificationType } from '../../../../../common/enum/user.enum';

export type NotificationAdminListQuery = {
    userId?: string;
    userRole?: 'adopter' | 'breeder';
    type?: NotificationType;
    isRead?: boolean;
    pageNumber?: number;
    itemsPerPage?: number;
};
