import { Injectable } from '@nestjs/common';
import { NotificationCommandPort, NotificationCreateCommand } from '../application/ports/notification-command.port';
import { Notification } from '../../../schema/notification.schema';
import { NotificationRepository } from '../repository/notification.repository';

@Injectable()
export class NotificationMongooseCommandAdapter implements NotificationCommandPort {
    constructor(private readonly notificationRepository: NotificationRepository) {}

    async create(command: NotificationCreateCommand): Promise<Notification> {
        return this.notificationRepository.create(command);
    }
}
