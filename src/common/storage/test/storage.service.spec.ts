import { StorageService } from '../storage.service';

jest.mock('uuid', () => ({ v4: () => '00000000-0000-4000-8000-000000000000' }));

function makeConfig(overrides: Record<string, string | undefined> = {}) {
    const values: Record<string, string | undefined> = {
        PAWPONG_TEST_MODE: 'true',
        SMILESERV_CDN_BASE_URL: 'https://cdn.test/pawpong_s3',
        ...overrides,
    };
    return {
        get: jest.fn((key: string) => values[key]),
    };
}

/** 실 S3 초기화 경로(테스트 모드 아님)를 타도록 최소 설정을 채운다 */
function makeLiveConfig(overrides: Record<string, string | undefined> = {}) {
    return makeConfig({
        PAWPONG_TEST_MODE: undefined,
        SMILESERV_S3_ENDPOINT: 'https://kr.object.iwinv.kr',
        SMILESERV_S3_ACCESS_KEY: 'access',
        SMILESERV_S3_SECRET_KEY: 'secret',
        SMILESERV_S3_BUCKET: 'pawpong_s3',
        SMILESERV_CDN_BASE_URL: 'https://kr.object.iwinv.kr/pawpong_s3',
        ...overrides,
    });
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

    describe('테스트 모드 오사용 차단', () => {
        // 실서버에서 인메모리 모드로 뜨면 업로드가 200 을 반환하면서 파일이 사라진다.
        // 조용히 유실되게 두지 않고 부팅을 막는 것이 이 가드의 목적이다.
        it.each(['production', 'development', undefined])(
            'NODE_ENV=%s 에서 PAWPONG_TEST_MODE=true 면 생성에 실패한다',
            (nodeEnv) => {
                const original = process.env.NODE_ENV;
                if (nodeEnv === undefined) delete process.env.NODE_ENV;
                else process.env.NODE_ENV = nodeEnv;

                try {
                    expect(() => new StorageService(makeConfig() as any)).toThrow(/NODE_ENV=test 에서만 허용/);
                } finally {
                    process.env.NODE_ENV = original;
                }
            },
        );

        it('NODE_ENV=test 면 인메모리 모드로 정상 동작한다', async () => {
            const service = new StorageService(makeConfig() as any);

            const uploaded = await service.uploadFile(makeFile(), 'community');

            expect(await service.fileExists(uploaded.fileName)).toBe(true);
        });
    });

    describe('버킷과 CDN base URL 정합', () => {
        beforeEach(() => {
            delete process.env.PAWPONG_TEST_MODE;
        });

        it('두 값이 같은 버킷을 가리키면 정상 초기화된다', () => {
            expect(() => new StorageService(makeLiveConfig() as any)).not.toThrow();
        });

        it('버킷만 교체되고 CDN 이 옛 버킷을 가리키면 생성에 실패한다', () => {
            const config = makeLiveConfig({
                SMILESERV_S3_BUCKET: 'pawpong_s3_new',
                SMILESERV_CDN_BASE_URL: 'https://kr.object.iwinv.kr/pawpong_s3',
            });

            expect(() => new StorageService(config as any)).toThrow(/서로 다른 버킷을 가리킵니다/);
        });

        it('레거시 버킷명(pawpong_bucket)이 CDN 에 남아 있어도 잡아낸다', () => {
            const config = makeLiveConfig({
                SMILESERV_S3_BUCKET: 'pawpong_s3',
                SMILESERV_CDN_BASE_URL: 'https://kr.object.iwinv.kr/pawpong_bucket',
            });

            expect(() => new StorageService(config as any)).toThrow(/서로 다른 버킷을 가리킵니다/);
        });

        it('버킷을 직접 노출하지 않는 CDN 도메인은 막지 않는다', () => {
            const config = makeLiveConfig({ SMILESERV_CDN_BASE_URL: 'https://cdn.pawpong.kr' });

            expect(() => new StorageService(config as any)).not.toThrow();
        });
    });
});
