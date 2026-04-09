import { UploadAdminCommandResponseMessageService } from './upload-admin-command-response-message.service';

describe('관리자 업로드 명령 메시지 서비스', () => {
    const service = new UploadAdminCommandResponseMessageService();

    it('관리자 파일 삭제 메시지를 일관되게 만든다', () => {
        expect(service.fileDeleted()).toBe('파일이 삭제되었습니다.');
        expect(service.filesDeleted()).toBe('파일 삭제가 완료되었습니다.');
        expect(service.folderDeleted('banner')).toBe('banner 폴더가 삭제되었습니다.');
    });
});
