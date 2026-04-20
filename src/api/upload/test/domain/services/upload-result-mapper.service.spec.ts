import { UploadResultMapperService } from '../../../domain/services/upload-result-mapper.service';

function makeFile(size = 1024): Express.Multer.File {
    return {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size,
        buffer: Buffer.from(''),
        destination: '',
        filename: 'test.jpg',
        path: '',
        stream: null as any,
    };
}

describe('UploadResultMapperService', () => {
    const service = new UploadResultMapperService();
    const resource = { fileName: 'uploads/a.jpg', cdnUrl: 'https://cdn.example.com/a.jpg', storageUrl: 'https://s3.example.com/a.jpg' };

    it('단일 리소스를 결과로 변환한다 (url = cdnUrl)', () => {
        const result = service.toResult(resource, makeFile(512));
        expect(result.url).toBe('https://cdn.example.com/a.jpg');
        expect(result.cdnUrl).toBe('https://cdn.example.com/a.jpg');
        expect(result.size).toBe(512);
    });

    it('다중 리소스를 각 파일 크기와 함께 변환한다', () => {
        const results = service.toResults([resource, resource], [makeFile(100), makeFile(200)]);
        expect(results).toHaveLength(2);
        expect(results[0].size).toBe(100);
        expect(results[1].size).toBe(200);
    });
});
