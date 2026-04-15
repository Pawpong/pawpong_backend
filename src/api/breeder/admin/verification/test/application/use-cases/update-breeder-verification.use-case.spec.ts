import { DomainValidationError } from '../../../../../../../common/error/domain.error';
import { UpdateBreederVerificationUseCase } from '../../../application/use-cases/update-breeder-verification.use-case';
import { BreederVerificationAdminActivityLogFactoryService } from '../../../domain/services/breeder-verification-admin-activity-log-factory.service';
import { BreederVerificationAdminPolicyService } from '../../../domain/services/breeder-verification-admin-policy.service';

describe('브리더 인증 수정 유스케이스', () => {
    const reader = {
        findAdminById: jest.fn(),
        findBreederById: jest.fn(),
    };
    const writer = {
        updateBreederVerification: jest.fn(),
        appendAdminActivityLog: jest.fn(),
    };
    const notifier = {
        sendApproval: jest.fn(),
        sendRejection: jest.fn(),
    };

    const useCase = new UpdateBreederVerificationUseCase(
        reader as any,
        writer as any,
        notifier as any,
        new BreederVerificationAdminPolicyService(),
        new BreederVerificationAdminActivityLogFactoryService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('레벨 변경 승인 시 이력과 승인 알림을 함께 처리한다', async () => {
        reader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            name: '관리자',
            permissions: { canManageBreeders: true },
        });
        reader.findBreederById.mockResolvedValue({
            id: 'breeder-1',
            nickname: '행복브리더',
            emailAddress: 'breeder@test.com',
            verification: {
                status: 'reviewing',
                isLevelChangeRequested: true,
                levelChangeRequest: {
                    previousLevel: 'new',
                    requestedLevel: 'elite',
                    requestedAt: new Date('2024-01-01T00:00:00.000Z'),
                },
            },
        });

        const result = await useCase.execute('admin-1', 'breeder-1', {
            verificationStatus: 'approved' as any,
        });

        expect(writer.updateBreederVerification).toHaveBeenCalledWith(
            'breeder-1',
            expect.objectContaining({
                verificationStatus: 'approved',
                clearLevelChangeRequest: true,
                appendLevelChangeHistory: expect.objectContaining({
                    previousLevel: 'new',
                    newLevel: 'elite',
                    approvedBy: 'admin-1',
                }),
            }),
        );
        expect(notifier.sendApproval).toHaveBeenCalledWith({
            breederId: 'breeder-1',
            breederName: '행복브리더',
            emailAddress: 'breeder@test.com',
        });
        expect(result).toEqual({ message: 'Breeder verification approved' });
    });

    it('검증 정보가 없으면 예외를 던진다', async () => {
        reader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            name: '관리자',
            permissions: { canManageBreeders: true },
        });
        reader.findBreederById.mockResolvedValue({
            id: 'breeder-1',
            nickname: '행복브리더',
            emailAddress: 'breeder@test.com',
        });

        await expect(
            useCase.execute('admin-1', 'breeder-1', {
                verificationStatus: 'approved' as any,
            }),
        ).rejects.toThrow(new DomainValidationError('No verification request found'));
    });
});
