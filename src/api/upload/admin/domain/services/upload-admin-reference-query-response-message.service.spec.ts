import { UploadAdminReferenceQueryResponseMessageService } from './upload-admin-reference-query-response-message.service';

describe('관리자 업로드 참조 조회 메시지 서비스', () => {
    const service = new UploadAdminReferenceQueryResponseMessageService();

    it('관리자 참조 조회 메시지를 일관되게 만든다', () => {
        expect(service.fileReferencesChecked()).toBe('DB 참조 확인 완료');
        expect(service.referencedFilesListed()).toBe('DB 참조 파일 목록 조회 완료');
    });
});
