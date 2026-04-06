import { ForbiddenException } from '@nestjs/common';

import { ChangeBreederLevelUseCase } from './change-breeder-level.use-case';
import { BreederVerificationAdminPolicyService } from '../../domain/services/breeder-verification-admin-policy.service';
import { BreederVerificationAdminPresentationService } from '../../domain/services/breeder-verification-admin-presentation.service';

describe('ChangeBreederLevelUseCase', () => {
    const reader = {
        findAdminById: jest.fn(),
        findBreederById: jest.fn(),
    };
    const writer = {
        updateBreederLevel: jest.fn(),
    };
    const presentationService = {
        toLevelChangeResponse: jest.fn(
            (breeder: any, previousLevel: string, newLevel: string, changedAt: Date, changedBy: string) => ({
                breederId: breeder.id,
                breederName: breeder.nickname,
                previousLevel,
                newLevel,
                changedAt,
                changedBy,
            }),
        ),
    };

    const useCase = new ChangeBreederLevelUseCase(
        reader as any,
        writer as any,
        new BreederVerificationAdminPolicyService(),
        presentationService as any,
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
        ).rejects.toThrow(new ForbiddenException('Access denied'));
    });
});
