import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notice-response-messages';
import { NoticeCommandResponseMessageService } from '../domain/services/notice-command-response-message.service';

describe('공지사항 명령 응답 메시지 서비스', () => {
    const service = new NoticeCommandResponseMessageService();

    it('생성, 수정, 삭제 메시지 계약을 유지한다', () => {
        expect(service.noticeCreated()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeCreated);
        expect(service.noticeUpdated()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeUpdated);
        expect(service.noticeDeleted()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDeleted);
    });
});
