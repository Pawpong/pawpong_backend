import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { UpdateFaqUseCase } from '../../../application/use-cases/update-faq.use-case';
import { HomeFaqCatalogService } from '../../../../domain/services/home-faq-catalog.service';

describe('홈 FAQ 수정 유스케이스', () => {
    it('FAQ가 있으면 결과를 반환한다', async () => {
        const useCase = new UpdateFaqUseCase(
            {
                updateFaq: jest.fn().mockResolvedValue({
                    id: 'faq-1',
                    question: '질문',
                    answer: '답변',
                    category: 'general',
                    userType: 'all',
                    order: 1,
                }),
            } as any,
            new HomeFaqCatalogService(),
        );

        await expect(useCase.execute('faq-1', { answer: '수정된 답변' })).resolves.toMatchObject({
            faqId: 'faq-1',
            answer: '답변',
        });
    });

    it('대상이 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new UpdateFaqUseCase(
            {
                updateFaq: jest.fn().mockResolvedValue(null),
            } as any,
            new HomeFaqCatalogService(),
        );

        await expect(useCase.execute('missing', {})).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
