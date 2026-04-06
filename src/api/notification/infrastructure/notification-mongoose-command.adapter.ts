import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Notification } from '../../../schema/notification.schema';
import { NotificationCommandPort, NotificationCreateCommand } from '../application/ports/notification-command.port';

@Injectable()
export class NotificationMongooseCommandAdapter implements NotificationCommandPort {
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<Notification>,
    ) {}

    async create(command: NotificationCreateCommand): Promise<Notification> {
        const notification = new this.notificationModel({
            userId: command.userId,
            userRole: command.userRole,
            type: command.type,
            title: command.title,
            body: command.body,
            metadata: command.metadata,
            targetUrl: command.targetUrl,
            isRead: command.isRead ?? false,
        });

        await notification.save();

        return notification;
    }
}
