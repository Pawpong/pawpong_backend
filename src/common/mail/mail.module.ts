import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MailService } from './mail.service';
import { MailTemplateService } from './mail-template.service';
import { MAIL_SERVICE_TOKEN, MAIL_TEMPLATE_SERVICE_TOKEN } from './mail.token';

@Module({
    imports: [ConfigModule],
    providers: [
        MailService,
        MailTemplateService,
        {
            provide: MAIL_SERVICE_TOKEN,
            useExisting: MailService,
        },
        {
            provide: MAIL_TEMPLATE_SERVICE_TOKEN,
            useExisting: MailTemplateService,
        },
    ],
    exports: [MAIL_SERVICE_TOKEN, MAIL_TEMPLATE_SERVICE_TOKEN, MailService, MailTemplateService],
})
export class MailModule {}
