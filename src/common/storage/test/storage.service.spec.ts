import { StorageService } from '../storage.service';

jest.mock('uuid', () => ({ v4: () => '00000000-0000-4000-8000-000000000000' }));

function makeConfig() {
    return {
        get: jest.fn((key: string) => {
            if (key === 'PAWPONG_TEST_MODE') return 'true';
            if (key === 'SMILESERV_CDN_BASE_URL') return 'https://cdn.test/pawpong_s3';
            return undefined;
        }),
    };
}

function makeFile(originalname = 'photo.png'): Express.Multer.File {
    return {
        fieldname: 'files',
        originalname,
        encoding: '7bit',
        mimetype: 'image/png',
        size: 3,
        buffer: Buffer.from('png'),
        destination: '',
        filename: originalname,
        path: '',
        stream: null as any,
    };
}

describe('StorageService', () => {
    beforeEach(() => {
        process.env.PAWPONG_TEST_MODE = 'true';
    });

    afterEach(() => {
        delete process.env.PAWPONG_TEST_MODE;
    });

    it('업로드 folder 에 버킷 프리픽스가 섞여도 저장 key 에서는 제거한다', async () => {
        const service = new StorageService(makeConfig() as any);

        const uploaded = await service.uploadFile(makeFile(), 'pawpong_s3/community');

        expect(uploaded.fileName).toMatch(/^community\/.+\.png$/);
        expect(uploaded.fileName).not.toContain('pawpong_s3/');
        expect(await service.fileExists(`pawpong_s3/${uploaded.fileName}`)).toBe(true);
    });

    it('CDN URL 생성 시 현재/레거시 버킷 프리픽스를 제거한다', () => {
        const service = new StorageService(makeConfig() as any);

        expect(service.getCdnUrl('pawpong_s3/community/a.png')).toBe('https://cdn.test/pawpong_s3/community/a.png');
        expect(service.generateSignedUrl('pawpong_bucket/community/a.png')).toBe(
            'https://cdn.test/pawpong_s3/community/a.png',
        );
    });
});
