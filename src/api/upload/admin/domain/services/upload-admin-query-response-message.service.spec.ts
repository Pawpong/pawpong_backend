import { UploadAdminQueryResponseMessageService } from './upload-admin-query-response-message.service';

describe('관리자 업로드 조회 메시지 서비스', () => {
    const service = new UploadAdminQueryResponseMessageService();

    it('관리자 파일 조회와 참조 확인 메시지를 일관되게 만든다', () => {
        expect(service.filesListed()).toBe('파일 목록 조회 완료');
        expect(service.folderFilesListed('banner')).toBe('banner 폴더 파일 목록 조회 완료');
        expect(service.fileReferencesChecked()).toBe('DB 참조 확인 완료');
        expect(service.referencedFilesListed()).toBe('DB 참조 파일 목록 조회 완료');
    });
});
