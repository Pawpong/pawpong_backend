// AlimtalkService / MailTemplateService 는 내부적으로 무거운(또는 ESM-only) 외부 패키지를 import 하므로,
// 유닛 테스트에서는 모듈을 통째로 모킹해 ts-jest 변환 체인에서 제외한다.
jest.mock('../../../../common/alimtalk/alimtalk.service', () => ({ AlimtalkService: class {} }));
jest.mock('../../../../common/mail/mail-template.service', () => ({ MailTemplateService: class {} }));

import { AdopterApplicationNotifierAdapter } from '../../infrastructure/adopter-application-notifier.adapter';

/**
 * 상담 신청 시 브리더에게 카카오 알림톡(CONSULTATION_REQUEST)이 발송되는지 검증하는 유닛 테스트.
 *
 * 핫픽스 배경:
 * - 기존 notifyBreederOfNewApplication 은 인앱 알림 + 이메일 + 푸시만 발송하고
 *   알림톡 호출이 누락되어 브리더가 상담 신청 알림톡을 받지 못했다.
 * - 알림톡 발송 실패가 상담 신청 자체를 실패시키면 안 되므로 fire-and-forget 으로 처리한다.
 */
describe('AdopterApplicationNotifierAdapter - 상담 신청 알림톡 발송', () => {
    let adapter: AdopterApplicationNotifierAdapter;
    let alimtalkService: { sendConsultationRequest: jest.Mock };
    let builder: {
        type: jest.Mock;
        title: jest.Mock;
        content: jest.Mock;
        related: jest.Mock;
        withEmail: jest.Mock;
        withPush: jest.Mock;
        send: jest.Mock;
    };
    let notificationDispatchPort: { to: jest.Mock };
    let mailTemplateService: { getNewApplicationEmail: jest.Mock };

    beforeEach(() => {
        // notificationDispatchPort.to() 가 반환하는 builder 체인 모킹 (체이닝 메서드는 자기 자신 반환)
        builder = {
            type: jest.fn().mockReturnThis(),
            title: jest.fn().mockReturnThis(),
            content: jest.fn().mockReturnThis(),
            related: jest.fn().mockReturnThis(),
            withEmail: jest.fn().mockReturnThis(),
            withPush: jest.fn().mockReturnThis(),
            send: jest.fn().mockResolvedValue({}),
        };
        notificationDispatchPort = {
            to: jest.fn().mockReturnValue(builder),
        };
        mailTemplateService = {
            getNewApplicationEmail: jest.fn().mockReturnValue({ subject: '제목', html: '<p>본문</p>' }),
        };
        alimtalkService = {
            sendConsultationRequest: jest.fn().mockResolvedValue({ success: true }),
        };

        adapter = new AdopterApplicationNotifierAdapter(
            mailTemplateService as any,
            alimtalkService as any,
            notificationDispatchPort as any,
        );
    });

    const target = (overrides: Record<string, unknown> = {}) => ({
        _id: { toString: () => 'breeder-1' },
        name: '꼬뚱팰리스',
        emailAddress: undefined,
        ...overrides,
    });

    it('브리더 전화번호가 있으면 상담 신청 알림톡을 해당 번호로 발송한다', async () => {
        await adapter.notifyBreederOfNewApplication(target({ phoneNumber: '01012345678' }) as any);

        expect(alimtalkService.sendConsultationRequest).toHaveBeenCalledTimes(1);
        expect(alimtalkService.sendConsultationRequest).toHaveBeenCalledWith('01012345678');
    });

    it('브리더 전화번호가 없으면 알림톡을 발송하지 않는다', async () => {
        await adapter.notifyBreederOfNewApplication(target({ phoneNumber: undefined }) as any);

        expect(alimtalkService.sendConsultationRequest).not.toHaveBeenCalled();
    });

    it('인앱 알림(notificationDispatchPort)은 항상 발송된다', async () => {
        await adapter.notifyBreederOfNewApplication(target({ phoneNumber: '01012345678' }) as any);

        expect(notificationDispatchPort.to).toHaveBeenCalledTimes(1);
        expect(builder.send).toHaveBeenCalledTimes(1);
    });

    it('알림톡 발송이 실패해도 예외를 던지지 않는다 (상담 신청은 성공해야 한다)', async () => {
        alimtalkService.sendConsultationRequest.mockRejectedValue(new Error('CoolSMS 장애'));

        await expect(
            adapter.notifyBreederOfNewApplication(target({ phoneNumber: '01012345678' }) as any),
        ).resolves.toBeUndefined();
    });
});
