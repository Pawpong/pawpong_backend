import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Notification } from '../../../../schema/notification.schema';
import type { NotificationDocumentRecord, NotificationStatsAggregateRecord } from '../../types/notification-record.type';

@Injectable()
export class NotificationAdminRepository {
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<Notification>,
    ) {}

    findPaged(query: FilterQuery<Notification>, page: number, limit: number): Promise<NotificationDocumentRecord[]> {
        const skip = (page - 1) * limit;

        return this.notificationModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean<NotificationDocumentRecord[]>()
            .exec();
    }

    countDocuments(query: FilterQuery<Notification>): Promise<number> {
        return this.notificationModel.countDocuments(query).exec();
    }

    countAll(): Promise<number> {
        return this.notificationModel.countDocuments().exec();
    }

    countUnread(): Promise<number> {
        return this.notificationModel.countDocuments({ isRead: false }).exec();
    }

    aggregateByType(): Promise<NotificationStatsAggregateRecord[]> {
        return this.notificationModel.aggregate<NotificationStatsAggregateRecord>([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                },
            },
        ]);
    }

    aggregateByRole(): Promise<NotificationStatsAggregateRecord[]> {
        return this.notificationModel.aggregate<NotificationStatsAggregateRecord>([
            {
                $group: {
                    _id: '$userRole',
                    count: { $sum: 1 },
                },
            },
        ]);
    }
}
