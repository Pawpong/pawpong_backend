import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeFaqQueryResponseMessageService } from '../domain/services/home-faq-query-response-message.service';

describe('홈 자주 묻는 질문 조회 응답 메시지 서비스', () => {
    const service = new HomeFaqQueryResponseMessageService();

    it('자주 묻는 질문 조회 메시지 계약을 유지한다', () => {
        expect(service.faqsRetrieved()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqsRetrieved);
    });
});
