import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeResponseMessageService } from '../domain/services/home-response-message.service';

describe('홈 응답 메시지 서비스', () => {
    const service = new HomeResponseMessageService();

    it('공개와 관리자 경로가 같은 메시지 계약을 유지한다', () => {
        expect(service.bannersRetrieved()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannersRetrieved);
        expect(service.faqsRetrieved()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqsRetrieved);
        expect(service.availablePetsRetrieved()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.availablePetsRetrieved);
        expect(service.bannerCreated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerCreated);
        expect(service.bannerUpdated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerUpdated);
        expect(service.bannerDeleted()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerDeleted);
        expect(service.faqCreated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqCreated);
        expect(service.faqUpdated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqUpdated);
        expect(service.faqDeleted()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqDeleted);
    });
});
