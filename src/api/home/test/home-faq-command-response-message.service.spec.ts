import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeFaqCommandResponseMessageService } from '../domain/services/home-faq-command-response-message.service';

describe('홈 자주 묻는 질문 명령 응답 메시지 서비스', () => {
    const service = new HomeFaqCommandResponseMessageService();

    it('자주 묻는 질문 생성, 수정, 삭제 메시지 계약을 유지한다', () => {
        expect(service.faqCreated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqCreated);
        expect(service.faqUpdated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqUpdated);
        expect(service.faqDeleted()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqDeleted);
    });
});
