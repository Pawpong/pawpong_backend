import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Notification } from '../../../../schema/notification.schema';

@Injectable()
export class NotificationAdminRepository {
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<Notification>,
    ) {}

    findPaged(query: Record<string, any>, page: number, limit: number) {
        const skip = (page - 1) * limit;

        return this.notificationModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
    }

    countDocuments(query: Record<string, any>): Promise<number> {
        return this.notificationModel.countDocuments(query).exec();
    }

    countAll(): Promise<number> {
        return this.notificationModel.countDocuments().exec();
    }

    countUnread(): Promise<number> {
        return this.notificationModel.countDocuments({ isRead: false }).exec();
    }

    aggregateByType() {
        return this.notificationModel.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                },
            },
        ]);
    }

    aggregateByRole() {
        return this.notificationModel.aggregate([
            {
                $group: {
                    _id: '$userRole',
                    count: { $sum: 1 },
                },
            },
        ]);
    }
}
