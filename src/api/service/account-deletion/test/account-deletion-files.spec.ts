import { AccountDeletionFilesAdapter } from '../infrastructure/account-deletion-files.adapter';
import { StorageService } from '../../../../common/storage/storage.service';
import { parseDeletionOperationArgs } from '../../../../scripts/process-account-deletion';
jest.mock('uuid', () => ({ v4: () => 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }));

describe('삭제 파일 경계와 운영 명령', () => {
    const storage = {
        getCdnUrl: () => 'https://cdn.test/pawpong_s3/',
        toFileKey: (value: string) => value.replace('https://cdn.test/pawpong_s3/', ''),
        listObjects: jest.fn(),
        deleteFile: jest.fn(),
    };
    const files = new AccountDeletionFilesAdapter(storage as unknown as StorageService);
    beforeEach(() => jest.clearAllMocks());
    it('외부 URL·공통 정적/AI 관리 에셋·경로 조작은 객체 삭제로 변환하지 않는다', () => {
        for (const value of [
            'https://foreign.invalid/community/one.jpg',
            'https://cdn.test/another_bucket/community/one.jpg',
            '//foreign.invalid/a.jpg',
            '../secret.jpg',
            'images/default.png',
            'ai-image/filter/admin.png',
            'ai-image/reference/admin.png',
            '신분증 원본.pdf',
        ])
            expect(files.resolveKey(value)).toBeNull();
        expect(files.resolveKey('https://cdn.test/pawpong_s3/community/one.jpg')).toBe('community/one.jpg');
    });
    it('1000개를 넘는 HLS 페이지를 끝까지 순회하고 다른 prefix 키는 제외한다', async () => {
        const prefix = 'videos/hls/aaaaaaaaaaaaaaaaaaaaaaaa/';
        storage.listObjects
            .mockResolvedValueOnce({
                Contents: [{ Key: `${prefix}part1.ts` }, { Key: 'other/private.ts' }],
                IsTruncated: true,
                NextContinuationToken: 'next',
            })
            .mockResolvedValueOnce({ Contents: [{ Key: `${prefix}part2.ts` }], IsTruncated: false });
        expect(await files.listPrefix(prefix)).toEqual([`${prefix}part1.ts`, `${prefix}part2.ts`]);
        expect(storage.listObjects).toHaveBeenNthCalledWith(2, prefix, 1000, 'next');
    });
    it('잘못된 전체 prefix/잘린 목록은 성공으로 처리하지 않는다', async () => {
        await expect(files.listPrefix('videos/')).rejects.toThrow('INVALID_DELETION_PREFIX');
        storage.listObjects.mockResolvedValue({ Contents: [], IsTruncated: true });
        await expect(files.listPrefix('videos/hls/aaaaaaaaaaaaaaaaaaaaaaaa/')).rejects.toThrow('INCOMPLETE_FILE_LIST');
    });
    it('운영 CLI는 기본 dry-run, 하나의 job와 명시 apply 없이 파일 승인을 거부한다', () => {
        const job = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
        expect(parseDeletionOperationArgs(['--job', job])).toMatchObject({ apply: false, requestId: job });
        expect(() => parseDeletionOperationArgs(['--all', '--apply'])).toThrow();
        expect(() => parseDeletionOperationArgs(['--job', job, '--job', job, '--apply'])).toThrow();
        expect(() => parseDeletionOperationArgs(['--job', job, '--approve-file', 'one.jpg'])).toThrow();
        expect(parseDeletionOperationArgs(['--job', job, '--approve-file', 'one.jpg', '--apply'])).toMatchObject({
            apply: true,
            approveFile: 'one.jpg',
        });
    });
});
