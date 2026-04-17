import { PreviewBreederApprovalEmailUseCase } from '../../../application/use-cases/preview-breeder-approval-email.use-case';
import { PreviewBreederRejectionEmailUseCase } from '../../../application/use-cases/preview-breeder-rejection-email.use-case';
import { PreviewNewApplicationEmailUseCase } from '../../../application/use-cases/preview-new-application-email.use-case';
import { PreviewDocumentReminderEmailUseCase } from '../../../application/use-cases/preview-document-reminder-email.use-case';
import { PreviewApplicationConfirmationEmailUseCase } from '../../../application/use-cases/preview-application-confirmation-email.use-case';
import { PreviewNewReviewEmailUseCase } from '../../../application/use-cases/preview-new-review-email.use-case';
import { SendNotificationEmailUseCase } from '../../../application/use-cases/send-notification-email.use-case';
import { NotificationEmailPreviewTemplateService } from '../../../application/services/notification-email-preview-template.service';

function makeTemplateService(html = '<p>preview</p>', subject = '이메일 제목'): NotificationEmailPreviewTemplateService {
    return {
        getBreederApprovalTemplate: jest.fn().mockReturnValue({ subject, html }),
        getBreederRejectionTemplate: jest.fn().mockReturnValue({ subject, html }),
        getNewApplicationTemplate: jest.fn().mockReturnValue({ subject, html }),
        getDocumentReminderTemplate: jest.fn().mockReturnValue({ subject, html }),
        getApplicationConfirmationTemplate: jest.fn().mockReturnValue({ subject, html }),
        getNewReviewTemplate: jest.fn().mockReturnValue({ subject, html }),
        getPreviewCatalog: jest.fn(),
        renderTemplate: jest.fn(),
    } as any;
}

function makeSendUseCase(sent = true): SendNotificationEmailUseCase {
    return { execute: jest.fn().mockReturnValue(sent) } as any;
}

describe('이메일 미리보기 유스케이스 공통', () => {
    const baseRequest = { email: 'test@example.com', breederName: '행복브리더' };

    describe('브리더 승인 이메일 미리보기', () => {
        it('이메일 미리보기 결과를 반환하고 발송한다', () => {
            const templateService = makeTemplateService();
            const sendUseCase = makeSendUseCase();
            const useCase = new PreviewBreederApprovalEmailUseCase(templateService, sendUseCase);

            const result = useCase.execute(baseRequest);

            expect(result.recipient).toBe('test@example.com');
            expect(result.subject).toBe('이메일 제목');
            expect(result.preview).toBe('<p>preview</p>');
            expect(result.sent).toBe(true);
        });

        it('이메일 발송 실패 시 sent가 false다', () => {
            const useCase = new PreviewBreederApprovalEmailUseCase(makeTemplateService(), makeSendUseCase(false));

            const result = useCase.execute(baseRequest);

            expect(result.sent).toBe(false);
        });
    });

    describe('브리더 거절 이메일 미리보기', () => {
        it('거절 사유와 함께 미리보기 결과를 반환한다', () => {
            const templateService = makeTemplateService();
            const useCase = new PreviewBreederRejectionEmailUseCase(templateService, makeSendUseCase());

            const result = useCase.execute({
                ...baseRequest,
                rejectionReasons: ['사유1', '사유2'],
            });

            expect(result.recipient).toBe('test@example.com');
            expect(result.sent).toBe(true);
            expect(templateService.getBreederRejectionTemplate).toHaveBeenCalledWith('행복브리더', ['사유1', '사유2']);
        });
    });

    describe('신규 신청 이메일 미리보기', () => {
        it('미리보기 결과를 반환한다', () => {
            const useCase = new PreviewNewApplicationEmailUseCase(makeTemplateService(), makeSendUseCase());

            const result = useCase.execute(baseRequest);

            expect(result.recipient).toBe('test@example.com');
        });
    });

    describe('서류 독촉 이메일 미리보기', () => {
        it('미리보기 결과를 반환한다', () => {
            const useCase = new PreviewDocumentReminderEmailUseCase(makeTemplateService(), makeSendUseCase());

            const result = useCase.execute(baseRequest);

            expect(result.subject).toBe('이메일 제목');
        });
    });

    describe('신청 확인 이메일 미리보기', () => {
        it('입양자·브리더 이름을 포함한 미리보기 결과를 반환한다', () => {
            const templateService = makeTemplateService();
            const useCase = new PreviewApplicationConfirmationEmailUseCase(templateService, makeSendUseCase());

            const result = useCase.execute({
                email: 'adopter@example.com',
                applicantName: '김입양',
                breederName: '행복브리더',
            });

            expect(result.recipient).toBe('adopter@example.com');
            expect(templateService.getApplicationConfirmationTemplate).toHaveBeenCalledWith('김입양', '행복브리더');
        });
    });

    describe('신규 후기 이메일 미리보기', () => {
        it('미리보기 결과를 반환한다', () => {
            const useCase = new PreviewNewReviewEmailUseCase(makeTemplateService(), makeSendUseCase());

            const result = useCase.execute(baseRequest);

            expect(result.preview).toBe('<p>preview</p>');
        });
    });
});
