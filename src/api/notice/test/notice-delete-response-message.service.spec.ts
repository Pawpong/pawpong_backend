import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notice-response-messages';
import { NoticeDeleteResponseMessageService } from '../domain/services/notice-delete-response-message.service';

describe('공지사항 삭제 응답 메시지 서비스', () => {
    const service = new NoticeDeleteResponseMessageService();

    it('삭제 메시지 계약을 유지한다', () => {
        expect(service.noticeDeleted()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDeleted);
    });
});
