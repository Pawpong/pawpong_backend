import { BadRequestException } from '@nestjs/common';

import { NotificationType } from '../../../../../../common/enum/user.enum';
import { SendAdminPushUseCase } from '../../../application/use-cases/send-admin-push.use-case';
import { AdminPushTargetValidatorService } from '../../../domain/services/admin-push-target-validator.service';

describe('SendAdminPushUseCase', () => {
    const recipientReader = { readRecipients: jest.fn() };
    const notificationCommand = { create: jest.fn(), createMany: jest.fn() };
    const notificationPush = { sendToTokens: jest.fn() };

    const useCase = new SendAdminPushUseCase(
        recipientReader as any,
        notificationCommand as any,
        notificationPush as any,
        new AdminPushTargetValidatorService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
        notificationCommand.createMany.mockResolvedValue(undefined);
    });

    const validCmd = () => ({
        target: { type: 'all_adopters' as const },
        title: '공지 제목',
        body: '공지 본문',
    });

    it('target 검증 실패 → BadRequest, downstream 호출 안 함', async () => {
        await expect(
            useCase.execute({
                ...validCmd(),
                target: { type: 'individual', role: 'adopter', userId: '' } as any,
            }),
        ).rejects.toThrow(BadRequestException);
        expect(recipientReader.readRecipients).not.toHaveBeenCalled();
    });

    it('title/body trim 후 비어있으면 BadRequest', async () => {
        await expect(useCase.execute({ ...validCmd(), title: '   ' })).rejects.toThrow(BadRequestException);
        await expect(useCase.execute({ ...validCmd(), body: '   ' })).rejects.toThrow(BadRequestException);
    });

    it('individual + 수신자 없음 → BadRequest (잘못된 userId)', async () => {
        recipientReader.readRecipients.mockResolvedValueOnce([]);
        await expect(
            useCase.execute({
                ...validCmd(),
                target: { type: 'individual', role: 'adopter', userId: '507f1f77bcf86cd799439099' },
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('all_adopters + 수신자 0명 → 200 (전체 broadcast 는 빈 결과 허용)', async () => {
        recipientReader.readRecipients.mockResolvedValueOnce([]);
        const result = await useCase.execute(validCmd());
        expect(result.recipients).toBe(0);
        expect(result.notificationsCreated).toBe(0);
        expect(result.pushTokensTargeted).toBe(0);
        expect(notificationPush.sendToTokens).not.toHaveBeenCalled();
    });

    it('정상 — notification doc 일괄 생성 + FCM chunk 발송 + 카운트 집계', async () => {
        // 700 토큰 → 500 + 200 두 chunk
        const recipients = [
            { userId: 'a-1', userRole: 'adopter' as const, tokens: Array.from({ length: 500 }, (_, i) => `t-${i}`) },
            {
                userId: 'a-2',
                userRole: 'adopter' as const,
                tokens: Array.from({ length: 200 }, (_, i) => `t-${500 + i}`),
            },
        ];
        recipientReader.readRecipients.mockResolvedValueOnce(recipients);
        notificationPush.sendToTokens
            .mockResolvedValueOnce(
                Array.from({ length: 500 }, (_, i) => ({ token: `t-${i}`, success: true, invalidToken: false })),
            )
            .mockResolvedValueOnce(
                Array.from({ length: 200 }, (_, i) => ({
                    token: `t-${500 + i}`,
                    success: i % 10 !== 0, // 20개 실패
                    invalidToken: i % 50 === 0, // 4개 invalid
                })),
            );

        const result = await useCase.execute(validCmd());

        // createMany를 한 번에 모든 수신자 command 배열로 호출
        expect(notificationCommand.createMany).toHaveBeenCalledTimes(1);
        const commands = notificationCommand.createMany.mock.calls[0][0];
        expect(commands).toHaveLength(2);
        expect(commands[0]).toMatchObject({
            userId: 'a-1',
            type: NotificationType.ADMIN_BROADCAST,
            title: '공지 제목',
            body: '공지 본문',
        });

        expect(notificationPush.sendToTokens).toHaveBeenCalledTimes(2);
        expect(notificationPush.sendToTokens.mock.calls[0][0]).toHaveLength(500);
        expect(notificationPush.sendToTokens.mock.calls[1][0]).toHaveLength(200);

        expect(result.recipients).toBe(2);
        expect(result.notificationsCreated).toBe(2);
        expect(result.pushTokensTargeted).toBe(700);
        expect(result.pushSuccess).toBe(500 + 180); // 200 중 180 success
        expect(result.pushFailed).toBe(20);
        expect(result.invalidTokens).toBe(4);
    });

    it('createMany 실패 시 경고 로그 후 broadcast 계속 진행, notificationsCreated=0', async () => {
        const recipients = [
            { userId: 'a-1', userRole: 'adopter' as const, tokens: ['t-1'] },
            { userId: 'a-2', userRole: 'adopter' as const, tokens: ['t-2'] },
        ];
        recipientReader.readRecipients.mockResolvedValueOnce(recipients);
        notificationCommand.createMany.mockRejectedValueOnce(new Error('bulk write error'));
        notificationPush.sendToTokens.mockResolvedValueOnce([
            { token: 't-1', success: true, invalidToken: false },
            { token: 't-2', success: true, invalidToken: false },
        ]);

        const result = await useCase.execute(validCmd());

        expect(result.recipients).toBe(2);
        // createMany 전체 실패 → notificationsCreated 보수적으로 0
        expect(result.notificationsCreated).toBe(0);
        expect(result.pushTokensTargeted).toBe(2);
        expect(result.pushSuccess).toBe(2);
    });
});
