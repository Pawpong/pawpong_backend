import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeFaqWriteResponseMessageService } from '../domain/services/home-faq-write-response-message.service';

describe('홈 자주 묻는 질문 쓰기 응답 메시지 서비스', () => {
    const service = new HomeFaqWriteResponseMessageService();

    it('자주 묻는 질문 생성과 수정 메시지 계약을 유지한다', () => {
        expect(service.faqCreated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqCreated);
        expect(service.faqUpdated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqUpdated);
    });
});
