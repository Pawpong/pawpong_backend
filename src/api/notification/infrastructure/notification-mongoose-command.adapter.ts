import { Injectable } from '@nestjs/common';
import { NotificationCommandPort, NotificationCreateCommand } from '../application/ports/notification-command.port';
import { NotificationRepository } from '../repository/notification.repository';
import type { NotificationDocumentRecord } from '../types/notification-record.type';

@Injectable()
export class NotificationMongooseCommandAdapter implements NotificationCommandPort {
    constructor(private readonly notificationRepository: NotificationRepository) {}

    async create(command: NotificationCreateCommand): Promise<NotificationDocumentRecord> {
        return this.notificationRepository.create(command);
    }
}
