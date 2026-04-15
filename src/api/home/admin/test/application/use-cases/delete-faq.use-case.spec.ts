import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { DeleteFaqUseCase } from '../../../application/use-cases/delete-faq.use-case';

describe('홈 FAQ 삭제 유스케이스', () => {
    it('존재하는 FAQ면 삭제한다', async () => {
        const homeAdminManager = {
            deleteFaq: jest.fn().mockResolvedValue(true),
        };
        const useCase = new DeleteFaqUseCase(homeAdminManager as any);

        await expect(useCase.execute('faq-1')).resolves.toBeUndefined();
        expect(homeAdminManager.deleteFaq).toHaveBeenCalledWith('faq-1');
    });

    it('대상이 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new DeleteFaqUseCase({
            deleteFaq: jest.fn().mockResolvedValue(false),
        } as any);

        await expect(useCase.execute('missing')).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
