import { RenderNotificationEmailPreviewUseCase } from '../../../application/use-cases/render-notification-email-preview.use-case';
import { NotificationEmailPreviewTemplateService } from '../../../application/services/notification-email-preview-template.service';

function makeTemplateService(): NotificationEmailPreviewTemplateService {
    return {
        getBreederApprovalTemplate: jest.fn(),
        getBreederRejectionTemplate: jest.fn(),
        getNewApplicationTemplate: jest.fn(),
        getDocumentReminderTemplate: jest.fn(),
        getApplicationConfirmationTemplate: jest.fn(),
        getNewReviewTemplate: jest.fn(),
        getPreviewCatalog: jest.fn(),
        renderTemplate: jest.fn().mockImplementation((type?: string) => {
            if (!type) return '<p>default</p>';
            return `<p>${type}</p>`;
        }),
    } as any;
}

describe('이메일 HTML 미리보기 렌더링 유스케이스', () => {
    it('타입 없이 호출하면 기본 HTML을 반환한다', () => {
        const useCase = new RenderNotificationEmailPreviewUseCase(makeTemplateService());

        const result = useCase.execute();

        expect(result).toBe('<p>default</p>');
    });

    it('타입을 지정하면 해당 템플릿 HTML을 반환한다', () => {
        const useCase = new RenderNotificationEmailPreviewUseCase(makeTemplateService());

        const result = useCase.execute('breeder-approval');

        expect(result).toBe('<p>breeder-approval</p>');
    });

    it('타입을 renderTemplate 서비스에 그대로 전달한다', () => {
        const templateService = makeTemplateService();
        const useCase = new RenderNotificationEmailPreviewUseCase(templateService);

        useCase.execute('new-review');

        expect(templateService.renderTemplate).toHaveBeenCalledWith('new-review');
    });
});
