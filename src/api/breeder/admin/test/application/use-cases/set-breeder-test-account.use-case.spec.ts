import { ForbiddenException } from '@nestjs/common';

import { SetBreederTestAccountUseCase } from '../../../application/use-cases/set-breeder-test-account.use-case';
import { BreederAdminActivityLogFactoryService } from '../../../domain/services/breeder-admin-activity-log-factory.service';
import { BreederAdminPolicyService } from '../../../domain/services/breeder-admin-policy.service';
import { BreederAdminTestAccountResultMapperService } from '../../../domain/services/breeder-admin-test-account-result-mapper.service';

describe('브리더 테스트 계정 설정 유스케이스', () => {
    const breederAdminReader = {
        findAdminById: jest.fn(),
        findBreederById: jest.fn(),
    };
    const breederAdminWriter = {
        updateBreeder: jest.fn(),
        appendAdminActivityLog: jest.fn(),
    };

    const useCase = new SetBreederTestAccountUseCase(
        breederAdminReader as any,
        breederAdminWriter as any,
        new BreederAdminPolicyService(),
        new BreederAdminActivityLogFactoryService(),
        new BreederAdminTestAccountResultMapperService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('테스트 계정 설정 결과를 반환한다', async () => {
        breederAdminReader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            name: '관리자',
            permissions: { canManageBreeders: true },
        });
        breederAdminReader.findBreederById.mockResolvedValue({
            id: 'breeder-1',
            name: '행복한 강아지 농장',
            nickname: '행복브리더',
            accountStatus: 'active',
            isTestAccount: false,
        });

        const result = await useCase.execute('admin-1', 'breeder-1', true);

        expect(breederAdminWriter.updateBreeder).toHaveBeenCalledWith('breeder-1', { isTestAccount: true });
        expect(result).toEqual(
            expect.objectContaining({
                breederId: 'breeder-1',
                breederName: '행복한 강아지 농장',
                isTestAccount: true,
            }),
        );
    });

    it('권한이 없으면 예외를 던진다', async () => {
        breederAdminReader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            name: '관리자',
            permissions: { canManageBreeders: false },
        });

        await expect(useCase.execute('admin-1', 'breeder-1', true)).rejects.toThrow(
            new ForbiddenException('브리더 관리 권한이 없습니다.'),
        );
    });
});
