import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeFaqDeleteResponseMessageService } from '../domain/services/home-faq-delete-response-message.service';

describe('홈 자주 묻는 질문 삭제 응답 메시지 서비스', () => {
    const service = new HomeFaqDeleteResponseMessageService();

    it('자주 묻는 질문 삭제 메시지 계약을 유지한다', () => {
        expect(service.faqDeleted()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.faqDeleted);
    });
});
