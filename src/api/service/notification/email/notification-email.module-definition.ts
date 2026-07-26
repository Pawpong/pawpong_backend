import { MailModule } from '../../../../common/mail/mail.module';

import { NotificationEmailPreviewController } from '../controller/notification-email-preview.controller';
import { SendNotificationEmailUseCase } from '../application/use-cases/send-notification-email.use-case';
import { GetNotificationEmailPreviewCatalogUseCase } from '../application/use-cases/get-notification-email-preview-catalog.use-case';
import { RenderNotificationEmailPreviewUseCase } from '../application/use-cases/render-notification-email-preview.use-case';
import { PreviewBreederApprovalEmailUseCase } from '../application/use-cases/preview-breeder-approval-email.use-case';
import { PreviewBreederRejectionEmailUseCase } from '../application/use-cases/preview-breeder-rejection-email.use-case';
import { PreviewNewApplicationEmailUseCase } from '../application/use-cases/preview-new-application-email.use-case';
import { PreviewDocumentReminderEmailUseCase } from '../application/use-cases/preview-document-reminder-email.use-case';
import { PreviewApplicationConfirmationEmailUseCase } from '../application/use-cases/preview-application-confirmation-email.use-case';
import { PreviewNewReviewEmailUseCase } from '../application/use-cases/preview-new-review-email.use-case';
import { NotificationEmailPreviewTemplateService } from '../application/services/notification-email-preview-template.service';
import { NotificationMailAdapter } from '../infrastructure/notification-mail.adapter';
import { NOTIFICATION_EMAIL_PORT } from '../application/ports/notification-email.port';
import { SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE } from '../application/tokens/notification-dispatch-use-case.token';

// 알림 > 이메일 슬라이스 (발송 + 관리자 템플릿 미리보기)
export const NOTIFICATION_EMAIL_MODULE_IMPORTS = [MailModule];

export const NOTIFICATION_EMAIL_MODULE_CONTROLLERS = [NotificationEmailPreviewController];

const NOTIFICATION_EMAIL_PREVIEW_USE_CASE_PROVIDERS = [
    GetNotificationEmailPreviewCatalogUseCase,
    RenderNotificationEmailPreviewUseCase,
    PreviewBreederApprovalEmailUseCase,
    PreviewBreederRejectionEmailUseCase,
    PreviewNewApplicationEmailUseCase,
    PreviewDocumentReminderEmailUseCase,
    PreviewApplicationConfirmationEmailUseCase,
    PreviewNewReviewEmailUseCase,
];

export const NOTIFICATION_EMAIL_MODULE_PROVIDERS = [
    SendNotificationEmailUseCase,
    ...NOTIFICATION_EMAIL_PREVIEW_USE_CASE_PROVIDERS,
    NotificationEmailPreviewTemplateService,
    NotificationMailAdapter,
    {
        provide: NOTIFICATION_EMAIL_PORT,
        useExisting: NotificationMailAdapter,
    },
    {
        provide: SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE,
        useExisting: SendNotificationEmailUseCase,
    },
];

// dispatch 슬라이스가 소비
export const NOTIFICATION_EMAIL_MODULE_EXPORTS = [SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE];
