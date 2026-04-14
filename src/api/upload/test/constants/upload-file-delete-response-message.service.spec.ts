import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-response-messages';

describe('파일 삭제 응답 메시지 상수', () => {
    it('파일 삭제 성공 메시지를 일관되게 만든다', () => {
        expect(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.fileDeleted).toBe('파일 삭제 성공');
    });
});
