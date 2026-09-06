jest.mock('../../../../../common/mail/mail-template.service', () => ({ MailTemplateService: class {} }));

import { AdopterReviewNotifierAdapter } from '../../infrastructure/adopter-review-notifier.adapter';

describe('새 후기 알림 — 이동 경로', () => {
    it('받은 후기 탭으로 보낸다 (targetUrl 이 없으면 눌러도 아무 일이 없다)', async () => {
        const builder: Record<string, jest.Mock> = {};
        for (const name of ['type', 'title', 'content', 'targetUrl', 'related', 'metadata', 'withEmail', 'withPush']) {
            builder[name] = jest.fn().mockReturnValue(builder);
        }
        builder.send = jest.fn().mockResolvedValue({});

        const adapter = new AdopterReviewNotifierAdapter(
            { findById: jest.fn().mockResolvedValue({ name: '켄넬', emailAddress: undefined }) } as any,
            { to: jest.fn().mockReturnValue(builder) } as any,
            { getNewReviewEmail: jest.fn() } as any,
        );

        await adapter.notifyBreederOfNewReview('breeder-1');

        expect(builder.targetUrl).toHaveBeenCalledWith('/activity?tab=reviews');
    });
});
