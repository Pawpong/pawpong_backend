import { Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import { MailService } from '../../../common/mail/mail.service';
import { EmailData } from '../builder/notification.builder';
import { NotificationEmailPort } from '../application/ports/notification-email.port';

@Injectable()
export class NotificationMailAdapter implements NotificationEmailPort {
    constructor(
        private readonly mailService: MailService,
        private readonly logger: CustomLoggerService,
    ) {}

    send(emailData: EmailData): boolean {
        this.logger.logStart('sendEmail', '이메일 발송 시작 (비동기)', {
            to: emailData.to,
            subject: emailData.subject,
        });

        this.mailService
            .sendMail({
                to: emailData.to,
                subject: emailData.subject,
                html: emailData.html,
            })
            .then((result) => {
                if (result) {
                    this.logger.logSuccess('sendEmail', '이메일 발송 완료', { to: emailData.to });
                    return;
                }

                this.logger.logWarning('sendEmail', '이메일 발송 실패 (MailService 반환값 false)', {
                    to: emailData.to,
                });
            })
            .catch((error) => {
                this.logger.logError('sendEmail', '이메일 발송 중 에러 발생', error);
            });

        return true;
    }
}
