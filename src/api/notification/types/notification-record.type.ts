import { NotificationType } from '../../../common/enum/user.enum';
import type { NotificationMetadata } from './notification-metadata.type';

export type NotificationObjectIdLike = {
    toString(): string;
};

export type NotificationDocumentRecord = {
    _id: NotificationObjectIdLike;
    userId: string;
    userRole: 'adopter' | 'breeder';
    type: NotificationType;
    title: string;
    body: string;
    metadata?: NotificationMetadata;
    isRead: boolean;
    readAt?: Date;
    targetUrl?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type NotificationStatsAggregateRecord = {
    _id: string;
    count: number;
};
