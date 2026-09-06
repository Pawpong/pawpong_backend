jest.mock('../../../../../common/alimtalk/alimtalk.service', () => ({ AlimtalkService: class {} }));
jest.mock('../../../../../common/mail/mail-template.service', () => ({ MailTemplateService: class {} }));

import { AdopterApplicationNotifierAdapter } from '../../infrastructure/adopter-application-notifier.adapter';

describe('상담 신청 알림 — 눌렀을 때 이동할 곳이 있어야 한다', () => {
    function setup() {
        const builder: Record<string, jest.Mock> = {};
        for (const name of ['type', 'title', 'content', 'targetUrl', 'related', 'metadata', 'withEmail', 'withPush']) {
            builder[name] = jest.fn().mockReturnValue(builder);
        }
        builder.send = jest.fn().mockResolvedValue({});
        const notificationDispatchPort = { to: jest.fn().mockReturnValue(builder) };
        const adapter = new AdopterApplicationNotifierAdapter(
            { getNewApplicationEmail: jest.fn(), getApplicationConfirmationEmail: jest.fn() } as any,
            { sendConsultationRequest: jest.fn().mockResolvedValue(undefined) } as any,
            notificationDispatchPort as any,
        );
        return { adapter, builder };
    }

    it('브리더가 받는 새 상담 신청 알림은 받은 신청 상세로 보낸다', async () => {
        const { adapter, builder } = setup();

        await adapter.notifyBreederOfNewApplication(
            { _id: { toString: () => 'breeder-1' }, name: '켄넬' } as any,
            'app-1',
        );

        expect(builder.targetUrl).toHaveBeenCalledWith('/activity/applications/app-1');
    });

    it('신청자가 받는 접수 확인 알림도 같은 신청 상세로 보낸다', async () => {
        const { adapter, builder } = setup();

        await adapter.notifyApplicantApplicationConfirmed({
            applicantId: 'adopter-1',
            applicantRole: 'adopter',
            applicantName: '홍',
            applicantEmail: '',
            breederName: '켄넬',
            applicationId: 'app-1',
        });

        expect(builder.targetUrl).toHaveBeenCalledWith('/activity/applications/app-1');
    });

    it('브리더가 신청자인 경우에도 신청 상세 링크가 붙는다', async () => {
        const { adapter, builder } = setup();

        await adapter.notifyApplicantApplicationConfirmed({
            applicantId: 'breeder-2',
            applicantRole: 'breeder',
            applicantName: '켄넬2',
            applicantEmail: '',
            breederName: '켄넬',
            applicationId: 'app-2',
        });

        expect(builder.targetUrl).toHaveBeenCalledWith('/activity/applications/app-2');
    });
});
