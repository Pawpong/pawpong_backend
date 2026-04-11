import { UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../../constants/upload-admin-response-messages';

describe('관리자 업로드 참조 조회 메시지 상수', () => {
    it('관리자 참조 조회 메시지를 일관되게 만든다', () => {
        expect(UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.fileReferencesChecked).toBe('DB 참조 확인 완료');
        expect(UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.referencedFilesListed).toBe('DB 참조 파일 목록 조회 완료');
    });
});
