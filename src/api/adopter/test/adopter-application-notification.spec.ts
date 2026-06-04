// StorageService 는 내부적으로 ESM-only 패키지(uuid v13)를 import 하므로,
// 유닛 테스트에서는 모듈을 통째로 모킹해 ts-jest 변환 체인에서 제외한다.
jest.mock('../../../common/storage/storage.service', () => ({ StorageService: class {} }));

import { AdopterService } from '../adopter.service';

/**
 * 상담 신청 시 브리더에게 카카오 알림톡(CONSULTATION_REQUEST)이 발송되는지 검증하는 유닛 테스트.
 *
 * 핫픽스 배경:
 * - 기존에는 sendNewApplicationNotification 이 인앱 알림 + 이메일만 발송하고
 *   알림톡 호출이 누락되어 있어, 브리더가 상담 신청 알림톡을 받지 못했다.
 * - 알림톡 발송 실패가 상담 신청 자체를 실패시키면 안 되므로 fire-and-forget 으로 처리한다.
 */
describe('AdopterService - 상담 신청 알림톡 발송', () => {
    let service: AdopterService;
    let alimtalkService: { sendConsultationRequest: jest.Mock };
    let notificationBuilder: {
        type: jest.Mock;
        title: jest.Mock;
        content: jest.Mock;
        related: jest.Mock;
        withEmail: jest.Mock;
        send: jest.Mock;
    };
    let notificationService: { to: jest.Mock };
    let mailTemplateService: { getNewApplicationEmail: jest.Mock };

    beforeEach(() => {
        // notificationService.to() 가 반환하는 builder 체인 모킹 (모든 체이닝 메서드는 자기 자신 반환)
        notificationBuilder = {
            type: jest.fn().mockReturnThis(),
            title: jest.fn().mockReturnThis(),
            content: jest.fn().mockReturnThis(),
            related: jest.fn().mockReturnThis(),
            withEmail: jest.fn().mockReturnThis(),
            send: jest.fn().mockResolvedValue({}),
        };
        notificationService = {
            to: jest.fn().mockReturnValue(notificationBuilder),
        };
        mailTemplateService = {
            getNewApplicationEmail: jest.fn().mockReturnValue({ subject: '제목', html: '<p>본문</p>' }),
        };
        alimtalkService = {
            sendConsultationRequest: jest.fn().mockResolvedValue({ success: true }),
        };

        // sendNewApplicationNotification 에서 사용하지 않는 의존성은 빈 객체로 주입한다.
        service = new AdopterService(
            {} as any, // storageService
            {} as any, // mailService
            mailTemplateService as any,
            notificationService as any,
            {} as any, // discordWebhookService
            alimtalkService as any,
            {} as any, // adopterRepository
            {} as any, // breederRepository
            {} as any, // availablePetManagementRepository
            {} as any, // breederModel
            {} as any, // breederReviewModel
            {} as any, // adoptionApplicationModel
        );
    });

    /** private 메서드를 직접 호출하기 위한 헬퍼 */
    const notify = (breeder: any): Promise<void> => (service as any).sendNewApplicationNotification(breeder);

    it('브리더 전화번호가 있으면 상담 신청 알림톡을 해당 번호로 발송한다', async () => {
        await notify({ _id: 'breeder-1', phoneNumber: '01012345678', emailAddress: null });

        expect(alimtalkService.sendConsultationRequest).toHaveBeenCalledTimes(1);
        expect(alimtalkService.sendConsultationRequest).toHaveBeenCalledWith('01012345678');
    });

    it('브리더 전화번호가 없으면 알림톡을 발송하지 않는다', async () => {
        await notify({ _id: 'breeder-1', phoneNumber: undefined, emailAddress: null });

        expect(alimtalkService.sendConsultationRequest).not.toHaveBeenCalled();
    });

    it('인앱 알림(notificationService)은 항상 발송된다', async () => {
        await notify({ _id: 'breeder-1', phoneNumber: '01012345678', emailAddress: null });

        expect(notificationService.to).toHaveBeenCalledTimes(1);
        expect(notificationBuilder.send).toHaveBeenCalledTimes(1);
    });

    it('알림톡 발송이 실패해도 예외를 던지지 않는다 (상담 신청은 성공해야 한다)', async () => {
        alimtalkService.sendConsultationRequest.mockRejectedValue(new Error('CoolSMS 장애'));

        await expect(notify({ _id: 'breeder-1', phoneNumber: '01012345678', emailAddress: null })).resolves.toBeUndefined();
    });
});
