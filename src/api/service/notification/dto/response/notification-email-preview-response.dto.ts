import { ApiProperty } from '@nestjs/swagger';

export class NotificationEmailPreviewResponseDto {
    @ApiProperty({ description: '실제 발송 대상 이메일', example: 'breeder@test.com' })
    recipient: string;

    @ApiProperty({ description: '이메일 제목', example: '[포퐁] 브리더 입점이 승인되었습니다 🎉' })
    subject: string;

    @ApiProperty({ description: '이메일 HTML 미리보기', example: '<html><body>...</body></html>' })
    preview: string;

    @ApiProperty({ description: '발송 시작 여부', example: true })
    sent: boolean;
}

export class NotificationEmailTemplatePreviewDto {
    @ApiProperty({ description: '이메일 제목', example: '[포퐁] 브리더 입점이 승인되었습니다 🎉' })
    subject: string;

    @ApiProperty({ description: '이메일 HTML 본문', example: '<html><body>...</body></html>' })
    html: string;
}

export class NotificationEmailPreviewCatalogResponseDto {
    @ApiProperty({ type: NotificationEmailTemplatePreviewDto })
    breederApproval: NotificationEmailTemplatePreviewDto;

    @ApiProperty({ type: NotificationEmailTemplatePreviewDto })
    breederRejection: NotificationEmailTemplatePreviewDto;

    @ApiProperty({ type: NotificationEmailTemplatePreviewDto })
    newApplication: NotificationEmailTemplatePreviewDto;

    @ApiProperty({ type: NotificationEmailTemplatePreviewDto })
    documentReminder: NotificationEmailTemplatePreviewDto;

    @ApiProperty({ type: NotificationEmailTemplatePreviewDto })
    applicationConfirmation: NotificationEmailTemplatePreviewDto;

    @ApiProperty({ type: NotificationEmailTemplatePreviewDto })
    newReview: NotificationEmailTemplatePreviewDto;
}
