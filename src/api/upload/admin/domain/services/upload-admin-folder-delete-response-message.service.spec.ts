import { UploadAdminFolderDeleteResponseMessageService } from './upload-admin-folder-delete-response-message.service';

describe('관리자 업로드 폴더 삭제 메시지 서비스', () => {
    const service = new UploadAdminFolderDeleteResponseMessageService();

    it('관리자 폴더 삭제 메시지를 일관되게 만든다', () => {
        expect(service.folderDeleted('banner')).toBe('banner 폴더가 삭제되었습니다.');
    });
});
