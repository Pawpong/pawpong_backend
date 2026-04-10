import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notice-response-messages';
import { NoticeWriteResponseMessageService } from '../domain/services/notice-write-response-message.service';

describe('공지사항 쓰기 응답 메시지 서비스', () => {
    const service = new NoticeWriteResponseMessageService();

    it('생성과 수정 메시지 계약을 유지한다', () => {
        expect(service.noticeCreated()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeCreated);
        expect(service.noticeUpdated()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeUpdated);
    });
});
