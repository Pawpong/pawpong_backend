import { UploadStoredFilePathService } from '../../../domain/services/upload-stored-file-path.service';

describe('UploadStoredFilePathService', () => {
    const service = new UploadStoredFilePathService();
    const bucket = 'pawpong_active';

    describe('extractStoredPath', () => {
        it('빈 문자열은 빈 문자열을 반환한다', () => {
            expect(service.extractStoredPath('', bucket)).toBe('');
        });

        it('http 스킴이 아니면 버킷 프리픽스만 제거한다', () => {
            expect(service.extractStoredPath(`${bucket}/folder/file.jpg`, bucket)).toBe('folder/file.jpg');
        });

        it('레거시 버킷(pawpong_bucket) 프리픽스도 제거한다', () => {
            expect(service.extractStoredPath('pawpong_bucket/folder/file.jpg', bucket)).toBe('folder/file.jpg');
        });

        it('object.iwinv.kr 호스트의 URL에서 버킷 프리픽스를 제거한다', () => {
            expect(
                service.extractStoredPath(`https://object.iwinv.kr/${bucket}/folder/file.jpg`, bucket),
            ).toBe('folder/file.jpg');
        });

        it('다른 호스트의 URL은 pathname만 반환한다', () => {
            expect(service.extractStoredPath('https://cdn.example.com/folder/file.jpg', bucket)).toBe('folder/file.jpg');
        });

        it('URL 파싱에 실패하면 원본을 반환한다', () => {
            expect(service.extractStoredPath('not-a-url', bucket)).toBe('not-a-url');
        });
    });

    describe('extractStoredPaths', () => {
        it('여러 URL을 변환한다', () => {
            const result = service.extractStoredPaths([
                `${bucket}/a.jpg`,
                'pawpong_bucket/b.jpg',
            ], bucket);
            expect(result).toEqual(['a.jpg', 'b.jpg']);
        });

        it('빈 문자열을 필터링한다', () => {
            const result = service.extractStoredPaths(['', `${bucket}/ok.jpg`], bucket);
            expect(result).toEqual(['ok.jpg']);
        });
    });
});
