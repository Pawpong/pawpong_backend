import { Body, Get, Header, Post, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import type { NotificationEmailPreviewType } from './constants/notification-email-preview.constants';
import { NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES } from './constants/notification-email-preview.constants';
import { GetNotificationEmailPreviewCatalogUseCase } from './application/use-cases/get-notification-email-preview-catalog.use-case';
import { PreviewApplicationConfirmationEmailUseCase } from './application/use-cases/preview-application-confirmation-email.use-case';
import { PreviewBreederApprovalEmailUseCase } from './application/use-cases/preview-breeder-approval-email.use-case';
import { PreviewBreederRejectionEmailUseCase } from './application/use-cases/preview-breeder-rejection-email.use-case';
import { PreviewDocumentReminderEmailUseCase } from './application/use-cases/preview-document-reminder-email.use-case';
import { PreviewNewApplicationEmailUseCase } from './application/use-cases/preview-new-application-email.use-case';
import { PreviewNewReviewEmailUseCase } from './application/use-cases/preview-new-review-email.use-case';
import { RenderNotificationEmailPreviewUseCase } from './application/use-cases/render-notification-email-preview.use-case';
import { NotificationEmailPreviewAdminController } from './decorator/notification-email-preview-admin-controller.decorator';
import {
    ApplicationConfirmationEmailPreviewRequestDto,
    BreederApprovalEmailPreviewRequestDto,
    BreederRejectionEmailPreviewRequestDto,
    DocumentReminderEmailPreviewRequestDto,
    NewApplicationEmailPreviewRequestDto,
    NewReviewEmailPreviewRequestDto,
} from './dto/request/notification-email-preview-request.dto';
import {
    NotificationEmailPreviewCatalogResponseDto,
    NotificationEmailPreviewResponseDto,
} from './dto/response/notification-email-preview-response.dto';
import {
    ApiGetNotificationEmailPreviewCatalogEndpoint,
    ApiPreviewApplicationConfirmationEmailEndpoint,
    ApiPreviewBreederApprovalEmailEndpoint,
    ApiPreviewBreederRejectionEmailEndpoint,
    ApiPreviewDocumentReminderEmailEndpoint,
    ApiPreviewNewApplicationEmailEndpoint,
    ApiPreviewNewReviewEmailEndpoint,
    ApiRenderNotificationEmailPreviewEndpoint,
} from './swagger';

@NotificationEmailPreviewAdminController()
export class NotificationEmailPreviewController {
    constructor(
        private readonly previewBreederApprovalEmailUseCase: PreviewBreederApprovalEmailUseCase,
        private readonly previewBreederRejectionEmailUseCase: PreviewBreederRejectionEmailUseCase,
        private readonly previewNewApplicationEmailUseCase: PreviewNewApplicationEmailUseCase,
        private readonly previewDocumentReminderEmailUseCase: PreviewDocumentReminderEmailUseCase,
        private readonly previewApplicationConfirmationEmailUseCase: PreviewApplicationConfirmationEmailUseCase,
        private readonly previewNewReviewEmailUseCase: PreviewNewReviewEmailUseCase,
        private readonly getNotificationEmailPreviewCatalogUseCase: GetNotificationEmailPreviewCatalogUseCase,
        private readonly renderNotificationEmailPreviewUseCase: RenderNotificationEmailPreviewUseCase,
    ) {}

    @Post('breeder-approval')
    @ApiPreviewBreederApprovalEmailEndpoint()
    async testBreederApprovalEmail(
        @Body() body: BreederApprovalEmailPreviewRequestDto,
    ): Promise<ApiResponseDto<NotificationEmailPreviewResponseDto>> {
        const result = this.previewBreederApprovalEmailUseCase.execute(body);
        return ApiResponseDto.success(result, NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.breederApprovalSent);
    }

    @Post('breeder-rejection')
    @ApiPreviewBreederRejectionEmailEndpoint()
    async testBreederRejectionEmail(
        @Body() body: BreederRejectionEmailPreviewRequestDto,
    ): Promise<ApiResponseDto<NotificationEmailPreviewResponseDto>> {
        const result = this.previewBreederRejectionEmailUseCase.execute(body);
        return ApiResponseDto.success(result, NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.breederRejectionSent);
    }

    @Post('new-application')
    @ApiPreviewNewApplicationEmailEndpoint()
    async testNewApplicationEmail(
        @Body() body: NewApplicationEmailPreviewRequestDto,
    ): Promise<ApiResponseDto<NotificationEmailPreviewResponseDto>> {
        const result = this.previewNewApplicationEmailUseCase.execute(body);
        return ApiResponseDto.success(result, NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.newApplicationSent);
    }

    @Post('document-reminder')
    @ApiPreviewDocumentReminderEmailEndpoint()
    async testDocumentReminderEmail(
        @Body() body: DocumentReminderEmailPreviewRequestDto,
    ): Promise<ApiResponseDto<NotificationEmailPreviewResponseDto>> {
        const result = this.previewDocumentReminderEmailUseCase.execute(body);
        return ApiResponseDto.success(result, NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.documentReminderSent);
    }

    @Post('application-confirmation')
    @ApiPreviewApplicationConfirmationEmailEndpoint()
    async testApplicationConfirmationEmail(
        @Body() body: ApplicationConfirmationEmailPreviewRequestDto,
    ): Promise<ApiResponseDto<NotificationEmailPreviewResponseDto>> {
        const result = this.previewApplicationConfirmationEmailUseCase.execute(body);
        return ApiResponseDto.success(result, NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.applicationConfirmationSent);
    }

    @Post('new-review')
    @ApiPreviewNewReviewEmailEndpoint()
    async testNewReviewEmail(
        @Body() body: NewReviewEmailPreviewRequestDto,
    ): Promise<ApiResponseDto<NotificationEmailPreviewResponseDto>> {
        const result = this.previewNewReviewEmailUseCase.execute(body);
        return ApiResponseDto.success(result, NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.newReviewSent);
    }

    @Get('preview-all')
    @ApiGetNotificationEmailPreviewCatalogEndpoint()
    async previewAllEmails(): Promise<ApiResponseDto<NotificationEmailPreviewCatalogResponseDto>> {
        const result = this.getNotificationEmailPreviewCatalogUseCase.execute();
        return ApiResponseDto.success(result, NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.previewCatalogRetrieved);
    }

    @Get('render')
    @Header('Content-Type', 'text/html; charset=utf-8')
    @ApiRenderNotificationEmailPreviewEndpoint()
    renderEmailTemplate(@Query('type') type?: NotificationEmailPreviewType): string {
        return this.renderNotificationEmailPreviewUseCase.execute(type);
    }
}
