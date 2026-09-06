jest.mock('../../../../../../common/mail/mail-template.service', () => ({ MailTemplateService: class {} }));

import { BreederVerificationAdminNotifierAdapter } from '../../infrastructure/breeder-verification-admin-notifier.adapter';

describe('브리더 입점 승인 알림 — 이동 경로', () => {
    it('마이홈으로 보낸다 (targetUrl 이 없으면 눌러도 아무 일이 없다)', async () => {
        const builder: Record<string, jest.Mock> = {};
        for (const name of ['type', 'title', 'content', 'targetUrl', 'related', 'metadata', 'withEmail', 'withPush']) {
            builder[name] = jest.fn().mockReturnValue(builder);
        }
        builder.send = jest.fn().mockResolvedValue({});

        const adapter = new BreederVerificationAdminNotifierAdapter(
            { getBreederApprovalEmail: jest.fn() } as any,
            { to: jest.fn().mockReturnValue(builder) } as any,
        );

        await adapter.sendApproval({ breederId: 'breeder-1', breederName: '켄넬' } as any);

        expect(builder.targetUrl).toHaveBeenCalledWith('/home');
    });
});
