import { UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-admin-response-messages';

describe('관리자 업로드 파일 삭제 메시지 상수', () => {
    it('관리자 파일 삭제 메시지를 일관되게 만든다', () => {
        expect(UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.fileDeleted).toBe('파일이 삭제되었습니다.');
        expect(UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.filesDeleted).toBe('파일 삭제가 완료되었습니다.');
    });
});
