import { Injectable } from '@nestjs/common';

import { MailTemplateService } from '../../../../common/mail/mail-template.service';
import type { NotificationEmailPreviewType } from '../../constants/notification-email-preview.constants';
import { NOTIFICATION_EMAIL_PREVIEW_TYPES } from '../../constants/notification-email-preview.constants';
import {
    NotificationEmailPreviewCatalogResponseDto,
    NotificationEmailTemplatePreviewDto,
} from '../../dto/response/notification-email-preview-response.dto';

@Injectable()
export class NotificationEmailPreviewTemplateService {
    constructor(private readonly mailTemplateService: MailTemplateService) {}

    getBreederApprovalTemplate(breederName: string): NotificationEmailTemplatePreviewDto {
        return this.mailTemplateService.getBreederApprovalEmail(breederName);
    }

    getBreederRejectionTemplate(breederName: string, rejectionReasons: string[]): NotificationEmailTemplatePreviewDto {
        return this.mailTemplateService.getBreederRejectionEmail(breederName, rejectionReasons);
    }

    getNewApplicationTemplate(breederName: string): NotificationEmailTemplatePreviewDto {
        return this.mailTemplateService.getNewApplicationEmail(breederName);
    }

    getDocumentReminderTemplate(breederName: string): NotificationEmailTemplatePreviewDto {
        return this.mailTemplateService.getDocumentReminderEmail(breederName);
    }

    getApplicationConfirmationTemplate(
        applicantName: string,
        breederName: string,
    ): NotificationEmailTemplatePreviewDto {
        return this.mailTemplateService.getApplicationConfirmationEmail(applicantName, breederName);
    }

    getNewReviewTemplate(breederName: string): NotificationEmailTemplatePreviewDto {
        return this.mailTemplateService.getNewReviewEmail(breederName);
    }

    getPreviewCatalog(): NotificationEmailPreviewCatalogResponseDto {
        return {
            breederApproval: this.getBreederApprovalTemplate('테스트 브리더'),
            breederRejection: this.getBreederRejectionTemplate('테스트 브리더', [
                '제출하신 사업자등록증이 유효하지 않습니다.',
                '동물등록증 사본이 누락되었습니다.',
            ]),
            newApplication: this.getNewApplicationTemplate('테스트 브리더'),
            documentReminder: this.getDocumentReminderTemplate('테스트 브리더'),
            applicationConfirmation: this.getApplicationConfirmationTemplate('테스트 입양자', '테스트 브리더'),
            newReview: this.getNewReviewTemplate('테스트 브리더'),
        };
    }

    renderTemplate(type?: NotificationEmailPreviewType): string {
        switch (type) {
            case 'breeder-approval':
                return this.getBreederApprovalTemplate('테스트 브리더').html;
            case 'breeder-rejection':
                return this.getBreederRejectionTemplate('테스트 브리더', [
                    '제출하신 사업자등록증이 유효하지 않습니다.',
                    '동물등록증 사본이 누락되었습니다.',
                ]).html;
            case 'new-application':
                return this.getNewApplicationTemplate('테스트 브리더').html;
            case 'document-reminder':
                return this.getDocumentReminderTemplate('테스트 브리더').html;
            case 'application-confirmation':
                return this.getApplicationConfirmationTemplate('테스트 입양자', '테스트 브리더').html;
            case 'new-review':
                return this.getNewReviewTemplate('테스트 브리더').html;
            default:
                return this.buildTemplateSelectionPage();
        }
    }

    private buildTemplateSelectionPage(): string {
        const labels: Record<(typeof NOTIFICATION_EMAIL_PREVIEW_TYPES)[number], string> = {
            'breeder-approval': '브리더 승인 이메일',
            'breeder-rejection': '브리더 반려 이메일',
            'new-application': '새로운 상담 신청 알림',
            'document-reminder': '서류 미제출 리마인드',
            'application-confirmation': '상담 신청 확인 (입양자용)',
            'new-review': '신규 후기 등록 알림',
        };

        const links = NOTIFICATION_EMAIL_PREVIEW_TYPES.map((type, index) => {
            return `
                <a href="/api/email-test/render?type=${type}" class="button">
                    ${index + 1}. ${labels[type]}
                </a>
            `;
        }).join('\n');

        return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>이메일 템플릿 미리보기</title>
    <style>
        body {
            font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4f3b2e;
            margin-bottom: 30px;
            text-align: center;
        }
        .button {
            display: block;
            background: #4f3b2e;
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>포퐁 이메일 템플릿 미리보기</h1>
        ${links}
    </div>
</body>
</html>
        `;
    }
}
