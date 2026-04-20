import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../common/error/domain.error';
import { NotificationType } from '../../../../common/enum/user.enum';
import { NOTIFICATION_MESSAGES } from '../../constants/notification-message.constant';
import type { NotificationMetadata } from '../../types/notification-metadata.type';

@Injectable()
export class NotificationMessageTemplateService {
    render(type: NotificationType, metadata?: NotificationMetadata): { title: string; body: string } {
        const template = NOTIFICATION_MESSAGES[type];
        if (!template) {
            throw new DomainValidationError(`알 수 없는 알림 타입: ${type}`);
        }

        let title = template.title;
        let body = template.body;

        if (!metadata) {
            return { title, body };
        }

        Object.entries(metadata).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            title = title.replace(placeholder, String(value));
            body = body.replace(placeholder, String(value));
        });

        return { title, body };
    }
}
