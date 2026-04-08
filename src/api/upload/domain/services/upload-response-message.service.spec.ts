import { UploadResponseMessageService } from './upload-response-message.service';

describe('UploadResponseMessageService', () => {
    const service = new UploadResponseMessageService();

    it('공개 업로드 성공 메시지를 일관되게 만든다', () => {
        expect(service.singleFileUploaded()).toBe('파일 업로드 성공');
        expect(service.multipleFilesUploaded(3)).toBe('3개 파일 업로드 성공');
        expect(service.fileDeleted()).toBe('파일 삭제 성공');
    });

    it('사진 업로드 성공 메시지를 역할별로 만든다', () => {
        expect(service.representativePhotosUploaded()).toBe('대표 사진이 업로드되고 저장되었습니다.');
        expect(service.availablePetPhotosUploaded()).toBe('분양 개체 사진이 업로드되고 저장되었습니다.');
        expect(service.parentPetPhotosUploaded()).toBe('부모견/묘 사진이 업로드되고 저장되었습니다.');
    });
});
