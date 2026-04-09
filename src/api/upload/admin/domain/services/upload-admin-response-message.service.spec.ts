import { UploadAdminResponseMessageService } from './upload-admin-response-message.service';

describe('관리자 응답 메시지 업로드 서비스', () => {
    const service = new UploadAdminResponseMessageService();

    it('관리자 파일 조회/삭제 메시지를 일관되게 만든다', () => {
        expect(service.filesListed()).toBe('파일 목록 조회 완료');
        expect(service.folderFilesListed('banner')).toBe('banner 폴더 파일 목록 조회 완료');
        expect(service.fileDeleted()).toBe('파일이 삭제되었습니다.');
        expect(service.filesDeleted()).toBe('파일 삭제가 완료되었습니다.');
        expect(service.folderDeleted('banner')).toBe('banner 폴더가 삭제되었습니다.');
    });

    it('데이터베이스 참조 관련 메시지를 일관되게 만든다', () => {
        expect(service.fileReferencesChecked()).toBe('DB 참조 확인 완료');
        expect(service.referencedFilesListed()).toBe('DB 참조 파일 목록 조회 완료');
    });
});
