import { ForbiddenException } from '@nestjs/common';

import { RemindType } from '../../constants/breeder-remind.enum';
import { SendBreederRemindNotificationsUseCase } from './send-breeder-remind-notifications.use-case';
import { BreederAdminActivityLogFactoryService } from '../../domain/services/breeder-admin-activity-log-factory.service';
import { BreederAdminPolicyService } from '../../domain/services/breeder-admin-policy.service';
import { BreederAdminReminderPresentationService } from '../../domain/services/breeder-admin-reminder-presentation.service';
import { BreederAdminReminderPolicyService } from '../../domain/services/breeder-admin-reminder-policy.service';

describe('브리더 리마인드 알림 발송 유스케이스', () => {
    const breederAdminReader = {
        findAdminById: jest.fn(),
        findBreederById: jest.fn(),
    };
    const breederAdminWriter = {
        appendAdminActivityLog: jest.fn(),
    };
    const breederAdminNotifier = {
        sendReminder: jest.fn(),
    };

    const useCase = new SendBreederRemindNotificationsUseCase(
        breederAdminReader as any,
        breederAdminWriter as any,
        breederAdminNotifier as any,
        new BreederAdminPolicyService(),
        new BreederAdminActivityLogFactoryService(),
        new BreederAdminReminderPresentationService(),
        new BreederAdminReminderPolicyService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('대상 상태가 맞는 브리더에게만 리마인드를 발송한다', async () => {
        breederAdminReader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            name: '관리자',
            permissions: { canManageBreeders: true },
        });
        breederAdminReader.findBreederById
            .mockResolvedValueOnce({
                id: 'breeder-1',
                name: '행복농장',
                nickname: '행복브리더',
                emailAddress: 'breeder1@test.com',
                accountStatus: 'active',
                isTestAccount: false,
                verification: { status: 'pending' },
            })
            .mockResolvedValueOnce({
                id: 'breeder-2',
                name: '튼튼농장',
                nickname: '튼튼브리더',
                emailAddress: 'breeder2@test.com',
                accountStatus: 'active',
                isTestAccount: false,
                verification: { status: 'approved' },
            });

        const result = await useCase.execute('admin-1', {
            breederIds: ['breeder-1', 'breeder-2'],
            remindType: RemindType.DOCUMENT_REMINDER,
        });

        expect(breederAdminNotifier.sendReminder).toHaveBeenCalledTimes(1);
        expect(breederAdminNotifier.sendReminder).toHaveBeenCalledWith(
            expect.objectContaining({
                recipient: expect.objectContaining({
                    breederId: 'breeder-1',
                    breederName: '행복브리더',
                }),
                targetUrl: '/profile/documents',
            }),
        );
        expect(result).toEqual(
            expect.objectContaining({
                totalCount: 2,
                successCount: 1,
                failCount: 1,
                successIds: ['breeder-1'],
                failIds: ['breeder-2'],
            }),
        );
    });

    it('권한이 없으면 예외를 던진다', async () => {
        breederAdminReader.findAdminById.mockResolvedValue(null);

        await expect(
            useCase.execute('admin-1', {
                breederIds: ['breeder-1'],
                remindType: RemindType.DOCUMENT_REMINDER,
            }),
        ).rejects.toThrow(new ForbiddenException('브리더 관리 권한이 없습니다.'));
    });
});
