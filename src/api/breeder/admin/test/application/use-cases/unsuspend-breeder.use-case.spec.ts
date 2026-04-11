import { BadRequestException } from '@nestjs/common';

import { UnsuspendBreederUseCase } from '../../../application/use-cases/unsuspend-breeder.use-case';
import { BreederAdminActivityLogFactoryService } from '../../../domain/services/breeder-admin-activity-log-factory.service';
import { BreederAdminPolicyService } from '../../../domain/services/breeder-admin-policy.service';
import { BreederAdminSuspensionPresentationService } from '../../../domain/services/breeder-admin-suspension-presentation.service';

describe('브리더 정지 해제 유스케이스', () => {
    const breederAdminReader = {
        findAdminById: jest.fn(),
        findBreederById: jest.fn(),
    };
    const breederAdminWriter = {
        updateBreeder: jest.fn(),
        appendAdminActivityLog: jest.fn(),
    };
    const breederAdminNotifier = {
        sendUnsuspensionEmail: jest.fn(),
    };

    const useCase = new UnsuspendBreederUseCase(
        breederAdminReader as any,
        breederAdminWriter as any,
        breederAdminNotifier as any,
        new BreederAdminPolicyService(),
        new BreederAdminActivityLogFactoryService(),
        new BreederAdminSuspensionPresentationService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정지 해제와 이메일 발송을 위임한다', async () => {
        breederAdminReader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            name: '관리자',
            permissions: { canManageBreeders: true },
        });
        breederAdminReader.findBreederById.mockResolvedValue({
            id: 'breeder-1',
            name: '행복농장',
            nickname: '행복브리더',
            emailAddress: 'breeder@test.com',
            accountStatus: 'suspended',
            isTestAccount: false,
        });

        const result = await useCase.execute('admin-1', 'breeder-1');

        expect(breederAdminWriter.updateBreeder).toHaveBeenCalledWith('breeder-1', {
            accountStatus: 'active',
            suspensionReason: undefined,
            suspendedAt: undefined,
        });
        expect(breederAdminNotifier.sendUnsuspensionEmail).toHaveBeenCalledWith({
            breederId: 'breeder-1',
            breederName: '행복브리더',
            emailAddress: 'breeder@test.com',
        });
        expect(result).toEqual({
            breederId: 'breeder-1',
            reason: undefined,
            suspendedAt: undefined,
            notificationSent: true,
        });
    });

    it('정지 상태가 아니면 예외를 던진다', async () => {
        breederAdminReader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            name: '관리자',
            permissions: { canManageBreeders: true },
        });
        breederAdminReader.findBreederById.mockResolvedValue({
            id: 'breeder-1',
            name: '행복농장',
            accountStatus: 'active',
            isTestAccount: false,
        });

        await expect(useCase.execute('admin-1', 'breeder-1')).rejects.toThrow(
            new BadRequestException('정지 상태가 아닌 계정입니다.'),
        );
    });
});
