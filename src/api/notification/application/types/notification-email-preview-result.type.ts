/**
 * application/domain 계층 내부 결과 타입.
 * 컨트롤러 경계 밖으로 나가지 않으며 @ApiProperty 데코레이터에 의존하지 않는다.
 */

export interface NotificationEmailPreviewResult {
    recipient: string;
    subject: string;
    preview: string;
    sent: boolean;
}

export interface NotificationEmailTemplatePreviewResult {
    subject: string;
    html: string;
}

export interface NotificationEmailPreviewCatalogResult {
    breederApproval: NotificationEmailTemplatePreviewResult;
    breederRejection: NotificationEmailTemplatePreviewResult;
    newApplication: NotificationEmailTemplatePreviewResult;
    documentReminder: NotificationEmailTemplatePreviewResult;
    applicationConfirmation: NotificationEmailTemplatePreviewResult;
    newReview: NotificationEmailTemplatePreviewResult;
}
