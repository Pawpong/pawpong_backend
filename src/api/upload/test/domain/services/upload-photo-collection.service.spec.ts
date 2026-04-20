import { UploadPhotoCollectionService } from '../../../domain/services/upload-photo-collection.service';

describe('UploadPhotoCollectionService', () => {
    const service = new UploadPhotoCollectionService();

    describe('resolveExistingPhotoPaths', () => {
        it('요청 경로가 있으면 요청 경로를 반환한다', () => {
            expect(service.resolveExistingPhotoPaths(['a.jpg'], ['b.jpg'])).toEqual(['a.jpg']);
        });

        it('요청 경로가 비어있으면 저장된 경로를 반환한다', () => {
            expect(service.resolveExistingPhotoPaths([], ['b.jpg'])).toEqual(['b.jpg']);
        });
    });

    describe('mergePhotoPaths', () => {
        it('기존 경로와 신규 경로를 순서대로 병합한다', () => {
            expect(service.mergePhotoPaths(['a.jpg'], ['b.jpg', 'c.jpg'])).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
        });

        it('빈 배열도 처리한다', () => {
            expect(service.mergePhotoPaths([], [])).toEqual([]);
        });
    });
});
