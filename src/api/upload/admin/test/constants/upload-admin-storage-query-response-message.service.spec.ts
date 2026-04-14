import {
    buildUploadAdminFolderFilesListedMessage,
    UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES,
} from '../../constants/upload-admin-response-messages';

describe('관리자 업로드 저장소 조회 메시지 상수', () => {
    it('관리자 파일 조회 메시지를 일관되게 만든다', () => {
        expect(UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.filesListed).toBe('파일 목록 조회 완료');
        expect(buildUploadAdminFolderFilesListedMessage('banner')).toBe('banner 폴더 파일 목록 조회 완료');
    });
});
