import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeFaqResponseMessageService } from '../domain/services/home-faq-response-message.service';

describe('홈 FAQ 응답 메시지 서비스', () => {
    const service = new HomeFaqResponseMessageService();

    it('FAQ 조회와 관리자 변경 메시지 계약을 유지한다', () => {
        expect(service.faqsRetrieved()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqsRetrieved);
        expect(service.faqCreated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqCreated);
        expect(service.faqUpdated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqUpdated);
        expect(service.faqDeleted()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqDeleted);
    });
});
