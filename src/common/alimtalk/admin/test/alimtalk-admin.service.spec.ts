import { DomainConflictError, DomainNotFoundError } from '../../../../common/error/domain.error';
import { AlimtalkAdminService } from '../../../alimtalk/admin/alimtalk-admin.service';

describe('AlimtalkAdminService', () => {
    const createLeanQuery = <T>(value: T) => ({
        lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(value),
        }),
    });

    const createExecQuery = <T>(value: T) => ({
        exec: jest.fn().mockResolvedValue(value),
    });

    const createService = () => {
        const alimtalkTemplateModel = {
            findOne: jest.fn(),
            create: jest.fn(),
        };
        const alimtalkService = {
            refreshTemplateCache: jest.fn(),
        };

        const service = new AlimtalkAdminService(alimtalkTemplateModel as never, alimtalkService as never);

        return {
            service,
            alimtalkTemplateModel,
            alimtalkService,
        };
    };

    it('없는 템플릿 조회면 DomainNotFoundError를 던진다', async () => {
        const { service, alimtalkTemplateModel } = createService();
        alimtalkTemplateModel.findOne.mockReturnValue(createLeanQuery(null));

        await expect(service.getTemplateByCode('UNKNOWN')).rejects.toThrow(
            new DomainNotFoundError('템플릿을 찾을 수 없습니다: UNKNOWN'),
        );
    });

    it('중복 템플릿 생성이면 DomainConflictError를 던진다', async () => {
        const { service, alimtalkTemplateModel } = createService();
        alimtalkTemplateModel.findOne.mockReturnValue(createExecQuery({ templateCode: 'WELCOME' }));

        await expect(
            service.createTemplate({
                templateCode: 'WELCOME',
                templateId: 'template-id',
                name: '환영 템플릿',
                description: 'desc',
                requiredVariables: [],
                buttons: [],
            }),
        ).rejects.toThrow(new DomainConflictError('이미 존재하는 템플릿 코드입니다: WELCOME'));
    });

    it('캐시 갱신 실패는 원본 오류를 그대로 전파한다', async () => {
        const { service, alimtalkService } = createService();
        const refreshError = new Error('cache unavailable');
        alimtalkService.refreshTemplateCache.mockRejectedValue(refreshError);

        await expect(service.refreshCache()).rejects.toBe(refreshError);
    });
});
