import { Controller, Post, Body, Get, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MailService } from '../../../common/mail/mail.service';
import { MailTemplateService } from '../../../common/mail/mail-template.service';

/**
 * 이메일 테스트 컨트롤러 (개발/테스트용)
 *
 * 각 이메일 템플릿을 미리 확인하고 테스트 발송할 수 있습니다.
 *
 * **이메일 발송 플로우:**
 * 1. 브리더 승인/반려 → 브리더 인증 관리에서 발송
 * 2. 새 상담 신청 → 입양자가 신청 시 브리더에게 발송
 * 3. 서류 미제출 리마인드 → 브리더 관리에서 발송
 * 4. 상담 신청 확인 → 입양자 신청 시 입양자에게 발송
 */
@ApiTags('이메일 테스트')
@Controller('email-test')
export class EmailTestController {
    constructor(
        private readonly mailService: MailService,
        private readonly mailTemplateService: MailTemplateService,
    ) {}

    /**
     * [1] 브리더 승인 이메일 테스트
     */
    @Post('breeder-approval')
    @ApiEndpoint({
        summary: '브리더 승인 이메일 테스트',
        description: '브리더 입점 승인 이메일 템플릿을 테스트 발송합니다.',
        isPublic: true,
    })
    async testBreederApprovalEmail(
        @Body() body: { email: string; breederName: string },
    ): Promise<ApiResponseDto<{ preview: string }>> {
        const { subject, html } = this.mailTemplateService.getBreederApprovalEmail(body.breederName);

        // 실제 이메일 발송
        await this.mailService.sendMail({
            to: body.email,
            subject,
            html,
        });

        return ApiResponseDto.success({ preview: html }, `${body.email}로 브리더 승인 이메일이 발송되었습니다.`);
    }

    /**
     * [2] 브리더 반려 이메일 테스트
     */
    @Post('breeder-rejection')
    @ApiEndpoint({
        summary: '브리더 반려 이메일 테스트',
        description: '브리더 입점 반려 이메일 템플릿을 테스트 발송합니다.',
        isPublic: true,
    })
    async testBreederRejectionEmail(
        @Body() body: { email: string; breederName: string; rejectionReasons: string[] },
    ): Promise<ApiResponseDto<{ preview: string }>> {
        const { subject, html } = this.mailTemplateService.getBreederRejectionEmail(
            body.breederName,
            body.rejectionReasons,
        );

        await this.mailService.sendMail({
            to: body.email,
            subject,
            html,
        });

        return ApiResponseDto.success({ preview: html }, `${body.email}로 브리더 반려 이메일이 발송되었습니다.`);
    }

    /**
     * [3] 새로운 상담 신청 알림 이메일 테스트
     */
    @Post('new-application')
    @ApiEndpoint({
        summary: '새로운 상담 신청 알림 이메일 테스트',
        description: '브리더에게 새 입양 상담 신청이 왔을 때 발송되는 이메일을 테스트합니다.',
        isPublic: true,
    })
    async testNewApplicationEmail(
        @Body() body: { email: string; breederName: string },
    ): Promise<ApiResponseDto<{ preview: string }>> {
        const { subject, html } = this.mailTemplateService.getNewApplicationEmail(body.breederName);

        await this.mailService.sendMail({
            to: body.email,
            subject,
            html,
        });

        return ApiResponseDto.success(
            { preview: html },
            `${body.email}로 새로운 상담 신청 알림 이메일이 발송되었습니다.`,
        );
    }

    /**
     * [4] 서류 미제출 리마인드 이메일 테스트
     */
    @Post('document-reminder')
    @ApiEndpoint({
        summary: '서류 미제출 리마인드 이메일 테스트',
        description: '브리더 서류 미제출 리마인드 이메일을 테스트합니다.',
        isPublic: true,
    })
    async testDocumentReminderEmail(
        @Body() body: { email: string; breederName: string },
    ): Promise<ApiResponseDto<{ preview: string }>> {
        const { subject, html } = this.mailTemplateService.getDocumentReminderEmail(body.breederName);

        await this.mailService.sendMail({
            to: body.email,
            subject,
            html,
        });

        return ApiResponseDto.success(
            { preview: html },
            `${body.email}로 서류 미제출 리마인드 이메일이 발송되었습니다.`,
        );
    }

    /**
     * [5] 상담 신청 확인 이메일 테스트 (입양자용)
     */
    @Post('application-confirmation')
    @ApiEndpoint({
        summary: '상담 신청 확인 이메일 테스트',
        description: '입양자가 상담 신청 후 받는 확인 이메일을 테스트합니다.',
        isPublic: true,
    })
    async testApplicationConfirmationEmail(
        @Body() body: { email: string; applicantName: string; breederName: string },
    ): Promise<ApiResponseDto<{ preview: string }>> {
        const { subject, html } = this.mailTemplateService.getApplicationConfirmationEmail(
            body.applicantName,
            body.breederName,
        );

        await this.mailService.sendMail({
            to: body.email,
            subject,
            html,
        });

        return ApiResponseDto.success({ preview: html }, `${body.email}로 상담 신청 확인 이메일이 발송되었습니다.`);
    }

    /**
     * [6] 신규 후기 등록 이메일 테스트 (브리더용)
     */
    @Post('new-review')
    @ApiEndpoint({
        summary: '신규 후기 등록 이메일 테스트',
        description: '브리더에게 새 후기가 등록되었을 때 발송되는 이메일을 테스트합니다.',
        isPublic: true,
    })
    async testNewReviewEmail(
        @Body() body: { email: string; breederName: string },
    ): Promise<ApiResponseDto<{ preview: string }>> {
        const { subject, html } = this.mailTemplateService.getNewReviewEmail(body.breederName);

        await this.mailService.sendMail({
            to: body.email,
            subject,
            html,
        });

        return ApiResponseDto.success({ preview: html }, `${body.email}로 신규 후기 등록 이메일이 발송되었습니다.`);
    }

    /**
     * [7] 모든 이메일 템플릿 미리보기 (HTML 반환)
     */
    @Get('preview-all')
    @ApiEndpoint({
        summary: '모든 이메일 템플릿 미리보기',
        description: '모든 이메일 템플릿의 HTML을 반환합니다 (발송하지 않음).',
        isPublic: true,
    })
    async previewAllEmails(): Promise<ApiResponseDto<any>> {
        const templates = {
            breederApproval: this.mailTemplateService.getBreederApprovalEmail('테스트 브리더'),
            breederRejection: this.mailTemplateService.getBreederRejectionEmail('테스트 브리더', [
                '제출하신 사업자등록증이 유효하지 않습니다.',
                '동물등록증 사본이 누락되었습니다.',
            ]),
            newApplication: this.mailTemplateService.getNewApplicationEmail('테스트 브리더'),
            documentReminder: this.mailTemplateService.getDocumentReminderEmail('테스트 브리더'),
            applicationConfirmation: this.mailTemplateService.getApplicationConfirmationEmail(
                '테스트 입양자',
                '테스트 브리더',
            ),
            newReview: this.mailTemplateService.getNewReviewEmail('테스트 브리더'),
        };

        return ApiResponseDto.success(templates, '모든 이메일 템플릿 미리보기');
    }

    /**
     * [8] HTML 렌더링 미리보기 (브라우저에서 직접 확인)
     */
    @Get('render')
    @ApiEndpoint({
        summary: 'HTML 렌더링 미리보기',
        description: '이메일 템플릿을 브라우저에서 직접 렌더링합니다. ?type=파라미터로 템플릿 선택',
        isPublic: true,
    })
    async renderEmailTemplate(@Query('type') type: string, @Res() res: Response): Promise<void> {
        let html: string;

        switch (type) {
            case 'breeder-approval':
                html = this.mailTemplateService.getBreederApprovalEmail('테스트 브리더').html;
                break;
            case 'breeder-rejection':
                html = this.mailTemplateService.getBreederRejectionEmail('테스트 브리더', [
                    '제출하신 사업자등록증이 유효하지 않습니다.',
                    '동물등록증 사본이 누락되었습니다.',
                ]).html;
                break;
            case 'new-application':
                html = this.mailTemplateService.getNewApplicationEmail('테스트 브리더').html;
                break;
            case 'document-reminder':
                html = this.mailTemplateService.getDocumentReminderEmail('테스트 브리더').html;
                break;
            case 'application-confirmation':
                html = this.mailTemplateService.getApplicationConfirmationEmail('테스트 입양자', '테스트 브리더').html;
                break;
            case 'new-review':
                html = this.mailTemplateService.getNewReviewEmail('테스트 브리더').html;
                break;
            default:
                // 선택 페이지
                html = `
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
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
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
            transition: background 0.3s;
        }
        .button:hover {
            background: #3f2f25;
        }
        .description {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐾 포퐁 이메일 템플릿 미리보기</h1>

        <a href="/api/email-test/render?type=breeder-approval" class="button">
            1️⃣ 브리더 승인 이메일
        </a>
        <p class="description">브리더 입점이 승인되었을 때 발송되는 이메일</p>

        <a href="/api/email-test/render?type=breeder-rejection" class="button">
            2️⃣ 브리더 반려 이메일
        </a>
        <p class="description">브리더 입점이 반려되었을 때 발송되는 이메일</p>

        <a href="/api/email-test/render?type=new-application" class="button">
            3️⃣ 새로운 상담 신청 알림
        </a>
        <p class="description">입양자가 상담 신청했을 때 브리더에게 발송되는 이메일</p>

        <a href="/api/email-test/render?type=document-reminder" class="button">
            4️⃣ 서류 미제출 리마인드
        </a>
        <p class="description">브리더가 서류를 제출하지 않았을 때 발송되는 이메일</p>

        <a href="/api/email-test/render?type=application-confirmation" class="button">
            5️⃣ 상담 신청 확인 (입양자용)
        </a>
        <p class="description">입양자가 상담 신청 후 받는 확인 이메일</p>

        <a href="/api/email-test/render?type=new-review" class="button">
            6️⃣ 신규 후기 등록 알림 (브리더용)
        </a>
        <p class="description">브리더에게 새 후기가 등록되었을 때 발송되는 이메일</p>
    </div>
</body>
</html>
                `;
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
}
