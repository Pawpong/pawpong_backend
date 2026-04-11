import { BadRequestException } from '@nestjs/common';

import { SuspendBreederUseCase } from '../../../application/use-cases/suspend-breeder.use-case';
import { BreederAdminActivityLogFactoryService } from '../../../domain/services/breeder-admin-activity-log-factory.service';
import { BreederAdminPolicyService } from '../../../domain/services/breeder-admin-policy.service';
import { BreederAdminSuspensionResultMapperService } from '../../../domain/services/breeder-admin-suspension-result-mapper.service';

describe('브리더 정지 유스케이스', () => {
    const breederAdminReader = {
        findAdminById: jest.fn(),
        findBreederById: jest.fn(),
    };
    const breederAdminWriter = {
        updateBreeder: jest.fn(),
        appendAdminActivityLog: jest.fn(),
    };
    const breederAdminNotifier = {
        sendSuspensionEmail: jest.fn(),
    };

    const useCase = new SuspendBreederUseCase(
        breederAdminReader as any,
        breederAdminWriter as any,
        breederAdminNotifier as any,
        new BreederAdminPolicyService(),
        new BreederAdminActivityLogFactoryService(),
        new BreederAdminSuspensionResultMapperService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정지 처리와 이메일 발송을 위임한다', async () => {
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
            accountStatus: 'active',
            isTestAccount: false,
            verification: { status: 'approved' },
        });

        const result = await useCase.execute('admin-1', 'breeder-1', {
            reason: '운영 정책 위반',
        });

        expect(breederAdminWriter.updateBreeder).toHaveBeenCalledWith(
            'breeder-1',
            expect.objectContaining({
                accountStatus: 'suspended',
                suspensionReason: '운영 정책 위반',
            }),
        );
        expect(breederAdminNotifier.sendSuspensionEmail).toHaveBeenCalledWith(
            {
                breederId: 'breeder-1',
                breederName: '행복브리더',
                emailAddress: 'breeder@test.com',
            },
            '운영 정책 위반',
        );
        expect(result).toEqual(
            expect.objectContaining({
                breederId: 'breeder-1',
                reason: '운영 정책 위반',
                notificationSent: true,
            }),
        );
    });

    it('이미 정지된 계정이면 예외를 던진다', async () => {
        breederAdminReader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            name: '관리자',
            permissions: { canManageBreeders: true },
        });
        breederAdminReader.findBreederById.mockResolvedValue({
            id: 'breeder-1',
            name: '행복농장',
            accountStatus: 'suspended',
            isTestAccount: false,
        });

        await expect(
            useCase.execute('admin-1', 'breeder-1', {
                reason: '운영 정책 위반',
            }),
        ).rejects.toThrow(new BadRequestException('이미 정지된 계정입니다.'));
    });
});
