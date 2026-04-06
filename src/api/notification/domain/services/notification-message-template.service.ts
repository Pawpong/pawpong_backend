import { BadRequestException, Injectable } from '@nestjs/common';

import { NotificationType, NOTIFICATION_MESSAGES } from '../../../../schema/notification.schema';

@Injectable()
export class NotificationMessageTemplateService {
    render(type: NotificationType, metadata?: Record<string, any>): { title: string; body: string } {
        const template = NOTIFICATION_MESSAGES[type];
        if (!template) {
            throw new BadRequestException(`알 수 없는 알림 타입: ${type}`);
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
