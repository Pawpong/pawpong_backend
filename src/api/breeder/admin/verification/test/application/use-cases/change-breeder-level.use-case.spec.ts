import { DomainAuthorizationError } from '../../../../../../../common/error/domain.error';
import { ChangeBreederLevelUseCase } from '../../../application/use-cases/change-breeder-level.use-case';
import { BreederVerificationAdminCommandResultMapperService } from '../../../domain/services/breeder-verification-admin-command-result-mapper.service';
import { BreederVerificationAdminPolicyService } from '../../../domain/services/breeder-verification-admin-policy.service';

describe('브리더 레벨 변경 유스케이스', () => {
    const reader = {
        findAdminById: jest.fn(),
        findBreederById: jest.fn(),
    };
    const writer = {
        updateBreederLevel: jest.fn(),
    };
    const useCase = new ChangeBreederLevelUseCase(
        reader as any,
        writer as any,
        new BreederVerificationAdminPolicyService(),
        new BreederVerificationAdminCommandResultMapperService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('브리더 레벨을 변경하고 응답을 만든다', async () => {
        reader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            name: '운영자',
            permissions: { canManageBreeders: true },
        });
        reader.findBreederById.mockResolvedValue({
            id: 'breeder-1',
            nickname: '행복브리더',
            verification: { level: 'new' },
        });

        const result = await useCase.execute('admin-1', 'breeder-1', {
            newLevel: 'elite' as any,
        });

        expect(writer.updateBreederLevel).toHaveBeenCalledWith('breeder-1', 'elite');
        expect(result).toEqual(
            expect.objectContaining({
                breederId: 'breeder-1',
                previousLevel: 'new',
                newLevel: 'elite',
                changedBy: '운영자',
            }),
        );
    });

    it('권한이 없으면 예외를 던진다', async () => {
        reader.findAdminById.mockResolvedValue(null);

        await expect(
            useCase.execute('admin-1', 'breeder-1', {
                newLevel: 'elite' as any,
            }),
        ).rejects.toThrow(new DomainAuthorizationError('Access denied'));
    });
});
