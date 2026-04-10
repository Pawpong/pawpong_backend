import { buildUploadAdminFolderDeletedMessage } from '../../constants/upload-admin-response-messages';

describe('관리자 업로드 폴더 삭제 메시지 상수', () => {
    it('관리자 폴더 삭제 메시지를 일관되게 만든다', () => {
        expect(buildUploadAdminFolderDeletedMessage('banner')).toBe('banner 폴더가 삭제되었습니다.');
    });
});
