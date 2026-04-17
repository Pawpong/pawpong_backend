import { GetNotificationEmailPreviewCatalogUseCase } from '../../../application/use-cases/get-notification-email-preview-catalog.use-case';
import { NotificationEmailPreviewTemplateService } from '../../../application/services/notification-email-preview-template.service';

function makeTemplate(label: string) {
    return { subject: `[포퐁] ${label}`, html: `<p>${label}</p>` };
}

function makeTemplateService(): NotificationEmailPreviewTemplateService {
    return {
        getBreederApprovalTemplate: jest.fn(),
        getBreederRejectionTemplate: jest.fn(),
        getNewApplicationTemplate: jest.fn(),
        getDocumentReminderTemplate: jest.fn(),
        getApplicationConfirmationTemplate: jest.fn(),
        getNewReviewTemplate: jest.fn(),
        getPreviewCatalog: jest.fn().mockReturnValue({
            breederApproval: makeTemplate('브리더 승인'),
            breederRejection: makeTemplate('브리더 반려'),
            newApplication: makeTemplate('신규 신청'),
            documentReminder: makeTemplate('서류 독촉'),
            applicationConfirmation: makeTemplate('신청 확인'),
            newReview: makeTemplate('신규 후기'),
        }),
        renderTemplate: jest.fn(),
    } as any;
}

describe('이메일 미리보기 카탈로그 조회 유스케이스', () => {
    it('전체 이메일 템플릿 카탈로그를 반환한다', () => {
        const templateService = makeTemplateService();
        const useCase = new GetNotificationEmailPreviewCatalogUseCase(templateService);

        const result = useCase.execute();

        expect(result.breederApproval).toBeDefined();
        expect(result.breederRejection).toBeDefined();
        expect(result.newApplication).toBeDefined();
        expect(result.documentReminder).toBeDefined();
        expect(result.applicationConfirmation).toBeDefined();
        expect(result.newReview).toBeDefined();
    });

    it('각 템플릿에 subject와 html이 포함된다', () => {
        const useCase = new GetNotificationEmailPreviewCatalogUseCase(makeTemplateService());

        const result = useCase.execute();

        expect(result.breederApproval.subject).toBe('[포퐁] 브리더 승인');
        expect(result.breederApproval.html).toBe('<p>브리더 승인</p>');
    });
});
